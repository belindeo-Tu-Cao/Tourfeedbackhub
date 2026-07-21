import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Faq } from '@/lib/types';

interface FaqSectionProps {
  title?: string;
  faqs?: Faq[] | null;
}

export function FaqSection({ title = 'Frequently Asked Questions', faqs }: FaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-headline font-semibold">{title}</h2>
      <Accordion type="single" collapsible className="rounded-lg border bg-background/60 px-4">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
