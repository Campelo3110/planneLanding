"use strict";

const crypto = require("crypto");
const admin = require("firebase-admin");
const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const {defineSecret} = require("firebase-functions/params");

admin.initializeApp();

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const rsvpSigningSecret = defineSecret("RSVP_SIGNING_SECRET");

const MAX_SEARCH_RESULTS = 5;
const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 40;
const MAX_EMAIL_LENGTH = 180;
const MAX_FOOD_RESTRICTION_LENGTH = 220;
const RSVP_SOURCE_OPEN = "public_rsvp";
const RSVP_SOURCE_RESERVED = "reserved_rsvp";

function sendJson(res, status, payload) {
  res.status(status).set("Cache-Control", "no-store").json(payload);
}

function setCors(req, res) {
  const origin = req.get("origin") || "";
  const allowed = new Set([
    "https://planneapp.com",
    "https://www.planneapp.com",
    "http://localhost:5000",
    "http://127.0.0.1:5000"
  ]);

  if (allowed.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }

  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeString(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function sanitizeOptionalString(value, maxLength) {
  const sanitized = sanitizeString(value, maxLength);
  return sanitized.length > 0 ? sanitized : "";
}

function parseStatus(value) {
  const status = Number(value);
  return [0, 1, 2].includes(status) ? status : null;
}

function parseCompanionsCount(value, maxCompanions) {
  const count = Number(value || 0);
  if (!Number.isInteger(count) || count < 0 || count > maxCompanions) {
    return null;
  }
  return count;
}

function asDateString(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.toDate) return value.toDate().toISOString();
  return "";
}

function getSigningSecret() {
  const secret = rsvpSigningSecret.value() || process.env.RSVP_SIGNING_SECRET || "";
  return secret.length >= 32 ? secret : "";
}

function signGuestPublicId(eventId, guestId) {
  const secret = getSigningSecret();
  if (!secret) return "";

  const payload = `${eventId}.${guestId}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

function verifyGuestPublicId(publicId, expectedEventId) {
  const secret = getSigningSecret();
  if (!secret || !publicId) return null;

  let decoded = "";
  try {
    decoded = Buffer.from(String(publicId), "base64url").toString("utf8");
  } catch (error) {
    return null;
  }

  const parts = decoded.split(".");
  if (parts.length !== 3) return null;

  const [eventId, guestId, signature] = parts;
  if (eventId !== expectedEventId || !guestId || !signature) return null;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${eventId}.${guestId}`)
    .digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return guestId;
}

function publicEventData(eventDoc) {
  const data = eventDoc.data() || {};
  const maxCompanions = Number(data.rsvpMaxCompanions || 0);
  const allowedDesigns = new Set(["clean", "warm", "formal"]);
  const rsvpDesign = allowedDesigns.has(data.rsvpDesign) ? data.rsvpDesign : "clean";

  return {
    valid: true,
    eventName: sanitizeString(data.name || "Evento Planne", 160),
    eventDate: asDateString(data.date),
    rsvpMode: data.rsvpMode === "open" ? "open" : "reserved",
    rsvpDesign,
    allowCompanions: data.rsvpAllowCompanions === true,
    maxCompanions: Number.isInteger(maxCompanions) && maxCompanions > 0
      ? Math.min(maxCompanions, 20)
      : 0,
    requireApproval: data.rsvpRequireApproval !== false
  };
}

async function getEventByToken(token) {
  const eventToken = sanitizeString(token, 160);
  if (!eventToken) return null;

  const snap = await db
    .collection("events")
    .where("rsvpPublicToken", "==", eventToken)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const eventDoc = snap.docs[0];
  const eventData = eventDoc.data() || {};
  if (eventData.isDeleted === true || eventData.rsvpEnabled !== true) return null;

  return eventDoc;
}

async function handleEvent(req, res) {
  const eventDoc = await getEventByToken(req.query.token);
  if (!eventDoc) {
    sendJson(res, 404, {valid: false, message: "Este link esta invalido ou expirado."});
    return;
  }

  sendJson(res, 200, publicEventData(eventDoc));
}

function guestSearchMatch(guestData, query) {
  const normalized = normalizeText(guestData.normalizedName || guestData.name);
  return normalized.includes(query);
}

