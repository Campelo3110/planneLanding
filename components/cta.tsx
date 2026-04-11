import { motion } from "@/components/motion"
import type { getCopy } from "@/lib/i18n"
import { Heart, Check, Clock } from "lucide-react"
import { AnimatedSection } from "./animated-section"

type CTACopy = ReturnType<typeof getCopy>["cta"]

export function CTA({ copy }: { copy: CTACopy }) {
  return (
    <section id="download" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-teal-500" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Urgency badge */}
        <AnimatedSection>
          <motion.div 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-5 py-2.5 mb-8"
          >
            <Clock className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              {copy.badge}
            </span>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-balance">
            {copy.title}
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="mt-6 text-lg lg:text-xl leading-relaxed text-white/90 max-w-2xl mx-auto">
            {copy.description}
          </p>
        </AnimatedSection>

        {/* App Store buttons - CTA principal */}
        <AnimatedSection delay={0.3}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a 
              href="https://apps.apple.com/br/search?term=Planne" 
              aria-label={copy.appStore}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-white hover:bg-white/95 text-primary px-8 h-16 rounded-2xl shadow-xl transition-all text-lg font-semibold"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              {copy.appStore}
            </motion.a>
            <motion.a 
              href="https://play.google.com/store/search?q=Planne&c=apps" 
              aria-label={copy.googlePlay}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-8 h-16 rounded-2xl shadow-xl transition-all text-lg font-semibold"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              {copy.googlePlay}
            </motion.a>
          </div>
        </AnimatedSection>

        {/* Reducao de risco */}
        <AnimatedSection delay={0.4}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/90">
            {copy.benefits.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span className="text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Heart icon */}
        <AnimatedSection delay={0.5}>
          <div className="mt-12 flex justify-center">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>
          </div>

          <p className="mt-6 text-sm text-white/70">
            {copy.note}
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}

