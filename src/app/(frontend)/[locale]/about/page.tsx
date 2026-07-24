import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPublicContent } from '@/lib/content-service';
import { WebSiteStructuredData } from '@/components/structured-data';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  MapPin,
  Users,
  Star,
  Shield,
  Heart,
  Globe,
  Award,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('about');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const { siteSettings, guides, tours, reviews } = await getPublicContent(locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

  // Compute stats
  const totalGuides = guides?.length || 0;
  const totalTours = tours?.length || 0;
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <WebSiteStructuredData
        name={t('title')}
        url={`${baseUrl}/about`}
        description={siteSettings.aboutDescription}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/asset/pattern.svg')] opacity-5" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
              {t('title')}
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-headline font-bold">
              {siteSettings.aboutTitle || t('title')}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {siteSettings.aboutDescription || t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      {siteSettings.missionStatement && (
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
                <CardContent className="p-6 sm:p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold mb-3 md:mb-4">{t('title')}</h2>
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        {siteSettings.missionStatement}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-primary">{totalGuides}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('title')}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-primary">{totalTours}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('title')}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{t('title')}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-primary">50+</p>
                <p className="text-sm text-muted-foreground mt-1">{t('title')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      {siteSettings.values && siteSettings.values.length > 0 && (
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold">{t('title')}</h2>
                <p className="mt-3 md:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t('description')}
                </p>
              </div>
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {siteSettings.values.map((value, index) => {
                  const icons = [Shield, Award, TrendingUp, Heart, Globe, Star];
                  const Icon = icons[index % icons.length];
                  return (
                    <Card key={index} className="border-border/60 bg-background/80 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{value}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-8 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold">{t('title')}</h2>
              <p className="mt-3 md:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('description')}
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg sm:text-xl font-headline font-semibold mb-2">{t('title')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('description')}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-lg sm:text-xl font-headline font-semibold mb-2">{t('title')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('description')}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-headline font-semibold mb-2">{t('title')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold mb-3 md:mb-4">
              {t('title')}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t('description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full w-full sm:w-auto">
                <Link href="/guides">
                  <Users className="mr-2 h-5 w-5" />
                  {t('title')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full w-full sm:w-auto">
                <Link href="/tours">
                  <MapPin className="mr-2 h-5 w-5" />
                  {t('title')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