async function searchGuests(eventDoc, query) {
  const eventRef = eventDoc.ref;
  const results = [];

  try {
    const prefixSnap = await eventRef
      .collection("guests")
      .where("normalizedName", ">=", query)
      .where("normalizedName", "<=", `${query}\uf8ff`)
      .limit(MAX_SEARCH_RESULTS)
      .get();

    for (const doc of prefixSnap.docs) {
      const data = doc.data() || {};
      if (data.isDeleted === true) continue;
      results.push({id: doc.id, data});
    }
  } catch (error) {
    logger.warn("RSVP normalizedName search failed", {eventId: eventDoc.id});
  }

  if (results.length >= MAX_SEARCH_RESULTS) return results.slice(0, MAX_SEARCH_RESULTS);

  const fallbackSnap = await eventRef
    .collection("guests")
    .where("isDeleted", "==", false)
    .limit(100)
    .get();

  const seen = new Set(results.map((item) => item.id));
  for (const doc of fallbackSnap.docs) {
    if (results.length >= MAX_SEARCH_RESULTS) break;
    if (seen.has(doc.id)) continue;

    const data = doc.data() || {};
    if (!guestSearchMatch(data, query)) continue;

    results.push({id: doc.id, data});
  }

  return results.slice(0, MAX_SEARCH_RESULTS);
}

async function handleSearchGuest(req, res) {
  const eventDoc = await getEventByToken(req.body && req.body.eventToken);
  const name = sanitizeString(req.body && req.body.name, MAX_NAME_LENGTH);
  const query = normalizeText(name);

  if (!eventDoc || query.length < 2) {
    sendJson(res, 400, {results: []});
    return;
  }

  const eventData = eventDoc.data() || {};
  if (eventData.rsvpMode === "open") {
    sendJson(res, 400, {results: []});
    return;
  }

  const secret = getSigningSecret();
  if (!secret) {
    logger.error("Missing RSVP_SIGNING_SECRET");
    sendJson(res, 500, {message: "Nao foi possivel processar sua solicitacao."});
    return;
  }

  const guests = await searchGuests(eventDoc, query);
  const results = guests.map((guest) => ({
    guestPublicId: signGuestPublicId(eventDoc.id, guest.id),
    displayName: sanitizeString(guest.data.name || "Convidado", MAX_NAME_LENGTH),
    needsPhoneCheck: false
  })).filter((guest) => guest.guestPublicId);

  sendJson(res, 200, {results});
}

function getMaxCompanions(eventData) {
  if (eventData.rsvpAllowCompanions !== true) return 0;
  const max = Number(eventData.rsvpMaxCompanions || 0);
  return Number.isInteger(max) && max > 0 ? Math.min(max, 20) : 0;
}

async function handleRespondReserved(req, res) {
  const eventDoc = await getEventByToken(req.body && req.body.eventToken);
  if (!eventDoc) {
    sendJson(res, 404, {message: "Este link esta invalido ou expirado."});
    return;
  }

  const status = parseStatus(req.body && req.body.status);
  const eventData = eventDoc.data() || {};
  const maxCompanions = getMaxCompanions(eventData);
  const companionsCount = parseCompanionsCount(
    req.body && req.body.companionsCount,
    maxCompanions
  );
  const guestId = verifyGuestPublicId(req.body && req.body.guestPublicId, eventDoc.id);

  if (status === null || companionsCount === null || !guestId) {
    sendJson(res, 400, {message: "Nao foi possivel processar sua resposta."});
    return;
  }

  const foodRestriction = sanitizeOptionalString(
    req.body && req.body.foodRestriction,
    MAX_FOOD_RESTRICTION_LENGTH
  );

  const guestRef = eventDoc.ref.collection("guests").doc(guestId);
  const guestDoc = await guestRef.get();
  if (!guestDoc.exists || (guestDoc.data() || {}).isDeleted === true) {
    sendJson(res, 404, {message: "Nao foi possivel processar sua resposta."});
    return;
  }

  await guestRef.set({
    confirmationStatus: status,
    rsvpRespondedAt: FieldValue.serverTimestamp(),
    rsvpResponseSource: RSVP_SOURCE_RESERVED,
    rsvpCompanionsCount: companionsCount,
    rsvpFoodRestriction: foodRestriction,
    updatedAt: FieldValue.serverTimestamp(),
    version: FieldValue.increment(1)
  }, {merge: true});

  await db.collection("rsvp_requests").add({
    eventId: eventDoc.id,
    eventRsvpToken: sanitizeString(req.body.eventToken, 160),
    guestId,
    name: sanitizeString((guestDoc.data() || {}).name || "", MAX_NAME_LENGTH),
    normalizedName: normalizeText((guestDoc.data() || {}).name || ""),
    status: "convertedToGuest",
    confirmationStatus: status,
    companionsCount,
    foodRestriction,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    source: RSVP_SOURCE_RESERVED
  });

  sendJson(res, 200, {
    ok: true,
    message: status === 1 ? "Sua presenca foi confirmada." : "Sua resposta foi enviada."
  });
}

