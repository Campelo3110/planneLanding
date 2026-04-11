import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { AppShowcase } from "@/components/app-showcase"
import { Problem } from "@/components/problem"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { Trust } from "@/components/trust"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"
import { getCopy, type Locale } from "@/lib/i18n"

export function HomePage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale)

  return (
    <main className="min-h-screen bg-background">
      <Header copy={copy.nav} locale={locale} />
      <Hero copy={copy.hero} />
      <Problem copy={copy.problem} />
      <Features copy={copy.features} />
      <HowItWorks copy={copy.how} appCopy={copy.app} />
      <AppShowcase copy={copy.app} />
      <Testimonials copy={copy.testimonials} />
      <Trust copy={copy.trust} />
      <CTA copy={copy.cta} />
      <Footer copy={copy.footer} locale={locale} />
    </main>
  )
}
