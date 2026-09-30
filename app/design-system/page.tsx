import Link from "next/link";
import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container/Container";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import styles from "./page.module.css";

const brand = [
  ["Verde institucional", "brand-green-900", "#1C4722"],
  ["Verde de apoio escuro", "brand-green-700", "#205F30"],
  ["Verde de apoio", "brand-green-500", "#6AB945"],
  ["Lima", "brand-lime-500", "#A8CF38"],
  ["Vermelho", "brand-red-500", "#EF4037"],
  ["Coral", "brand-coral-500", "#EF5F4B"],
  ["Laranja", "brand-orange-500", "#F68B1F"],
];
const semantic = [
  ["Fundo", "surface-page"], ["Suave", "surface-soft"], ["Suporte", "surface-muted"], ["Card", "surface-card"],
  ["Texto", "text-body"], ["Texto secundário", "text-muted"], ["Borda", "border-soft"],
  ["Sucesso", "feedback-success"], ["Erro", "feedback-error"], ["Aviso", "feedback-warning"],
];
const spaces = [1,2,3,4,5,6,8,10,12,16,20,24,32];
const hierarchy = [["Display", "ds-display"], ["H1", "ds-h1"], ["H2", "ds-title"], ["H3", "ds-subtitle"], ["Body Large", "ds-body-large"], ["Body", "ds-body"], ["Small", "ds-caption"], ["Eyebrow", "ds-eyebrow"]];
function Swatches({ items }: { items: string[][] }) { return <div className={styles.grid}>{items.map(([name, token, hex]) => <Card key={token} className={styles.swatch}><div className={styles.color} style={{ background: `var(--${token})` }}/><div className={styles.meta}><strong>{name}</strong><code>--{token}</code>{hex ? <code>{hex}</code> : null}</div></Card>)}</div>; }
export default function DesignSystemPage() {
  return <main className={styles.page}><Container>
    <header className={styles.hero}><Badge>Design System</Badge><h1 className="ds-h1">Coopercica Digital</h1><p className="ds-body-large">Referência dos tokens e componentes reais do site público. A identidade usa a paleta oficial; medidas, hierarquia e estados são decisões do sistema digital.</p><Link className="ds-link" href="/">Voltar ao site público</Link></header>
    <section className={styles.section}><SectionHeader eyebrow="Brandbook" title="Cores oficiais" description="Os sete valores abaixo são os da marca. Cores de fundo, texto e feedback são apresentadas separadamente."/><Swatches items={brand}/></section>
    <section className={styles.section}><SectionHeader eyebrow="Sistema digital" title="Superfícies e feedback" description="Neutralidades e cores funcionais não são cores oficiais do Brandbook."/><Swatches items={semantic}/></section>
    <section className={styles.section}><SectionHeader eyebrow="Tipografia" title="Gotham e fallback" description="Gotham é a fonte oficial. Montserrat é a adaptação temporária carregada por next/font, até a disponibilização dos arquivos licenciados."/>
      <div className={styles.typeScale}>{hierarchy.map(([label, cls]) => <div className={styles.typeRow} key={label}><code>{label} · {cls}</code><p className={cls}>Qualidade com você</p></div>)}</div>
    </section>
    <section id="botoes" className={styles.section}><SectionHeader eyebrow="Componentes reais" title="CTAs e estados" description="Altura mínima de 48 px. Visual anterior restaurado: primary em verde de apoio, texto branco e hover em verde escuro. Tab revela o foco; pressione um botão para observar active."/>
      <div className={styles.actions}><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button disabled>Desabilitado</Button><Button href="/delivery">Link interno</Button><Button href="https://www.coopercicadelivery.com.br/" external>Link externo</Button><Button href="/" disabled>Link desabilitado</Button></div>
      <div className={styles.inverse}><p className="ds-caption">Tons inversos para fundo institucional</p><div className={styles.actions}><Button tone="inverse">Primary</Button><Button tone="inverse" variant="secondary">Secondary</Button><Button tone="inverse" variant="ghost">Ghost</Button></div></div>
      <p className="ds-body"><Link className="ds-link" href="/politicas">Link de texto institucional</Link></p>
    </section>
    <section className={styles.section}><SectionHeader eyebrow="Componentes reais" title="Cards e badges" description="Formas arredondadas como apoio. Cards não precisam de sombra; elevação é reservada a uma função específica."/><div className={styles.grid}>{(["default","soft","elevated","outline"] as const).map(variant=><Card key={variant} variant={variant}><h3 className="ds-subtitle">{variant}</h3><p className="ds-body">Card com radius e borda canônicos.</p><Button href="/lojas" variant="secondary">Conhecer lojas</Button></Card>)}</div><div className={styles.actions}><Badge>Institucional</Badge><Badge variant="red">Destaque</Badge><Badge variant="orange">Novidade</Badge><Badge variant="outline">Informativo</Badge></div></section>
    <section className={styles.section}><SectionHeader eyebrow="Traço consistente" title="Ícones" description="SVG outline, stroke de 1,8 e dimensões de 20 px. Sem emojis ou preenchimento misturado aos ícones da interface."/><div className={styles.actions}>{(["arrow-right","arrow-up-right","arrow-up","chevron-left","chevron-right","pin","check","pause","play"] as const).map(name=><div className={styles.iconSample} key={name}><Icon name={name}/><code>{name}</code></div>)}</div></section>
    <section className={styles.section}><SectionHeader eyebrow="Ritmo" title="Containers e espaçamento" description="Container máximo de 1280 px. Gutter: clamp(20px, 100vw / 24, 80px). A regra do manual é referência horizontal de composição, nunca uma divisão da altura total da página."/>
      <div className={styles.containerDemo}><p className="ds-body">Este conteúdo usa o mesmo Container da Home e das páginas internas.</p></div><div className={styles.spacing}>{spaces.map(space=><div className={styles.spaceRow} key={space}><code>--space-{space}: {space*4}px</code><div className={styles.spaceBar} style={{ width:`var(--space-${space})` } as CSSProperties}/></div>)}</div>
      <dl className={styles.specs}><dt>Seção</dt><dd><code>--section-space: clamp(64px, 7vw, 112px)</code></dd><dt>Título → descrição</dt><dd><code>--section-header-gap: 24px</code></dd><dt>Heading → conteúdo</dt><dd><code>--section-content-gap: clamp(32px, 4vw, 64px)</code></dd><dt>Grid</dt><dd><code>--grid-gap: 24px</code></dd><dt>Card</dt><dd><code>--card-padding: 32px; mobile: 24px</code></dd></dl>
    </section>
    <section className={styles.section}><SectionHeader eyebrow="Mesmo componente" title="Heading em duas colunas" description="Eyebrow, título e descrição compartilham uma hierarquia previsível. Quebras e composição podem variar."/><Card variant="soft"><SectionHeader eyebrow="Composição empilhada" title={["Mesmo ritmo,", "outra composição."]} description="A variante stacked usa o mesmo SectionHeader e os mesmos tokens." stacked/><Button href="/quem-somos" variant="secondary">Conhecer nossa história</Button></Card></section>
  </Container></main>;
}
