'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, ArrowRight } from 'lucide-react';
import type { Guide } from '@/lib/types';

interface GuidesListProps {
  guides: Guide[];
}

export default function GuidesList({ guides }: GuidesListProps) {
  const t = useTranslations('guides');

  if (guides.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t('noGuides')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <Card
          key={guide.id}
          className="group overflow-hidden transition-shadow hover:shadow-lg"
        >
          <div className="relative h-48 bg-muted">
            {guide.photo ? (
              <Image
                src={guide.photo}
                alt={guide.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-muted-foreground/30">
                {guide.name.charAt(0)}
              </div>
            )}
            {guide.cardType && (
              <div className="absolute right-3 top-3">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                  {guide.cardType === 'international' ? '🌍 International' : '🇻🇳 Domestic'}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-xl font-headline font-semibold">{guide.name}</h2>
              {guide.experienceYears && (
                <p className="text-sm text-muted-foreground">
                  {guide.experienceYears}+ {t('years')}
                </p>
              )}
            </div>

            {guide.bio && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {guide.bio}
              </p>
            )}

            {/* Languages */}
            {guide.languages && guide.languages.length > 0 && (
              <div className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {guide.languages.slice(0, 3).map((lang) => (
                    <Badge key={lang.id} variant="outline" className="text-xs">
                      {lang.name}
                    </Badge>
                  ))}
                  {guide.languages.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{guide.languages.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            {(guide.totalTours || 0) > 0 && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{guide.totalTours}</span>
                <span>•</span>
                <span>{guide.totalPax || 0}</span>
              </div>
            )}

            <Button asChild variant="ghost" className="w-full justify-between px-4">
              <Link href={`/guide/${guide.id}`}>
                {t('viewProfile')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
