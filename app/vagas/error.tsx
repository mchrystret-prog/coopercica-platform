"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="section">
      <div className="shell">
        <h1>Não foi possível carregar as oportunidades.</h1>
        <p>Tente novamente em instantes.</p>
        <button className="button" onClick={reset}>
          Tentar novamente
        </button>{" "}
        <Link href="/">Voltar ao início</Link>
      </div>
    </main>
  );
}
