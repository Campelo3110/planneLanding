import { HomePage } from "@/components/home-page"

export const metadata = {
  title: "Planne - Plan with clarity",
  description: "Premium event planning app. Organize guests, tasks, budget and ideas in one place.",
  alternates: {
    canonical: "/en",
    languages: {
      "pt-BR": "/",
      en: "/en",
    },
  },
}

export default function EnglishHome() {
  return <HomePage locale="en" />
}
