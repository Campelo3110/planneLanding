import Image from "next/image"
import type { ReactNode } from "react"
import {
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ImageIcon,
  MessageCircle,
  Palette,
  UsersRound,
} from "lucide-react"

const tasks = [
  { label: "Confirmar buffet", done: true },
  { label: "Enviar convites", done: true },
  { label: "Ajustar decoracao", done: false },
]

const guests = [
  { initials: "AM", name: "Ana Maria", status: "Confirmado" },
  { initials: "JP", name: "Joao Pedro", status: "Pendente" },
  { initials: "LC", name: "Luiza Costa", status: "Confirmado" },
]

type PhoneScreen = "dashboard" | "budget" | "guests" | "ideas"

function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[2rem] border border-foreground/10 bg-foreground p-2 shadow-2xl shadow-primary/20 ${className}`}>
      <div className="overflow-hidden rounded-[1.55rem] bg-background">
        {children}
      </div>
    </div>
  )
}

export function PhoneMockup({ screen = "dashboard", className = "" }: { screen?: PhoneScreen; className?: string }) {
  return (
    <PhoneFrame className={className}>
      {screen === "dashboard" && <DashboardScreen />}
      {screen === "budget" && <BudgetScreen />}
      {screen === "guests" && <GuestsScreen />}
      {screen === "ideas" && <IdeasScreen />}
    </PhoneFrame>
  )
}

function DashboardScreen() {
  return (
    <>
      <div className="relative h-40">
        <Image
          src="/images/hero-bg.jpg"
          alt="Inspiração visual para evento no Planne"
          fill
          sizes="320px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-medium opacity-85">Casamento</p>
          <h3 className="text-2xl font-bold tracking-tight">Ana & Pedro</h3>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <p className="mt-2 text-lg font-bold text-foreground">42</p>
            <p className="text-[11px] text-muted-foreground">dias</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <CircleDollarSign className="h-4 w-4 text-amber-600" />
            <p className="mt-2 text-lg font-bold text-foreground">82%</p>
            <p className="text-[11px] text-muted-foreground">orcado</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <UsersRound className="h-4 w-4 text-blue-600" />
            <p className="mt-2 text-lg font-bold text-foreground">124</p>
            <p className="text-[11px] text-muted-foreground">pessoas</p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Proximas tarefas</p>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Hoje
            </span>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.label} className="flex items-center gap-3 rounded-lg bg-muted/70 p-3">
                <CheckCircle2 className={`h-4 w-4 ${task.done ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm text-foreground">{task.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function BudgetScreen() {
  return (
    <div className="space-y-5 p-5">
      <div className="rounded-lg bg-primary p-5 text-primary-foreground">
        <p className="text-sm opacity-80">Orcamento total</p>
        <p className="mt-2 text-3xl font-bold">R$ 45.000</p>
        <p className="mt-1 text-xs opacity-80">68% reservado</p>
      </div>

      {[
        { label: "Buffet", value: "R$ 18.000", width: "80%", color: "bg-primary" },
        { label: "Decoracao", value: "R$ 7.200", width: "55%", color: "bg-rose-500" },
        { label: "Fotografia", value: "R$ 5.800", width: "42%", color: "bg-blue-500" },
      ].map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            <p className="text-sm text-muted-foreground">{item.value}</p>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function GuestsScreen() {
  return (
    <div className="space-y-5 p-5">
      <div>
        <p className="text-sm text-muted-foreground">Lista de convidados</p>
        <h3 className="mt-1 text-2xl font-bold text-foreground">124 pessoas</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-2xl font-bold text-green-600">108</p>
          <p className="text-xs text-muted-foreground">confirmados</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-600">16</p>
          <p className="text-xs text-muted-foreground">pendentes</p>
        </div>
      </div>

      <div className="space-y-3">
        {guests.map((guest) => (
          <div key={guest.name} className="flex items-center justify-between rounded-lg bg-muted/70 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {guest.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{guest.name}</p>
                <p className="text-xs text-muted-foreground">{guest.status}</p>
              </div>
            </div>
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
        ))}
      </div>
    </div>
  )
}

function IdeasScreen() {
  return (
    <div className="space-y-5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Moodboard</p>
          <h3 className="mt-1 text-2xl font-bold text-foreground">Ideias salvas</h3>
        </div>
        <Palette className="h-7 w-7 text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {["Mesa posta", "Flores", "Convite", "Entrada"].map((item, index) => (
          <div key={item} className={`h-24 rounded-lg p-3 ${index % 2 === 0 ? "bg-primary/10" : "bg-rose-50"}`}>
            <ImageIcon className={index % 2 === 0 ? "h-5 w-5 text-primary" : "h-5 w-5 text-rose-500"} />
            <p className="mt-8 text-sm font-semibold text-foreground">{item}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted/70 p-4">
        <p className="text-sm font-semibold text-foreground">Notas</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tons claros, flores naturais e mesa com luz quente.
        </p>
      </div>
    </div>
  )
}

export function AppMockup() {
  return (
    <div className="relative mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative mx-auto w-full max-w-[340px]">
        <PhoneMockup screen="dashboard" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orcamento</p>
              <p className="text-3xl font-bold text-foreground">R$ 45k</p>
            </div>
            <CircleDollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[68%] rounded-full bg-primary" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">R$ 14.400 ainda disponiveis</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Convidados</p>
              <p className="text-3xl font-bold text-foreground">96%</p>
            </div>
            <UsersRound className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-3">
            {guests.map((guest) => (
              <div key={guest.name} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {guest.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{guest.name}</p>
                  <p className="text-xs text-muted-foreground">{guest.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-primary" />
            <p className="font-semibold text-foreground">Linha do tempo inteligente</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Fornecedor", "Pagamento", "Checklist"].map((item, index) => (
              <div key={item} className="rounded-lg bg-muted/70 p-4">
                <p className="text-xs font-medium text-primary">Etapa {index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppScreenGallery() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
      <div className="mx-auto w-full max-w-[290px] md:translate-y-10">
        <PhoneMockup screen="budget" />
        <p className="mt-5 text-center text-sm font-medium text-muted-foreground">
          Orcamento sem sustos
        </p>
      </div>
      <div className="mx-auto w-full max-w-[310px]">
        <PhoneMockup screen="guests" />
        <p className="mt-5 text-center text-sm font-medium text-muted-foreground">
          Convidados e confirmacoes
        </p>
      </div>
      <div className="mx-auto w-full max-w-[290px] md:translate-y-10">
        <PhoneMockup screen="ideas" />
        <p className="mt-5 text-center text-sm font-medium text-muted-foreground">
          Ideias e referencias
        </p>
      </div>
    </div>
  )
}

export function AppShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            O app em acao
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Tudo claro antes, durante e depois do evento
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Acompanhe tarefas, convidados, orcamento e proximos passos sem pular entre planilhas, notas e mensagens.
          </p>
        </div>

        <AppMockup />

        <div className="mt-20">
          <AppScreenGallery />
        </div>
      </div>
    </section>
  )
}
