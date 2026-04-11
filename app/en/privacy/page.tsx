import Link from "next/link"

export const metadata = {
  title: "Privacy | Planne",
  description: "Planne privacy policy.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link href="/en" className="text-sm font-medium text-primary hover:underline">
          Back to home
        </Link>
        <h1 className="mt-8 text-4xl font-bold tracking-tight">Privacy</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          This page should include Planne&apos;s official privacy policy: what data is collected,
          how it is used, how long it is stored and how users can request changes or deletion.
        </p>
      </div>
    </main>
  )
}
