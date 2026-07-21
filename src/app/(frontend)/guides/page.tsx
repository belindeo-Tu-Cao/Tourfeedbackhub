import { getAllGuides } from '@/lib/content-service';
import GuidesList from '@/components/guides-list';
import { Breadcrumb } from '@/components/breadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Tour Guides',
  description: 'Meet our experienced tour guides ready to show you the best of Vietnam',
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={[{ label: 'Guides' }]} className="mb-6" />

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
            Our Tour Guides
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Meet our experienced guides ready to show you the best destinations.
            Each guide is verified and ready for your next adventure.
          </p>
        </div>

        <GuidesList guides={guides} />
      </div>
    </div>
  );
}
