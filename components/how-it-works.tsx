import { motion } from "@/components/motion"
import { PhoneMockup } from "@/components/app-showcase"
import type { getCopy } from "@/lib/i18n"
import { ArrowRight, Smartphone } from "lucide-react"
import { AnimatedSection, AnimatedSlideIn } from "./animated-section"

type HowCopy = ReturnType<typeof getCopy>["how"]
type AppCopy = ReturnType<typeof getCopy>["app"]
const screens = ["dashboard", "budget", "guests"] as const

export function HowItWorks({ copy, appCopy }: { copy: HowCopy; appCopy: AppCopy }) {
  return (
    <section id="como-funciona" className="py-24 lg:py-32 relative">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <AnimatedSection className="mx-auto max-w-2xl text-center mb-20">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase mb-4 bg-primary/10 px-4 py-2 rounded-full">
            <Smartphone className="w-4 h-4" />
            {copy.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            {copy.titleStart}
            <span className="block text-primary mt-1">{copy.titleAccent}</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            {copy.description}
          </p>
        </AnimatedSection>

        {/* Steps */}
        <div className="space-y-20 lg:space-y-32">
          {copy.steps.map(([title, time, description], index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-12 lg:gap-20`}
            >
              {/* Content */}
              <AnimatedSlideIn 
                direction={index % 2 === 0 ? "left" : "right"}
                className="flex-1 text-center lg:text-left"
              >
                <div className="flex items-center gap-4 justify-center lg:justify-start mb-4">
                  <span className="text-6xl lg:text-7xl font-bold text-primary/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1">
                    <span className="text-xs font-semibold text-primary">{time}</span>
                  </span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  {title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                  {description}
                </p>
              </AnimatedSlideIn>

              {/* Visual */}
              <AnimatedSlideIn 
                direction={index % 2 === 0 ? "right" : "left"}
                delay={0.2}
                className="flex-1 w-full max-w-md"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <PhoneMockup screen={screens[index]} className="mx-auto max-w-[300px]" copy={appCopy} />
                </motion.div>
              </AnimatedSlideIn>
            </div>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection delay={0.2} className="text-center mt-20">
          <motion.a 
            href="#download"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 text-lg px-8 h-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-primary/50 rounded-2xl transition-all font-semibold group"
          >
            {copy.cta}
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </motion.a>
          <p className="mt-4 text-sm text-muted-foreground">
            {copy.ctaNote}
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}

