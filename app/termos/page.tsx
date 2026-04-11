import Link from "next/link"

export const metadata = {
  title: "Termos de uso | Planne",
  description: "Termos de uso do Planne.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Voltar para o inicio
        </Link>
        <h1 className="mt-8 text-4xl font-bold tracking-tight">Termos de uso</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Estes termos serao atualizados com as condicoes oficiais de uso do Planne.
          Enquanto isso, use este espaco para publicar regras de conta, assinatura,
          cancelamento, suporte e responsabilidades.
        </p>
      </div>
    </main>
  )
}
