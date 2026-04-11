import { motion } from "@/components/motion"
import type { getCopy } from "@/lib/i18n"
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Calendar, 
  StickyNote, 
  Camera,
  Check
} from "lucide-react"
import { AnimatedSection, StaggerContainer, StaggerItem } from "./animated-section"

type FeaturesCopy = ReturnType<typeof getCopy>["features"]

const featureMeta = [
  {
    icon: LayoutDashboard,
    color: "bg-primary/10 group-hover:bg-primary/20",
    iconColor: "text-primary",
  },
  {
    icon: Wallet,
    color: "bg-amber-50 group-hover:bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: Users,
    color: "bg-blue-50 group-hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Calendar,
    color: "bg-purple-50 group-hover:bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    icon: StickyNote,
    color: "bg-rose-50 group-hover:bg-rose-100",
    iconColor: "text-rose-500",
  },
  {
    icon: Camera,
    color: "bg-emerald-50 group-hover:bg-emerald-100",
    iconColor: "text-emerald-600",
  },
]

export function Features({ copy }: { copy: FeaturesCopy }) {
  return (
    <section id="funcionalidades" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-subtle-pulse" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/30 rounded-full blur-3xl animate-subtle-pulse" style={{ animationDelay: "2s" }} />

      <div className="mx-auto max-w-6xl px-6 relative">
        {/* Section header */}
        <AnimatedSection className="mx-auto max-w-2xl text-center mb-16 lg:mb-20">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase mb-4 bg-primary/10 px-4 py-2 rounded-full">
            <Check className="w-4 h-4" />
            {copy.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            {copy.titleStart}
            <span className="block text-primary mt-1">{copy.titleAccent}</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
        </AnimatedSection>

        {/* Features grid */}
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {copy.cards.map(([title, benefit, description], index) => {
            const feature = featureMeta[index]
            return (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(19, 184, 167, 0.15)" }}
                transition={{ duration: 0.3 }}
                className="group relative bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-colors h-full"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 transition-colors`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {title}
                </h3>
                {/* Beneficio claro */}
                <p className="text-primary font-medium text-sm mb-3">
                  {benefit}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </motion.div>
            </StaggerItem>
          )})}
        </StaggerContainer>

        {/* Extra benefit */}
        <AnimatedSection delay={0.3} className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {copy.extras.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5 text-primary" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

