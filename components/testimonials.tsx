import { motion } from "@/components/motion"
import type { getCopy } from "@/lib/i18n"
import { Star, Quote } from "lucide-react"
import { AnimatedSection, StaggerContainer, StaggerItem } from "./animated-section"
import { AnimatedNumber } from "./animated-number"

type TestimonialsCopy = ReturnType<typeof getCopy>["testimonials"]

export function Testimonials({ copy }: { copy: TestimonialsCopy }) {
  const stats = [
    { value: 2500, suffix: "+", label: copy.stats[0] },
    { value: 50000, suffix: "+", label: copy.stats[1] },
    { value: 2, prefix: "R$ ", suffix: "M+", label: copy.stats[2], highlight: true },
    { value: 98, suffix: "%", label: copy.stats[3] },
  ]

  return (
    <section id="depoimentos" className="py-24 md:py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase mb-4 bg-primary/10 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 fill-primary" />
            {copy.badge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {copy.titleStart}
            <span className="block text-primary">{copy.titleAccent}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {copy.description}
          </p>
        </AnimatedSection>

        {/* Testimonials Grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {copy.cards.map(([name, role, content, avatar, highlight], index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(19, 184, 167, 0.15)" }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-colors flex flex-col h-full"
              >
                {/* Highlight badge */}
                <div className="inline-flex self-start items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1 mb-5">
                  <span className="text-xs font-semibold text-primary">{highlight}</span>
                </div>

                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />

                {/* Content */}
                <p className="text-foreground leading-relaxed mb-6 flex-1">
                  &quot;{content}&quot;
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-primary font-semibold">{avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{name}</div>
                    <div className="text-sm text-muted-foreground">{role}</div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Social proof numbers */}
        <StaggerContainer className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.1}>
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <motion.div 
                whileHover={{ y: -3 }}
                className="text-center p-6 bg-card rounded-2xl border border-border"
              >
                <div className={`text-3xl md:text-4xl font-bold ${stat.highlight ? "text-primary" : "text-foreground"}`}>
                  <AnimatedNumber 
                    value={stat.value} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix}
                    duration={2}
                  />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

