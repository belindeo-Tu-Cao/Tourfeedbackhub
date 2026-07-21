'use client';

import Image from 'next/image';
import Link from 'next/link';
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
} from 'lucide-react';
import type { Guide, Tour, Review } from '@/lib/types';
import { format } from 'date-fns';

interface GuideProfileProps {
  guide: Guide;
  tours: Tour[];
  reviews: Review[];
}

const proficiencyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  native: 'Native',
};

const proficiencyColors: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-green-100 text-green-800',
  advanced: 'bg-purple-100 text-purple-800',
  native: 'bg-amber-100 text-amber-800',
};

export default function GuideProfile({ guide, tours, reviews }: GuideProfileProps) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              {/* Photo */}
              <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-background shadow-xl md:h-64 md:w-64">
                {guide.photo ? (
                  <Image
                    src={guide.photo}
                    alt={guide.name}
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
                    {guide.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-headline font-bold md:text-4xl">
                    {guide.name}
                  </h1>
                  {guide.cardType && (
                    <div className="mt-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {guide.cardType === 'international'
                          ? 'International Guide'
                          : 'Domestic Guide'}
                      </span>
                      {guide.experienceYears && (
                        <Badge variant="secondary">
                          {guide.experienceYears}+ years experience
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {guide.bio && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {guide.bio}
                  </p>
                )}

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{guide.totalTours || tours.length}</p>
                      <p className="text-xs text-muted-foreground">Tours Guided</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{totalPax}</p>
                      <p className="text-xs text-muted-foreground">Pax Served</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Average Rating ({reviews.length} reviews)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {guide.phone && (
                    <Button asChild variant="outline">
                      <a href={`tel:${guide.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </a>
                    </Button>
                  )}
                  {guide.email && (
                    <Button asChild variant="outline">
                      <a href={`mailto:${guide.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href={`/feedback?guide=${guide.id}`}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Leave Feedback
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Languages */}
            {guide.languages && guide.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Globe className="h-5 w-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {guide.languages.map((lang) => (
                      <div
                        key={lang.id}
                        className="flex items-center gap-2 rounded-full border px-4 py-2"
                      >
                        <span className="font-medium">{lang.name}</span>
                        {lang.proficiency && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
            )}

            {/* Areas of Operation */}
            {(provinces.length > 0 || nationalities.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <MapPin className="h-5 w-5" />
                    Areas of Operation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provinces.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Provinces/Cities
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {provinces.map((province) => (
                          <Badge key={province} variant="secondary">
                            {province}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {nationalities.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Served Nationalities
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {nationalities.slice(0, 10).map((nat) => (
                          <Badge key={nat} variant="outline">
                            {nat}
                          </Badge>
                        ))}
                        {nationalities.length > 10 && (
                          <Badge variant="outline">+{nationalities.length - 10} more</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tour History */}
            {tours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Briefcase className="h-5 w-5" />
                    Tour History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tours.slice(0, 10).map((tour) => (
                      <div
                        key={tour.id}
                        className="flex items-start justify-between gap-4 rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium">{tour.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(tour.startDate, 'MMM yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {tour.clientCount} pax
                            </span>
                            {tour.provinces && tour.provinces.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {tour.provinces.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={tour.status === 'finished' ? 'default' : 'secondary'}>
                          {tour.status === 'finished' ? 'Completed' : 'For Sale'}
                        </Badge>
                      </div>
                    ))}
                    {tours.length > 10 && (
                      <p className="text-center text-sm text-muted-foreground">
                        And {tours.length - 10} more tours...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Star className="h-5 w-5" />
                    Guest Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center justify-between">
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
                        <p className="text-sm text-muted-foreground">{review.message}</p>
                        {review.tourName && (
                          <p className="text-xs text-muted-foreground/70">
                            Tour: {review.tourName}
                          </p>
                        )}
                        <Separator className="mt-4" />
                      </div>
                    ))}
                    {reviews.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        And {reviews.length - 5} more reviews...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guide License Info (for verification) */}
            {guide.cardNumber && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-primary">
                    <Award className="h-5 w-5" />
                    Verified Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">License Type</p>
                      <p className="font-medium">
                        {guide.cardType === 'international'
                          ? 'International Tour Guide'
                          : 'Domestic Tour Guide'}
                      </p>
                    </div>
                    {guide.cardIssuePlace && (
                      <div>
                        <p className="text-muted-foreground">Issued By</p>
                        <p className="font-medium">{guide.cardIssuePlace}</p>
                      </div>
                    )}
                    {guide.cardIssueDate && (
                      <div>
                        <p className="text-muted-foreground">Issue Date</p>
                        <p className="font-medium">
                          {format(new Date(guide.cardIssueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    {guide.cardExpiryDate && (
                      <div>
                        <p className="text-muted-foreground">Expiry Date</p>
                        <p className="font-medium">
                          {format(new Date(guide.cardExpiryDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
