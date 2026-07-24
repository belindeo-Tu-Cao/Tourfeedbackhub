'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Globe,
  MapPin,
  Search,
  Users,
  Star,
  Briefcase,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { Guide } from '@/lib/types';

interface GuidesExplorerProps {
  guides: Guide[];
}

export default function GuidesExplorer({ guides }: GuidesExplorerProps) {
  const t = useTranslations('guides');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Extract all unique languages
  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    guides.forEach((guide) => {
      guide.languages?.forEach((lang) => langs.add(lang.name));
    });
    return Array.from(langs).sort();
  }, [guides]);

  // Filter guides
  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesSearch =
        searchQuery === '' ||
        guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLanguage =
        selectedLanguage === 'all' ||
        guide.languages?.some((l) => l.name === selectedLanguage);

      const matchesType =
        selectedType === 'all' ||
        (selectedType === 'international' && guide.cardType === 'international') ||
        (selectedType === 'domestic' && guide.cardType === 'domestic');

      return matchesSearch && matchesLanguage && matchesType;
    });
  }, [guides, searchQuery, selectedLanguage, selectedType]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full">
              <Globe className="mr-2 h-4 w-4 flex-shrink-0" />
              <SelectValue placeholder={t('languages')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('languages')}</SelectItem>
              {allLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full">
              <Filter className="mr-2 h-4 w-4 flex-shrink-0" />
              <SelectValue placeholder={t('title')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('title')}</SelectItem>
              <SelectItem value="international">International</SelectItem>
              <SelectItem value="domestic">Domestic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredGuides.length} / {guides.length}
      </p>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">{t('noGuides')}</p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery('');
              setSelectedLanguage('all');
              setSelectedType('all');
            }}
          >
            {tCommon('close')}
          </Button>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredGuides.map((guide) => (
            <motion.div key={guide.id} variants={item}>
              <Link href={`/guide/${guide.id}`} className="block h-full">
                <Card className="group h-full overflow-hidden border-border/60 bg-background/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {/* Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {guide.photo ? (
                      <Image
                        src={guide.photo}
                        alt={guide.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <span className="text-6xl font-bold text-primary/30">
                          {guide.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Card type badge */}
                    {guide.cardType && (
                      <div className="absolute right-3 top-3">
                        <Badge
                          variant="secondary"
                          className="bg-background/90 backdrop-blur-sm border-0"
                        >
                          {guide.cardType === 'international'
                            ? '🌍 International'
                            : '🇻🇳 Domestic'}
                        </Badge>
                      </div>
                    )}

                    {/* Rating badge */}
                    {(guide.averageRating || 0) > 0 && (
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">
                          {guide.averageRating?.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Bottom info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-headline font-semibold text-white">
                        {guide.name}
                      </h3>
                      {guide.experienceYears && (
                        <p className="text-sm text-white/80">
                          {guide.experienceYears}+ {t('years')}
                        </p>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Bio */}
                    {guide.bio && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {guide.bio}
                      </p>
                    )}

                    {/* Languages */}
                    {guide.languages && guide.languages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {guide.languages.slice(0, 4).map((lang) => (
                          <Badge
                            key={lang.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {lang.name}
                          </Badge>
                        ))}
                        {guide.languages.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{guide.languages.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{guide.totalTours || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{guide.totalPax || 0}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        {t('viewProfile')}
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
