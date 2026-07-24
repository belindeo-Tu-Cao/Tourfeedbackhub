import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft, Eye, Utensils, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  BreadcrumbStructuredData,
  TouristDestinationStructuredData,
  FAQPageStructuredData,
} from '@/components/structured-data';
import { RelatedContentSection } from '@/components/related-content-section';
import { FaqSection } from '@/components/faq-section';
import { getDestination, getFaqsFor } from '@/lib/content-service';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { MustSeeDoEatItem } from '@/lib/types';
import { buildAlternates } from '@/lib/locale-path';

interface DestinationPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const destination = await getDestination(slug, locale);
  if (!destination) return { title: 'Destination Not Found' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.web.app';
  return {
    title: `${destination.name} — Destinations`,
    description: destination.summary,
    alternates: {
      languages: buildAlternates(siteUrl, `/destinations/${slug}`),
    },
  };
}

function MustItemsGrid({ items, icon: Icon }: { items: MustSeeDoEatItem[]; icon: typeof Eye }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <Card key={`${item.title}-${index}`} className="overflow-hidden border-border/60">
          {item.imageUrl ? (
            <div className="relative h-36 bg-muted">
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
          ) : null}
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-accent" />
              <h3 className="font-semibold">{item.title}</h3>
            </div>
            {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const destination = await getDestination(slug, locale);

  if (!destination) {
    notFound();
  }

  const faqs = await getFaqsFor('destinations', destination.id, locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbStructuredData items={[{ name: 'Destinations', url: '/destinations' }, { name: destination.name }]} />
      <TouristDestinationStructuredData
        name={destination.name}
        description={destination.summary}
        image={destination.heroImageUrl}
        url={`${baseUrl}/destinations/${destination.slug}`}
      />
      <FAQPageStructuredData faqs={faqs} />

      <section className="relative w-full h-[35vh] md:h-[45vh] bg-muted">
        {destination.heroImageUrl ? (
          <Image src={destination.heroImageUrl} alt={destination.name} fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-4xl mx-auto">
              <Link href="/destinations" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-6">
                <ArrowLeft className="h-4 w-4" />
                All destinations
              </Link>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-white mb-4">{destination.name}</h1>
              {destination.summary ? <p className="text-lg text-white/80 max-w-2xl">{destination.summary}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {destination.description ? (
              <article className="prose prose-lg max-w-none whitespace-pre-line mb-12">{destination.description}</article>
            ) : null}

            {destination.mustSee.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-4 text-2xl font-headline font-bold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-accent" /> Must See
                </h2>
                <MustItemsGrid items={destination.mustSee} icon={Eye} />
              </div>
            )}

            {destination.mustDo.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-4 text-2xl font-headline font-bold flex items-center gap-2">
                  <Compass className="h-5 w-5 text-accent" /> Must Do
                </h2>
                <MustItemsGrid items={destination.mustDo} icon={Compass} />
              </div>
            )}

            {destination.mustEat.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-4 text-2xl font-headline font-bold flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-accent" /> Must Eat
                </h2>
                <MustItemsGrid items={destination.mustEat} icon={Utensils} />
              </div>
            )}

            <RelatedContentSection title="Tours" items={destination.tours} />
            <RelatedContentSection title="Tour styles" items={destination.tourTypes} />
            <RelatedContentSection title="Guides" items={destination.guides} />
            <RelatedContentSection title="Stories" items={destination.stories} />
            <RelatedContentSection title="Blog posts" items={destination.posts} />

            <FaqSection faqs={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}