async function createGuestFromOpenRequest(eventDoc, requestData) {
  const guestRef = eventDoc.ref.collection("guests").doc();

  await guestRef.set({
    name: requestData.name,
    normalizedName: requestData.normalizedName,
    phone: requestData.phone,
    email: requestData.email,
    confirmationStatus: requestData.confirmationStatus,
    guestType: "primary",
    rsvpRespondedAt: FieldValue.serverTimestamp(),
    rsvpResponseSource: RSVP_SOURCE_OPEN,
    rsvpCompanionsCount: requestData.companionsCount,
    rsvpFoodRestriction: requestData.foodRestriction,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    isDeleted: false,
    version: 1
  });

  return guestRef.id;
}

async function handleRespondOpen(req, res) {
  const eventDoc = await getEventByToken(req.body && req.body.eventToken);
  if (!eventDoc) {
    sendJson(res, 404, {message: "Este link esta invalido ou expirado."});
    return;
  }

  const eventData = eventDoc.data() || {};
  const status = parseStatus(req.body && req.body.status);
  const maxCompanions = getMaxCompanions(eventData);
  const companionsCount = parseCompanionsCount(
    req.body && req.body.companionsCount,
    maxCompanions
  );
  const name = sanitizeString(req.body && req.body.name, MAX_NAME_LENGTH);
  const normalizedName = normalizeText(name);

  if (status === null || companionsCount === null || normalizedName.length < 2) {
    sendJson(res, 400, {message: "Confira os dados e tente novamente."});
    return;
  }

  const shouldAutoConvert =
    eventData.rsvpMode === "open" && eventData.rsvpRequireApproval === false;

  const requestData = {
    eventId: eventDoc.id,
    eventRsvpToken: sanitizeString(req.body.eventToken, 160),
    name,
    normalizedName,
    phone: sanitizeOptionalString(req.body && req.body.phone, MAX_PHONE_LENGTH),
    email: sanitizeOptionalString(req.body && req.body.email, MAX_EMAIL_LENGTH),
    status: shouldAutoConvert ? "convertedToGuest" : "pending",
    confirmationStatus: status,
    companionsCount,
    foodRestriction: sanitizeOptionalString(
      req.body && req.body.foodRestriction,
      MAX_FOOD_RESTRICTION_LENGTH
    ),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    source: RSVP_SOURCE_OPEN
  };

  if (shouldAutoConvert) {
    requestData.guestId = await createGuestFromOpenRequest(eventDoc, requestData);
  }

  await db.collection("rsvp_requests").add(requestData);

  sendJson(res, 200, {
    ok: true,
    pendingApproval: !shouldAutoConvert,
    message: shouldAutoConvert
      ? "Sua presenca foi confirmada."
      : "Sua solicitacao foi enviada ao organizador."
  });
}

async function routeRequest(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const pathname = new URL(req.url, "https://planneapp.com").pathname;
  const route = pathname.replace(/^\/rsvp/, "") || pathname;

  try {
    if (req.method === "GET" && route === "/event") {
      await handleEvent(req, res);
      return;
    }

    if (req.method === "POST" && route === "/searchGuest") {
      await handleSearchGuest(req, res);
      return;
    }

    if (req.method === "POST" && route === "/respondReserved") {
      await handleRespondReserved(req, res);
      return;
    }

    if (req.method === "POST" && route === "/respondOpen") {
      await handleRespondOpen(req, res);
      return;
    }

    sendJson(res, 404, {message: "Endpoint nao encontrado."});
  } catch (error) {
    logger.error("RSVP request failed", {
      path: pathname,
      method: req.method,
      error: error && error.message ? error.message : String(error)
    });
    sendJson(res, 500, {message: "Nao foi possivel processar sua solicitacao."});
  }
}

exports.rsvp = onRequest({
  region: "us-central1",
  invoker: "public",
  secrets: [rsvpSigningSecret],
  cors: false
}, routeRequest);
