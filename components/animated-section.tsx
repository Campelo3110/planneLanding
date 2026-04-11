import { ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <div className={`animate-section ${className ?? ""}`} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  )
}

export function AnimatedFadeIn({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <div className={`animate-fade-in ${className ?? ""}`} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  )
}

export function AnimatedSlideIn({ 
  children, 
  className, 
  delay = 0,
  direction = "left"
}: AnimatedSectionProps & { direction?: "left" | "right" }) {
  return (
    <div
      className={`animate-slide-in-${direction} ${className ?? ""}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

export function AnimatedScale({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <div className={`animate-scale-in ${className ?? ""}`} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ children, className, staggerDelay = 0.1 }: StaggerContainerProps) {
  return <div className={className}>{children}</div>
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`animate-section ${className ?? ""}`}>{children}</div>
}
