import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { getDestinations } from '@/lib/content-service';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('nav');
  return {
    title: t('destinations'),
    description: t('destinations'),
  };
}

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');
  const destinations = await getDestinations(locale);

  return (
    <div className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center rounded-full border border-border/60 bg-secondary/30 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t('destinations')}
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-headline font-bold">{t('destinations')}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('destinations')}
          </p>
        </div>

        {destinations.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border/60 bg-background/70 p-12 text-center text-muted-foreground">
            {t('destinations')}
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <Link key={destination.id} href={`/destinations/${destination.slug}`} className="group">
                <Card className="h-full overflow-hidden border-border/60 bg-background/80 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="relative h-48 bg-muted">
                    {destination.heroImageUrl ? (
                      <Image
                        src={destination.heroImageUrl}
                        alt={destination.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h2 className="font-headline font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                      {destination.name}
                    </h2>
                    {destination.summary ? (
                      <p className="text-sm text-muted-foreground line-clamp-3">{destination.summary}</p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
