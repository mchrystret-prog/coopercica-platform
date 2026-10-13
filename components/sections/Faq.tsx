import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { FaqAnswer } from "@/components/publications/FaqAnswer";
import { answerText } from "@/lib/faq-rich-text";
import { getFaqItems } from "@/lib/home-faq";
import styles from "./Faq.module.css";
export function Faq({ content = {} }: { content?: Record<string, string> }) {
  const items = getFaqItems(content).filter(item => item.active && item.question.trim() && answerText(item.answer, item.answerFormat).trim());
  if (content.enabled === "false" || !items.length) return null;
  return <Section id="perguntas-frequentes" tone="soft" aria-labelledby="faq-title" tabIndex={-1}>
    <Container>
      <SectionHeader id="faq-title" eyebrow={content.eyebrow ?? "Tire suas dúvidas"} title={content.title || "Perguntas frequentes."} description={content.description || undefined} />
      <div className={styles.list}>{items.map((item, index) => <details className={styles.item} key={`${item.id}-${index}`}>
        <summary className={styles.question}><span>{item.question}</span><Icon name="chevron-right" className={styles.indicator} /></summary>
        <div className={styles.answer}><FaqAnswer answer={item.answer} format={item.answerFormat} /></div>
      </details>)}</div>
    </Container>
  </Section>;
}
