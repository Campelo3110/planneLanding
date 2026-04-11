import Link from "next/link"

export const metadata = {
  title: "Terms of use | Planne",
  description: "Planne terms of use.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link href="/en" className="text-sm font-medium text-primary hover:underline">
          Back to home
        </Link>
        <h1 className="mt-8 text-4xl font-bold tracking-tight">Terms of use</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          This page will receive Planne&apos;s official terms of use, including account rules,
          subscriptions, cancellation, support and responsibilities.
        </p>
      </div>
    </main>
  )
}
