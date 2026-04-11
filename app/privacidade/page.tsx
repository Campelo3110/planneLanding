import Link from "next/link"

export const metadata = {
  title: "Privacidade | Planne",
  description: "Politica de privacidade do Planne.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Voltar para o inicio
        </Link>
        <h1 className="mt-8 text-4xl font-bold tracking-tight">Privacidade</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Esta pagina deve receber a politica oficial de privacidade do Planne,
          incluindo quais dados sao coletados, como sao usados, por quanto tempo
          ficam armazenados e como usuarios podem solicitar remocao ou alteracao.
        </p>
      </div>
    </main>
  )
}
