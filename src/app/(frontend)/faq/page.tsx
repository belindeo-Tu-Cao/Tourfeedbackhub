import { FAQPageStructuredData } from '@/components/structured-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getFaqs } from '@/lib/content-service';
import type { Metadata } from 'next';
import type { Faq } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about our tours, guides, and destinations.',
};

function groupByCategory(faqs: Faq[]): Map<string, Faq[]> {
  const groups = new Map<string, Faq[]>();
  for (const faq of faqs) {
    const key = faq.category?.trim() || 'General';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(faq);
  }
  return groups;
}

export default async function FaqPage() {
  const faqs = await getFaqs();
  const groups = groupByCategory(faqs);

  return (
    <div className="bg-background py-16 md:py-24">
      <FAQPageStructuredData faqs={faqs} />
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Answers to the questions travellers ask most about our tours, guides, and destinations.
          </p>
        </div>

        {faqs.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-border/60 bg-background/70 p-12 text-center text-muted-foreground">
            No FAQs published yet.
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-10">
            {Array.from(groups.entries()).map(([category, categoryFaqs]) => (
              <div key={category}>
                <h2 className="mb-4 text-xl font-headline font-semibold">{category}</h2>
                <Accordion type="single" collapsible className="rounded-lg border bg-background/60 px-4">
                  {categoryFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
