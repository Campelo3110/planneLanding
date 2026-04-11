import Link from "next/link"
import { localePath, type Locale, type getCopy } from "@/lib/i18n"
import { Instagram, Twitter, Linkedin, Heart } from "lucide-react"

type FooterCopy = ReturnType<typeof getCopy>["footer"]

const companyLinks = [
  { name: "Instagram", href: "https://www.instagram.com/planne.app" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/planne-app" },
]

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/planne.app", icon: Instagram },
  { name: "Twitter", href: "https://twitter.com/planneapp", icon: Twitter },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/planne-app", icon: Linkedin },
]

export function Footer({ copy, locale }: { copy: FooterCopy; locale: Locale }) {
  const productLinks = [
    { name: locale === "en" ? "Features" : "Funcionalidades", href: "#funcionalidades" },
    { name: locale === "en" ? "How it works" : "Como funciona", href: "#como-funciona" },
    { name: locale === "en" ? "Testimonials" : "Depoimentos", href: "#depoimentos" },
    { name: locale === "en" ? "Download app" : "Baixar app", href: "#download" },
  ]
  const legalLinks = [
    { name: copy.terms, href: locale === "en" ? "/en/terms" : "/termos" },
    { name: copy.privacy, href: locale === "en" ? "/en/privacy" : "/privacidade" },
  ]

  const navigation = {
    produto: productLinks,
  empresa: [
    ...companyLinks,
  ],
    legal: legalLinks,
  }

  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={localePath(locale)} className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-primary-foreground font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-semibold text-foreground">planne</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {copy.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <Link 
                  key={name}
                  href={href} 
                  aria-label={name}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Produto */}
          <div>
            <h3 className="font-semibold text-foreground mb-5">{copy.product}</h3>
            <ul className="space-y-3">
              {navigation.produto.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-semibold text-foreground mb-5">{copy.company}</h3>
            <ul className="space-y-3">
              {navigation.empresa.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-5">{copy.legal}</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Planne. {copy.rights}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            {copy.made} <Heart className="w-4 h-4 text-primary fill-primary" /> {copy.madeEnd}
          </p>
        </div>
      </div>
    </footer>
  )
}
