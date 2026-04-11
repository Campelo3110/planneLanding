"use client"

import { useEffect, useState } from "react"

const videoQuery = "(min-width: 768px) and (prefers-reduced-motion: no-preference)"

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean
  }
}

export function HeroVideo() {
  const [canLoadVideo, setCanLoadVideo] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(videoQuery)

    function updateVideoPreference() {
      const saveData = (navigator as NavigatorWithConnection).connection?.saveData ?? false
      setCanLoadVideo(media.matches && !saveData)
    }

    updateVideoPreference()
    media.addEventListener("change", updateVideoPreference)

    return () => media.removeEventListener("change", updateVideoPreference)
  }, [])

  if (!canLoadVideo) {
    return null
  }

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover brightness-[0.58] saturate-[1.08]"
      poster="/images/hero-bg.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    >
      <source src="/videos/hero-bg.webm" type="video/webm" />
    </video>
  )
}
