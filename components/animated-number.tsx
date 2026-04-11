interface AnimatedNumberProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function AnimatedNumber({ 
  value, 
  suffix = "", 
  prefix = "",
  className 
}: AnimatedNumberProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(".0", "") + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(".0", "") + "k"
    }
    return num.toLocaleString("pt-BR")
  }

  return <span className={className}>{prefix}{formatNumber(value)}{suffix}</span>
}
