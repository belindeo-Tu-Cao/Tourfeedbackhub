'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/star-rating';
import {
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  Users,
  Star,
  Award,
  Briefcase,
  MessageCircle,
  ArrowLeft,
  ChevronRight,
  Quote,
} from 'lucide-react';
import { RelatedContentSection } from '@/components/related-content-section';
import { PersonStructuredData } from '@/components/structured-data';
import type { Guide, Tour, Review, RelatedItemSummary } from '@/lib/types';
import { format } from 'date-fns';

interface GuideProfileProps {
  guide: Guide;
  tours: Tour[];
  reviews: Review[];
  relatedPosts?: RelatedItemSummary[];
}

const proficiencyLabels: Record<string, string> = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  fluent: 'Fluent',
  native: 'Native',
};

const proficiencyColors: Record<string, string> = {
  basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  intermediate: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  fluent: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  native: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

export default function GuideProfile({ guide, tours, reviews, relatedPosts }: GuideProfileProps) {
  const totalPax = tours.reduce((sum, tour) => sum + (tour.clientCount || 0), 0);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Get unique provinces from tours
  const provinces = Array.from(
    new Set(tours.flatMap((t) => t.provinces || []).filter(Boolean))
  );

  // Get unique nationalities from tours
  const nationalities = Array.from(
    new Set(tours.flatMap((t) => t.clientNationalities || []).filter(Boolean))
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <div className="min-h-screen bg-background">
      <PersonStructuredData
        name={guide.name}
        image={guide.photo}
        url={`${baseUrl}/guide/${guide.id}`}
        knowsLanguage={guide.languages?.map((l) => l.name).filter(Boolean)}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 bg-[url('/asset/pattern.svg')] opacity-5" />
        <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
          {/* Back button */}
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Guides
          </Link>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mx-auto lg:mx-0 h-56 w-56 flex-shrink-0 overflow-hidden rounded-3xl border-4 border-background shadow-2xl lg:h-72 lg:w-72"
            >
              {guide.photo ? (
                <Image
                  src={guide.photo}
                  alt={guide.name}
                  fill
                  className="object-cover"
                  sizes="288px"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10 text-5xl font-bold text-primary/40">
                  {guide.name.charAt(0)}
                </div>
              )}
              {guide.cardType && (
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge
                    variant="secondary"
                    className="w-full justify-center bg-background/90 backdrop-blur-sm border-0 py-2"
                  >
                    {guide.cardType === 'international' ? '🌍 International Guide' : '🇻🇳 Domestic Guide'}
                  </Badge>
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 space-y-6"
            >
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold">
                  {guide.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {guide.cardType && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {guide.cardType === 'international'
                          ? 'International Tour Guide'
                          : 'Domestic Tour Guide'}
                      </span>
                    </div>
                  )}
                  {guide.experienceYears && (
                    <Badge variant="secondary" className="text-sm">
                      {guide.experienceYears}+ years experience
                    </Badge>
                  )}
                </div>
              </div>

              {guide.bio && (
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {guide.bio}
                </p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-lg">
                <div className="rounded-xl sm:rounded-2xl bg-background/80 p-3 sm:p-4 text-center shadow-sm border border-border/60">
                  <Briefcase className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary mb-1 sm:mb-2" />
                  <p className="text-lg sm:text-2xl font-bold">{guide.totalTours || tours.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Tours</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl bg-background/80 p-3 sm:p-4 text-center shadow-sm border border-border/60">
                  <Users className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary mb-1 sm:mb-2" />
                  <p className="text-lg sm:text-2xl font-bold">{totalPax}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Pax Served</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl bg-background/80 p-3 sm:p-4 text-center shadow-sm border border-border/60">
                  <Star className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary mb-1 sm:mb-2" />
                  <p className="text-lg sm:text-2xl font-bold">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {guide.phone && (
                  <Button asChild variant="default" className="rounded-full">
                    <a href={`tel:${guide.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </a>
                  </Button>
                )}
                {guide.email && (
                  <Button asChild variant="outline" className="rounded-full">
                    <a href={`mailto:${guide.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/feedback?guide=${guide.id}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Leave Feedback
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Languages */}
            {guide.languages && guide.languages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-border/60 bg-background/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                      <Globe className="h-5 w-5 text-primary" />
                      Languages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {guide.languages.map((lang) => (
                        <div
                          key={lang.id}
                          className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
                        >
                          <span className="font-medium">{lang.name}</span>
                          {lang.proficiency && (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                proficiencyColors[lang.proficiency] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {proficiencyLabels[lang.proficiency] || lang.proficiency}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Specializations */}
            {guide.tourTypes && guide.tourTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <Card className="border-border/60 bg-background/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                      <Award className="h-5 w-5 text-primary" />
                      Specializes In
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {guide.tourTypes.map((type) => (
                        <Link key={type.id} href={type.href}>
                          <Badge variant="secondary" className="text-sm py-1.5 px-3 hover:bg-secondary/80">
                            {type.title}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Areas of Operation */}
            {(provinces.length > 0 || nationalities.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-border/60 bg-background/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                      <MapPin className="h-5 w-5 text-primary" />
                      Areas of Operation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {provinces.length > 0 && (
                      <div>
                        <p className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Provinces & Cities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {provinces.map((province) => (
                            <Badge
                              key={province}
                              variant="secondary"
                              className="text-sm py-1.5 px-3"
                            >
                              <MapPin className="mr-1 h-3 w-3" />
                              {province}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {nationalities.length > 0 && (
                      <div>
                        <p className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Served Nationalities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {nationalities.slice(0, 12).map((nat) => (
                            <Badge
                              key={nat}
                              variant="outline"
                              className="text-sm py-1.5 px-3"
                            >
                              {nat}
                            </Badge>
                          ))}
                          {nationalities.length > 12 && (
                            <Badge variant="outline" className="text-sm py-1.5 px-3">
                              +{nationalities.length - 12} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Tour History */}
            {tours.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="border-border/60 bg-background/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Tour History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tours.slice(0, 8).map((tour, index) => (
                        <motion.div
                          key={tour.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="group rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                                {tour.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  {format(tour.startDate, 'MMM yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  {tour.clientCount} pax
                                </span>
                                {tour.provinces && tour.provinces.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    {tour.provinces.slice(0, 2).join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant={tour.status === 'finished' ? 'default' : 'secondary'}
                              className="self-start text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1"
                            >
                              {tour.status === 'finished' ? 'Completed' : 'For Sale'}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                      {tours.length > 8 && (
                        <p className="text-center text-sm text-muted-foreground pt-2">
                          And {tours.length - 8} more tours...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-border/60 bg-background/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                      <Star className="h-5 w-5 text-primary" />
                      Guest Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.slice(0, 4).map((review, index) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="relative rounded-xl border border-border/60 bg-muted/20 p-5"
                        >
                          <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.authorDisplay}</span>
                              {review.country && (
                                <Badge variant="outline" className="text-xs">
                                  {review.country}
                                </Badge>
                              )}
                            </div>
                            <StarRating rating={review.rating} readonly size="sm" />
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{review.message}</p>
                          {review.tourName && (
                            <p className="mt-3 text-xs text-muted-foreground/70 flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              Tour: {review.tourName}
                            </p>
                          )}
                        </motion.div>
                      ))}
                      {reviews.length > 4 && (
                        <p className="text-center text-sm text-muted-foreground">
                          And {reviews.length - 4} more reviews...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Guide License Info (for verification) */}
            {guide.cardNumber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl text-primary">
                      <Award className="h-5 w-5" />
                      Verified Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                      <div className="rounded-lg bg-background/50 p-3">
                        <p className="text-muted-foreground text-xs uppercase tracking-wide">License Type</p>
                        <p className="font-medium mt-1">
                          {guide.cardType === 'international'
                            ? 'International Tour Guide'
                            : 'Domestic Tour Guide'}
                        </p>
                      </div>
                      {guide.cardIssuePlace && (
                        <div className="rounded-lg bg-background/50 p-3">
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Issued By</p>
                          <p className="font-medium mt-1">{guide.cardIssuePlace}</p>
                        </div>
                      )}
                      {guide.cardIssueDate && (
                        <div className="rounded-lg bg-background/50 p-3">
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Issue Date</p>
                          <p className="font-medium mt-1">
                            {format(new Date(guide.cardIssueDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      )}
                      {guide.cardExpiryDate && (
                        <div className="rounded-lg bg-background/50 p-3">
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">Expiry Date</p>
                          <p className="font-medium mt-1">
                            {format(new Date(guide.cardExpiryDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <RelatedContentSection title="Featured in" items={relatedPosts} />
          </div>
        </div>
      </section>
    </div>
  );
}
