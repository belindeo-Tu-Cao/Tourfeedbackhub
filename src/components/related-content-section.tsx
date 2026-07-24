import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import type { RelatedItemSummary } from '@/lib/types';

interface RelatedContentSectionProps {
  title: string;
  items?: RelatedItemSummary[] | null;
  icon?: LucideIcon;
}

export function RelatedContentSection({ title, items, icon: Icon = Sparkles }: RelatedContentSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-headline font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={`${item.type}-${item.id}`} href={item.href} className="group">
            <Card className="h-full overflow-hidden border-border/60 bg-background/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              {item.imageUrl ? (
                <div className="relative h-36 bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : null}
              <CardContent className="p-4">
                <h3 className="font-headline font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.excerpt ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
