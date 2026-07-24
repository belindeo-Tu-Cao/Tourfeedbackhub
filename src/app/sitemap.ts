import type {MetadataRoute} from 'next';
import {getPublicContent, getDestinations, getAllGuides} from '@/lib/content-service';
import {getPayloadClient} from '@/lib/payload';
import {locales} from '@/i18n/routing';
import {localizedUrl, buildAlternates} from '@/lib/locale-path';

type SitemapDoc = { slug: string; updatedAt: Date };

type RouteSpec = {
  path: string;
  lastModified: Date;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

async function getPostsByType(type: 'post' | 'page'): Promise<SitemapDoc[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      where: { and: [{ type: { equals: type } }, { status: { equals: 'published' } }] },
    });
    return result.docs.map((doc: Record<string, any>) => ({
      slug: typeof doc.slug === 'string' && doc.slug ? doc.slug : String(doc.id),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.error(`Error fetching ${type}s for sitemap:`, error);
    return [];
  }
}

/** Expand a single locale-agnostic route into one sitemap entry per locale. */
function expandRoute(baseUrl: string, spec: RouteSpec): MetadataRoute.Sitemap {
  const languages = buildAlternates(baseUrl, spec.path);
  return locales.map((locale) => ({
    url: localizedUrl(baseUrl, locale, spec.path),
    lastModified: spec.lastModified,
    changeFrequency: spec.changeFrequency,
    priority: spec.priority,
    alternates: { languages },
  }));
}

function expandRoutes(baseUrl: string, specs: RouteSpec[]): MetadataRoute.Sitemap {
  return specs.flatMap((spec) => expandRoute(baseUrl, spec));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tourfeedbackhub.web.app';
  const now = new Date();

  // Get dynamic content
  const [publicContent, posts, pages, destinations, guides] = await Promise.all([
    getPublicContent(),
    getPostsByType('post'),
    getPostsByType('page'),
    getDestinations(),
    getAllGuides(),
  ]);

  // Static pages with SEO priorities
  const staticRoutes: RouteSpec[] = [
    {path: '/', lastModified: now, changeFrequency: 'daily', priority: 1},
    {path: '/about', lastModified: now, changeFrequency: 'monthly', priority: 0.8},
    {path: '/tour-types', lastModified: now, changeFrequency: 'monthly', priority: 0.7},
    {path: '/tours', lastModified: now, changeFrequency: 'weekly', priority: 0.9},
    {path: '/destinations', lastModified: now, changeFrequency: 'weekly', priority: 0.8},
    {path: '/guides', lastModified: now, changeFrequency: 'weekly', priority: 0.7},
    {path: '/stories', lastModified: now, changeFrequency: 'weekly', priority: 0.8},
    {path: '/reviews', lastModified: now, changeFrequency: 'daily', priority: 0.9},
    {path: '/faq', lastModified: now, changeFrequency: 'monthly', priority: 0.6},
    {path: '/feedback', lastModified: now, changeFrequency: 'monthly', priority: 0.7},
    {path: '/contact', lastModified: now, changeFrequency: 'monthly', priority: 0.6},
  ];

  // Blog posts
  const postRoutes: RouteSpec[] = posts.map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Custom pages
  const pageRoutes: RouteSpec[] = pages.map((page) => ({
    path: `/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Tours
  const tourRoutes: RouteSpec[] = publicContent.tours.map((tour) => ({
    path: `/tours/${tour.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Stories
  const storyRoutes: RouteSpec[] = publicContent.stories.map((story) => ({
    path: `/stories/${story.slug}`,
    lastModified: story.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Tour types
  const tourTypeRoutes: RouteSpec[] = publicContent.tourTypes.map((type) => ({
    path: `/tour-types/${type.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Guides
  const guideRoutes: RouteSpec[] = guides.map((guide) => ({
    path: `/guide/${guide.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Destinations
  const destinationRoutes: RouteSpec[] = destinations.map((destination) => ({
    path: `/destinations/${destination.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return expandRoutes(baseUrl, [
    ...staticRoutes,
    ...postRoutes,
    ...pageRoutes,
    ...tourRoutes,
    ...storyRoutes,
    ...tourTypeRoutes,
    ...guideRoutes,
    ...destinationRoutes,
  ]);
}
