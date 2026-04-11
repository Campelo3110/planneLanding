"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { localePath, type Locale, type getCopy } from "@/lib/i18n"
import { Menu, X } from "lucide-react"

type HeaderCopy = ReturnType<typeof getCopy>["nav"]

export function Header({ copy, locale }: { copy: HeaderCopy; locale: Locale }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const alternateLocale = locale === "en" ? "pt" : "en"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href={localePath(locale)} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all group-hover:scale-105">
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-semibold text-foreground tracking-tight">planne</span>
        </Link>
        
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">{copy.openMenu}</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex lg:items-center lg:gap-10">
          <Link href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            {copy.features}
          </Link>
          <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            {copy.howItWorks}
          </Link>
          <Link href="#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            {copy.testimonials}
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <ThemeToggle label={copy.theme} />
          <Link
            href={localePath(alternateLocale)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background/80 px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            {copy.language}
          </Link>
          <Button asChild className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 rounded-full px-6 transition-all">
            <Link href="#download">{copy.download}</Link>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-xl">
          <div className="px-6 py-6 space-y-4">
            <Link
              href="#funcionalidades"
              className="block py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {copy.features}
            </Link>
            <Link
              href="#como-funciona"
              className="block py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {copy.howItWorks}
            </Link>
            <Link
              href="#depoimentos"
              className="block py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {copy.testimonials}
            </Link>
            <hr className="border-border" />
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3">
                <ThemeToggle label={copy.theme} />
                <Link
                  href={localePath(alternateLocale)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {copy.language}
                </Link>
              </div>
              <Button asChild className="w-full justify-center bg-primary text-primary-foreground shadow-lg shadow-primary/30 rounded-full">
                <Link href="#download" onClick={() => setMobileMenuOpen(false)}>
                  {copy.download}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
