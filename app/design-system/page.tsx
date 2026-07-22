import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./page.module.css";

const colors = [
  ["Verde institucional", "#1C4722", "var(--color-brand-green-900)"],
  ["Verde de apoio", "#205F30", "var(--color-brand-green-700)"],
  ["Verde CTA", "#6AB945", "var(--color-brand-green-500)"],
  ["Verde lima", "#A8CF38", "var(--color-brand-lime-500)"],
  ["Vermelho", "#EF4037", "var(--color-brand-red-500)"],
  ["Laranja", "#F68B1F", "var(--color-brand-orange-500)"],
];

const spaces = [4, 8, 12, 16, 24, 32, 48, 64];

export default function DesignSystemPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <Badge variant="red">Design System</Badge>
          <h1 className="ds-display">Coopercica Digital</h1>
          <p className="ds-body">
            Biblioteca visual criada a partir do projeto atual. Ela organiza o que já funciona no site sem alterar drasticamente sua identidade.
          </p>
        </header>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className="ds-eyebrow">Fundamentos</span>
            <h2 className="ds-subtitle">Cores institucionais</h2>
          </header>
          <div className={styles.grid}>
            {colors.map(([name, hex, value]) => (
              <Card key={name} className={styles.swatch}>
                <div className={styles.color} style={{ background: value }} />
                <div className={styles.meta}>
                  <strong>{name}</strong>
                  <code>{hex}</code>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className="ds-eyebrow">Tipografia</span>
            <h2 className="ds-subtitle">Família Montserrat</h2>
          </header>
          <div className={styles.typeScale}>
            <div className={styles.typeRow}><span className={styles.label}>Display / 700</span><p className="ds-display">Qualidade com você</p></div>
            <div className={styles.typeRow}><span className={styles.label}>Título / 700</span><p className="ds-title">Nossa história</p></div>
            <div className={styles.typeRow}><span className={styles.label}>Subtítulo / 600</span><p className="ds-subtitle">Mais perto da comunidade</p></div>
            <div className={styles.typeRow}><span className={styles.label}>Corpo / 400</span><p className="ds-body">Textos corridos usam peso regular, boa altura de linha e contraste confortável para leitura.</p></div>
            <div className={styles.typeRow}><span className={styles.label}>Eyebrow / 700</span><span className="ds-eyebrow">Coopercica</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className="ds-eyebrow">Componentes</span>
            <h2 className="ds-subtitle">Botões e badges</h2>
          </header>
          <div className={styles.actions}>
            <Button href="#" variant="primary">Ação principal</Button>
            <Button href="#" variant="secondary">Ação secundária</Button>
            <Button href="#" variant="light">Botão claro</Button>
            <Badge>Institucional</Badge>
            <Badge variant="red">Oferta</Badge>
            <Badge variant="orange">Novidade</Badge>
            <Badge variant="outline">Informativo</Badge>
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className="ds-eyebrow">Componentes</span>
            <h2 className="ds-subtitle">Superfícies e cards</h2>
          </header>
          <div className={styles.grid}>
            <Card><h3 className={styles.cardTitle}>Card padrão</h3><p className="ds-caption">Superfície branca e sombra leve.</p></Card>
            <Card variant="soft"><h3 className={styles.cardTitle}>Card suave</h3><p className="ds-caption">Usado sobre fundos claros.</p></Card>
            <Card variant="elevated"><h3 className={styles.cardTitle}>Card elevado</h3><p className="ds-caption">Maior destaque e profundidade.</p></Card>
            <Card variant="outline"><h3 className={styles.cardTitle}>Card contorno</h3><p className="ds-caption">Sem sombra e com borda visível.</p></Card>
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className="ds-eyebrow">Fundamentos</span>
            <h2 className="ds-subtitle">Escala de espaçamento</h2>
          </header>
          <div className={styles.spacing}>
            {spaces.map((space) => (
              <div className={styles.spaceRow} key={space}>
                <code>{space}px</code>
                <div className={styles.spaceBar} style={{ width: `${Math.min(space * 4, 100)}%` }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
