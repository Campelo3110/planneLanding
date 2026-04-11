import Image from "next/image"
import type { ReactNode } from "react"
import type { getCopy } from "@/lib/i18n"
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

type AppCopy = ReturnType<typeof getCopy>["app"]
type PhoneScreen = "dashboard" | "budget" | "guests" | "ideas"

function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[2rem] border border-foreground/10 bg-foreground p-2 shadow-2xl shadow-primary/20 ${className}`}>
      <div className="overflow-hidden rounded-[1.55rem] bg-background">{children}</div>
    </div>
  )
}

export function PhoneMockup({ screen = "dashboard", className = "", copy }: { screen?: PhoneScreen; className?: string; copy: AppCopy }) {
  return (
    <PhoneFrame className={className}>
      {screen === "dashboard" && <DashboardScreen copy={copy} />}
      {screen === "budget" && <BudgetScreen copy={copy} />}
      {screen === "guests" && <GuestsScreen copy={copy} />}
      {screen === "ideas" && <IdeasScreen copy={copy} />}
    </PhoneFrame>
  )
}

function DashboardScreen({ copy }: { copy: AppCopy }) {
  return (
    <>
      <div className="relative h-40">
        <Image src="/images/hero-bg.jpg" alt="Planne app preview" fill sizes="320px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-medium opacity-85">{copy.labels.eventType}</p>
          <h3 className="text-2xl font-bold tracking-tight">{copy.labels.eventName}</h3>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={<CalendarCheck className="h-4 w-4 text-primary" />} value="42" label={copy.labels.days} className="bg-primary/10" />
          <Stat icon={<CircleDollarSign className="h-4 w-4 text-amber-600" />} value="82%" label={copy.labels.budgeted} className="bg-amber-50 dark:bg-amber-950/40" />
          <Stat icon={<UsersRound className="h-4 w-4 text-blue-600" />} value="124" label={copy.labels.people} className="bg-blue-50 dark:bg-blue-950/40" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{copy.labels.nextTasks}</p>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{copy.labels.today}</span>
          </div>
          <div className="space-y-2">
            {copy.tasks.map((task, index) => (
              <div key={task} className="flex items-center gap-3 rounded-lg bg-muted/70 p-3">
                <CheckCircle2 className={`h-4 w-4 ${index < 2 ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm text-foreground">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function Stat({ icon, value, label, className }: { icon: ReactNode; value: string; label: string; className: string }) {
  return (
    <div className={`rounded-lg p-3 ${className}`}>
      {icon}
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function BudgetScreen({ copy }: { copy: AppCopy }) {
  return (
    <div className="space-y-5 p-5">
      <div className="rounded-lg bg-primary p-5 text-primary-foreground">
        <p className="text-sm opacity-80">{copy.labels.totalBudget}</p>
        <p className="mt-2 text-3xl font-bold">R$ 45.000</p>
        <p className="mt-1 text-xs opacity-80">{copy.labels.reserved}</p>
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

function GuestsScreen({ copy }: { copy: AppCopy }) {
  return (
    <div className="space-y-5 p-5">
      <div>
        <p className="text-sm text-muted-foreground">{copy.labels.guestList}</p>
        <h3 className="mt-1 text-2xl font-bold text-foreground">124 {copy.labels.people}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/40">
          <p className="text-2xl font-bold text-green-600">108</p>
          <p className="text-xs text-muted-foreground">{copy.labels.confirmed}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/40">
          <p className="text-2xl font-bold text-amber-600">16</p>
          <p className="text-xs text-muted-foreground">{copy.labels.pending}</p>
        </div>
      </div>
      <div className="space-y-3">
        {copy.guests.map((guest) => (
          <div key={guest.name} className="flex items-center justify-between rounded-lg bg-muted/70 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{guest.initials}</div>
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

function IdeasScreen({ copy }: { copy: AppCopy }) {
  return (
    <div className="space-y-5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{copy.labels.moodboard}</p>
          <h3 className="mt-1 text-2xl font-bold text-foreground">{copy.labels.savedIdeas}</h3>
        </div>
        <Palette className="h-7 w-7 text-primary" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {copy.ideas.map((item, index) => (
          <div key={item} className={`h-24 rounded-lg p-3 ${index % 2 === 0 ? "bg-primary/10" : "bg-rose-50 dark:bg-rose-950/40"}`}>
            <ImageIcon className={index % 2 === 0 ? "h-5 w-5 text-primary" : "h-5 w-5 text-rose-500"} />
            <p className="mt-8 text-sm font-semibold text-foreground">{item}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-muted/70 p-4">
        <p className="text-sm font-semibold text-foreground">{copy.labels.notes}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.labels.notesText}</p>
      </div>
    </div>
  )
}

export function AppMockup({ copy }: { copy: AppCopy }) {
  return (
    <div className="relative mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative mx-auto w-full max-w-[340px]">
        <PhoneMockup screen="dashboard" copy={copy} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{copy.labels.budget}</p>
              <p className="text-3xl font-bold text-foreground">R$ 45k</p>
            </div>
            <CircleDollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[68%] rounded-full bg-primary" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{copy.labels.available}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{copy.labels.guests}</p>
              <p className="text-3xl font-bold text-foreground">96%</p>
            </div>
            <UsersRound className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-3">
            {copy.guests.map((guest) => (
              <div key={guest.name} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{guest.initials}</div>
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
            <p className="font-semibold text-foreground">{copy.labels.timeline}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {copy.timeline.map((item, index) => (
              <div key={item} className="rounded-lg bg-muted/70 p-4">
                <p className="text-xs font-medium text-primary">{copy.labels.step} {index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppScreenGallery({ copy }: { copy: AppCopy }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
      {(["budget", "guests", "ideas"] as const).map((screen, index) => (
        <div key={screen} className={`mx-auto w-full ${index === 1 ? "max-w-[310px]" : "max-w-[290px] md:translate-y-10"}`}>
          <PhoneMockup screen={screen} copy={copy} />
          <p className="mt-5 text-center text-sm font-medium text-muted-foreground">{copy.gallery[index]}</p>
        </div>
      ))}
    </div>
  )
}

export function AppShowcase({ copy }: { copy: AppCopy }) {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{copy.badge}</span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{copy.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{copy.description}</p>
        </div>
        <AppMockup copy={copy} />
        <div className="mt-20">
          <AppScreenGallery copy={copy} />
        </div>
      </div>
    </section>
  )
}
