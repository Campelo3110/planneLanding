import { motion } from "@/components/motion"
import type { getCopy } from "@/lib/i18n"
import { Shield, Lock, Sparkles, Award } from "lucide-react"
import { AnimatedFadeIn } from "./animated-section"

type TrustCopy = ReturnType<typeof getCopy>["trust"]

const trustMeta = [
  {
    icon: Shield,
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: Lock,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Sparkles,
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Award,
    color: "bg-amber-100",
    iconColor: "text-amber-600",
  },
]

export function Trust({ copy }: { copy: TrustCopy }) {
  return (
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedFadeIn>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {copy.map(([title, description], index) => {
              const item = trustMeta[index]
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className="flex items-center gap-3"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}
                >
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </motion.div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{title}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </motion.div>
            )})}
          </div>
        </AnimatedFadeIn>
      </div>
    </section>
  )
}

