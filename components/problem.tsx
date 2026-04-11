import { motion } from "@/components/motion"
import type { getCopy } from "@/lib/i18n"
import { AlertCircle, Clock, Frown, Brain } from "lucide-react"
import { AnimatedSection, StaggerContainer, StaggerItem } from "./animated-section"

type ProblemCopy = ReturnType<typeof getCopy>["problem"]
const problemIcons = [Brain, Clock, Frown]

export function Problem({ copy }: { copy: ProblemCopy }) {
  return (
    <section id="problema" className="py-20 lg:py-28 relative">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection className="mx-auto max-w-3xl text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-2 mb-6">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-rose-700">{copy.badge}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            {copy.titleStart} 
            <span className="text-rose-500"> {copy.titleAccent}</span>
          </h2>
          
          <p className="mt-5 text-lg text-muted-foreground">
            {copy.description}
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.15}>
          {copy.cards.map((problem, index) => {
            const Icon = problemIcons[index]
            return (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -5, boxShadow: "0 20px 40px -20px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.3 }}
                className="relative bg-gradient-to-b from-rose-50/50 to-card rounded-3xl p-8 border border-rose-100 h-full"
              >
                <motion.div 
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-5"
                >
                  <Icon className="w-6 h-6 text-rose-500" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            </StaggerItem>
          )})}
        </StaggerContainer>

        {/* Transition to solution */}
        <AnimatedSection delay={0.4} className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 text-primary font-semibold text-lg">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="h-px bg-primary/30" 
            />
            {copy.transition}
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="h-px bg-primary/30" 
            />
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

