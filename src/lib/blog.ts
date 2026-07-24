import { cache } from "react";
import { getPayloadClient, mediaUrl } from "@/lib/payload";
import { asLocale, DEFAULT_LOCALE } from "@/lib/locale";

type Doc = Record<string, any>;

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  authorName: string;
  categoryIds: string[];
  categoryNames: string[];
  publishedAt: Date | null;
  createdAt: Date;
  viewCount: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  count: number;
}

function relId(value: unknown): string {
  if (value && typeof value === "object" && "id" in value) return String((value as Doc).id);
  return String(value ?? "");
}

function lexicalToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Doc;
  if (typeof n.text === "string") return n.text;
  const root = n.root ?? n;
  const children = Array.isArray(root.children) ? root.children : [];
  return children.map((c: unknown) => lexicalToText(c)).join(" ").replace(/\s+/g, " ").trim();
}

function mapItem(doc: Doc): BlogListItem {
  const categories = Array.isArray(doc.categories) ? doc.categories : [];
  return {
    id: String(doc.id),
    title: doc.title ?? "Untitled",
    slug: doc.slug ?? String(doc.id),
    excerpt: doc.excerpt ?? "",
    content: lexicalToText(doc.content),
    featuredImageUrl: mediaUrl(doc.featuredImage),
    featuredImageAlt:
      typeof doc.featuredImage === "object" && doc.featuredImage
        ? doc.featuredImage.alt ?? doc.title ?? ""
        : doc.title ?? "",
    authorName:
      typeof doc.author === "object" && doc.author
        ? doc.author.displayName ?? doc.author.email ?? "Unknown"
        : "Unknown",
    categoryIds: categories.map(relId).filter(Boolean),
    categoryNames: categories
      .map((c: Doc) => (typeof c === "object" ? c.name ?? c.title : null))
      .filter(Boolean),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    viewCount: typeof doc.viewCount === "number" ? doc.viewCount : 0,
  };
}

export const getBlogPosts = cache(async (locale?: string): Promise<BlogListItem[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "posts",
      depth: 1,
      limit: 200,
      sort: "-publishedAt",
      where: { and: [{ type: { equals: "post" } }, { status: { equals: "published" } }] },
      locale: asLocale(locale),
    });
    return result.docs.map(mapItem);
  } catch (error) {
    console.error("Failed to load blog posts", error);
    return [];
  }
});

export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({ collection: "categories", depth: 0, limit: 200 });
    return result.docs.map((doc: Doc) => ({
      id: String(doc.id),
      name: doc.name ?? doc.title ?? "Untitled",
      count: typeof doc.count === "number" ? doc.count : 0,
    }));
  } catch (error) {
    console.error("Failed to load categories", error);
    return [];
  }
});

/**
 * Raw published post by slug, including Lexical richText content for rendering.
 * `slug` isn't localized, so match at DEFAULT_LOCALE first, then load the target locale.
 */
export const getBlogPost = cache(async (slug: string, locale?: string) => {
  try {
    const payload = await getPayloadClient();
    const found = await payload.find({
      collection: "posts",
      depth: 0,
      limit: 1,
      where: {
        and: [
          { slug: { equals: slug } },
          { type: { equals: "post" } },
          { status: { equals: "published" } },
        ],
      },
      locale: DEFAULT_LOCALE,
    });
    const docId = found.docs[0]?.id;
    if (!docId) return null;
    return await payload.findByID({
      collection: "posts",
      id: docId,
      depth: 1,
      locale: asLocale(locale),
    });
  } catch (error) {
    console.error("Failed to load blog post", error);
    return null;
  }
});
