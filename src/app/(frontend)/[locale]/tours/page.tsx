import { getPublicContent } from '@/lib/content-service';
import ToursExplorer from '@/components/tours-explorer';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function ToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('tours');
  const { tours, tourTypes, reviews } = await getPublicContent(locale);
  const saleTours = tours.filter((tour) => tour.status === 'for_sale');

  const ratingTotals = new Map<string, { total: number; count: number }>();
  reviews
    .filter((review) => review.status === 'approved' && review.tourId)
    .forEach((review) => {
      if (!review.tourId) return;
      const current = ratingTotals.get(review.tourId) ?? { total: 0, count: 0 };
      ratingTotals.set(review.tourId, {
        total: current.total + review.rating,
        count: current.count + 1,
      });
    });

  const serialisedTours = saleTours.map((tour) => {
    const rating = ratingTotals.get(tour.id);
    const start = tour.startDate instanceof Date ? tour.startDate : new Date(tour.startDate);
    const end = tour.endDate instanceof Date ? tour.endDate : new Date(tour.endDate);
    const fallbackDurationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return {
      id: tour.id,
      name: tour.name,
      summary: tour.summary,
      code: tour.code,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      clientCity: tour.clientCity,
      clientCountry: tour.clientCountry,
      clientCount: tour.clientCount,
      clientNationalities: tour.clientNationalities,
      durationDays: tour.durationDays ?? fallbackDurationDays,
      photoUrl: tour.photoUrls?.[0] ?? null,
      tourTypeIds: tour.tourTypeIds ?? [],
      provinces: tour.provinces ?? [],
      guideName: tour.guides?.map((g) => g.title).join(', ') || 'TBD',
      guideLanguages: tour.guideLanguages ?? [],
      itinerary: tour.itinerary,
      rating: rating && rating.count > 0
        ? { average: rating.total / rating.count, count: rating.count }
        : null,
      price: tour.price ?? null,
      currency: tour.currency ?? 'VND',
      priceUnit: tour.priceUnit ?? 'per_person',
      groupSizeMin: tour.groupSizeMin ?? null,
      groupSizeMax: tour.groupSizeMax ?? null,
      departureSchedule: tour.departureSchedule ?? null,
      highlights: tour.highlights ?? [],
    };
  });

  const serialisedTourTypes = tourTypes.map((type) => ({
    id: type.id,
    title: type.title,
    icon: type.icon,
  }));

  return (
    <div className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center rounded-full border border-border/60 bg-secondary/30 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t('title')}
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-headline font-bold">{t('description')}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="mt-12">
          <ToursExplorer tours={serialisedTours} tourTypes={serialisedTourTypes} />
        </div>
      </div>
    </div>
  );
}
