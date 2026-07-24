import { getAllGuides } from '@/lib/content-service';
import GuidesExplorer from '@/components/guides-explorer';
import { WebSiteStructuredData } from '@/components/structured-data';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Tour Guides',
  description: 'Meet our experienced tour guides ready to show you the best of Vietnam',
};

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const guides = await getAllGuides(locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

  // Compute stats
  const totalGuides = guides.length;
  const internationalGuides = guides.filter((g) => g.cardType === 'international').length;
  const allLanguages = Array.from(
    new Set(guides.flatMap((g) => g.languages?.map((l) => l.name) || []))
  );

  return (
    <div className="min-h-screen bg-background">
      <WebSiteStructuredData
        name="Tour Guides"
        url={`${baseUrl}/guides`}
        description="Meet our experienced tour guides"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/asset/pattern.svg')] opacity-5" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
              Our team
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-headline font-bold">
              Expert Tour Guides
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate professionals dedicated to creating unforgettable experiences.
              Each guide is verified and ready for your next adventure.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12">
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{totalGuides}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">Expert Guides</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{internationalGuides}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">International</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{allLanguages.length}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">Languages</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <GuidesExplorer guides={guides} />
        </div>
      </section>
    </div>
  );
}
