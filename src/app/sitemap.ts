import type {MetadataRoute} from 'next';
import {getPublicContent, getDestinations, getAllGuides} from '@/lib/content-service';
import {getPayloadClient} from '@/lib/payload';

type SitemapDoc = { slug: string; updatedAt: Date };

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

  // Get dynamic content
  const [publicContent, posts, pages, destinations, guides] = await Promise.all([
    getPublicContent(),
    getPostsByType('post'),
    getPostsByType('page'),
    getDestinations(),
    getAllGuides(),
  ]);

  // Static pages with SEO priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1},
    {url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8},
    {url: `${baseUrl}/tour-types`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7},
    {url: `${baseUrl}/tours`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9},
    {url: `${baseUrl}/destinations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8},
    {url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7},
    {url: `${baseUrl}/stories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8},
    {url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9},
    {url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6},
    {url: `${baseUrl}/feedback`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7},
    {url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6},
  ];

  // Blog posts
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Custom pages
  const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Tours
  const tourEntries: MetadataRoute.Sitemap = publicContent.tours.map((tour) => ({
    url: `${baseUrl}/tours/${tour.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Stories
  const storyEntries: MetadataRoute.Sitemap = publicContent.stories.map((story) => ({
    url: `${baseUrl}/stories/${story.slug}`,
    lastModified: story.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Tour types
  const tourTypeEntries: MetadataRoute.Sitemap = publicContent.tourTypes.map((type) => ({
    url: `${baseUrl}/tour-types/${type.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Guides
  const guideEntries: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guide/${guide.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Destinations
  const destinationEntries: MetadataRoute.Sitemap = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...postEntries,
    ...pageEntries,
    ...tourEntries,
    ...storyEntries,
    ...tourTypeEntries,
    ...guideEntries,
    ...destinationEntries,
  ];
}
