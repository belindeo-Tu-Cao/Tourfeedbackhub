import { cache } from "react";
import { getPayloadClient, mediaUrl } from "@/lib/payload";
import { siteSettings as fallbackSiteSettings } from "@/lib/data";
import type {
  PublicContent,
  Review,
  SiteSettings,
  Story,
  Tour,
  TourType,
  HeroSlide,
  Post,
  PostStatus,
  PostType,
  Guide,
  GuideLanguageProficiency,
  RelatedItemSummary,
  RelatedItemType,
  Destination,
  MustSeeDoEatItem,
  Faq,
  FaqRelatedToType,
  Comment,
} from "@/lib/types";

type Doc = Record<string, any>;

function id(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as { id: unknown }).id);
  }
  return String(value);
}

function toDate(value: unknown): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

function toOptionalDate(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function relNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      typeof item === "object" && item !== null
        ? String((item as Doc).name ?? (item as Doc).title ?? "")
        : ""
    )
    .filter(Boolean);
}

function relIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => id(item)).filter(Boolean);
}

// Extract plain text from a Lexical richText value.
function lexicalToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Doc;
  if (typeof n.text === "string") return n.text;
  const root = n.root ?? n;
  const children = Array.isArray(root.children) ? root.children : [];
  return children
    .map((child: unknown) => lexicalToText(child))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapSiteSettings(data: Doc | undefined): SiteSettings {
  const base: SiteSettings = {
    ...fallbackSiteSettings,
    contact: { ...fallbackSiteSettings.contact },
    social: { ...fallbackSiteSettings.social },
    values: Array.isArray(fallbackSiteSettings.values) ? [...fallbackSiteSettings.values] : [],
    languages: Array.isArray(fallbackSiteSettings.languages) ? [...fallbackSiteSettings.languages] : [],
  };

  if (!data) return base;

  const values = Array.isArray(data.values)
    ? data.values.map((v: Doc) => (typeof v === "string" ? v : v?.value)).filter(Boolean)
    : base.values;
  const languages = Array.isArray(data.languages)
    ? data.languages.map((l: Doc) => (typeof l === "string" ? l : l?.lang)).filter(Boolean)
    : base.languages;

  return {
    siteName: typeof data.siteName === "string" && data.siteName.trim() ? data.siteName : base.siteName,
    logoUrlLight: mediaUrl(data.logoLight) || base.logoUrlLight,
    logoUrlDark: mediaUrl(data.logoDark) || base.logoUrlDark,
    heroTitle: typeof data.heroTitle === "string" ? data.heroTitle : base.heroTitle,
    heroSubtitle: typeof data.heroSubtitle === "string" ? data.heroSubtitle : base.heroSubtitle,
    heroCtaLabel: typeof data.heroCtaLabel === "string" ? data.heroCtaLabel : base.heroCtaLabel,
    heroMediaUrl: mediaUrl(data.heroMedia) || base.heroMediaUrl,
    aboutTitle: typeof data.aboutTitle === "string" ? data.aboutTitle : base.aboutTitle,
    aboutDescription: typeof data.aboutDescription === "string" ? data.aboutDescription : base.aboutDescription,
    missionStatement: typeof data.missionStatement === "string" ? data.missionStatement : base.missionStatement,
    values,
    contact: {
      ...base.contact,
      ...(typeof data.contact === "object" && data.contact !== null ? data.contact : {}),
    },
    social: {
      ...base.social,
      ...(typeof data.social === "object" && data.social !== null ? data.social : {}),
    },
    copyright: typeof data.copyright === "string" ? data.copyright : base.copyright,
    languages,
    defaultLanguage: typeof data.defaultLanguage === "string" ? data.defaultLanguage : base.defaultLanguage,
    primaryColor: typeof data.primaryColor === "string" ? data.primaryColor : base.primaryColor,
    accentColor: typeof data.accentColor === "string" ? data.accentColor : base.accentColor,
  };
}

function mapTourType(doc: Doc): TourType {
  return {
    id: id(doc.id),
    slug: typeof doc.slug === "string" && doc.slug ? doc.slug : id(doc.id),
    title: doc.title ?? "Tour Type",
    description: doc.description ?? "",
    icon: doc.icon ?? undefined,
    order: typeof doc.order === "number" ? doc.order : undefined,
  };
}

export function toRelatedItemSummary(doc: unknown, type: RelatedItemType): RelatedItemSummary | null {
  if (!doc || typeof doc !== "object") return null;
  const d = doc as Doc;
  const itemId = id(d.id ?? d);
  if (!itemId) return null;

  switch (type) {
    case "post": {
      const slug = typeof d.slug === "string" && d.slug ? d.slug : itemId;
      return {
        id: itemId,
        type,
        title: d.title ?? "Post",
        slug,
        href: `/blog/${slug}`,
        imageUrl: mediaUrl(d.featuredImage) || undefined,
        excerpt: typeof d.excerpt === "string" ? d.excerpt : undefined,
      };
    }
    case "story": {
      const slug = typeof d.slug === "string" && d.slug ? d.slug : itemId;
      return {
        id: itemId,
        type,
        title: d.title ?? "Story",
        slug,
        href: `/stories/${slug}`,
        imageUrl: mediaUrl(d.coverImage) || undefined,
        excerpt: typeof d.excerpt === "string" ? d.excerpt : undefined,
      };
    }
    case "tour": {
      const firstPhoto = Array.isArray(d.photos) ? d.photos[0]?.photo : undefined;
      return {
        id: itemId,
        type,
        title: d.name ?? "Tour",
        href: `/tours/${itemId}`,
        imageUrl: mediaUrl(firstPhoto) || undefined,
        excerpt: typeof d.summary === "string" ? d.summary : undefined,
      };
    }
    case "guide": {
      return {
        id: itemId,
        type,
        title: d.name ?? "Guide",
        href: `/guide/${itemId}`,
        imageUrl: mediaUrl(d.photo) || undefined,
        excerpt: typeof d.bio === "string" ? d.bio : undefined,
      };
    }
    case "tourType": {
      const slug = typeof d.slug === "string" && d.slug ? d.slug : itemId;
      return {
        id: itemId,
        type,
        title: d.title ?? "Tour Type",
        slug,
        href: `/tour-types/${slug}`,
        excerpt: typeof d.description === "string" ? d.description : undefined,
      };
    }
    case "destination": {
      const slug = typeof d.slug === "string" && d.slug ? d.slug : itemId;
      return {
        id: itemId,
        type,
        title: d.name ?? "Destination",
        slug,
        href: `/destinations/${slug}`,
        imageUrl: mediaUrl(d.heroImage) || undefined,
        excerpt: typeof d.summary === "string" ? d.summary : undefined,
      };
    }
    default:
      return null;
  }
}

export function toRelatedItemSummaries(value: unknown, type: RelatedItemType): RelatedItemSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toRelatedItemSummary(item, type))
    .filter((item): item is RelatedItemSummary => item !== null);
}

function mapTour(doc: Doc): Tour {
  const photoUrls = Array.isArray(doc.photos)
    ? doc.photos.map((p: Doc) => mediaUrl(p?.photo)).filter(Boolean)
    : [];
  const videoUrls = Array.isArray(doc.videos)
    ? doc.videos.map((v: Doc) => String(v?.url ?? "").trim()).filter(Boolean)
    : [];

  return {
    id: id(doc.id),
    code: doc.code ?? `FT-${id(doc.id)}`,
    name: doc.name ?? "Tour",
    summary: doc.summary ?? "",
    startDate: toDate(doc.startDate),
    endDate: toDate(doc.endDate),
    clientCount: typeof doc.clientCount === "number" ? doc.clientCount : Number(doc.clientCount) || 0,
    clientNationalities: relNames(doc.clientNationalities),
    clientNationalityIds: relIds(doc.clientNationalities),
    clientCountry: doc.clientCountry ?? "",
    clientCity: doc.clientCity ?? "",
    provinces: relNames(doc.provinces),
    provinceIds: relIds(doc.provinces),
    itinerary: doc.itinerary ?? "",
    photoUrls,
    videoUrls,
    tourTypeIds: relIds(doc.tourTypes),
    guideIds: relIds(doc.guides),
    guides: toRelatedItemSummaries(doc.guides, "guide"),
    guideLanguages: relNames(doc.guideLanguages),
    guideLanguageIds: relIds(doc.guideLanguages),
    status: doc.status === "for_sale" ? "for_sale" : "finished",
    relatedPostIds: relIds(doc.relatedPosts),
    relatedPosts: toRelatedItemSummaries(doc.relatedPosts, "post"),
    relatedStoryIds: relIds(doc.relatedStories),
    relatedStories: toRelatedItemSummaries(doc.relatedStories, "story"),
    price: typeof doc.price === "number" ? doc.price : undefined,
    currency: doc.currency === "USD" ? "USD" : doc.currency === "VND" ? "VND" : undefined,
    priceUnit: doc.priceUnit === "per_group" ? "per_group" : doc.priceUnit === "per_person" ? "per_person" : undefined,
    durationDays: typeof doc.durationDays === "number" ? doc.durationDays : undefined,
    groupSizeMin: typeof doc.groupSizeMin === "number" ? doc.groupSizeMin : undefined,
    groupSizeMax: typeof doc.groupSizeMax === "number" ? doc.groupSizeMax : undefined,
    departureSchedule: doc.departureSchedule ?? undefined,
    highlights: Array.isArray(doc.highlights) ? doc.highlights.map((h: Doc) => h?.item).filter(Boolean) : undefined,
    included: Array.isArray(doc.included) ? doc.included.map((h: Doc) => h?.item).filter(Boolean) : undefined,
    excluded: Array.isArray(doc.excluded) ? doc.excluded.map((h: Doc) => h?.item).filter(Boolean) : undefined,
  };
}

function mapStory(doc: Doc): Story {
  return {
    id: id(doc.id),
    slug: typeof doc.slug === "string" && doc.slug ? doc.slug : id(doc.id),
    title: doc.title ?? "Story",
    excerpt: doc.excerpt ?? "",
    content: doc.content ? lexicalToText(doc.content) : undefined,
    coverImageUrl: mediaUrl(doc.coverImage),
    publishedAt: toDate(doc.publishedAt ?? doc.createdAt),
    readTimeMinutes: typeof doc.readTimeMinutes === "number" ? doc.readTimeMinutes : undefined,
    tags: Array.isArray(doc.tags) ? doc.tags.map((t: Doc) => t?.tag).filter(Boolean) : undefined,
    category: typeof doc.category === "string" ? doc.category : undefined,
    relatedGuideIds: relIds(doc.relatedGuides),
    relatedGuides: toRelatedItemSummaries(doc.relatedGuides, "guide"),
    relatedTourTypeIds: relIds(doc.relatedTourTypes),
    relatedTourTypes: toRelatedItemSummaries(doc.relatedTourTypes, "tourType"),
  };
}

function mapReview(doc: Doc): Review {
  return {
    id: id(doc.id),
    authorDisplay: doc.authorDisplay ?? "Anonymous",
    country: doc.country ?? "",
    language: doc.language ?? "en",
    rating: typeof doc.rating === "number" ? doc.rating : Number(doc.rating) || 0,
    message: doc.message ?? "",
    tourId: doc.tour ? id(doc.tour) : undefined,
    tourName: doc.tourName ?? undefined,
    photoUrls: Array.isArray(doc.photoUrls)
      ? doc.photoUrls.map((p: Doc) => p?.url).filter(Boolean)
      : undefined,
    status: doc.status ?? "approved",
    createdAt: toDate(doc.approvedAt ?? doc.createdAt),
    summary: doc.summary ?? undefined,
    reviewType: typeof doc.reviewType === "string" ? doc.reviewType : undefined,
  };
}

function mapPost(doc: Doc): Post {
  const allowedStatuses: PostStatus[] = ["draft", "published", "scheduled", "private", "trash"];
  const rawStatus = typeof doc.status === "string" ? doc.status.toLowerCase() : "draft";
  const status: PostStatus = allowedStatuses.includes(rawStatus as PostStatus)
    ? (rawStatus as PostStatus)
    : "draft";
  const type: PostType = doc.type === "page" ? "page" : "post";

  return {
    id: id(doc.id),
    type,
    title: typeof doc.title === "string" ? doc.title : "Untitled",
    slug: typeof doc.slug === "string" && doc.slug.trim() ? doc.slug : id(doc.id),
    content: lexicalToText(doc.content),
    excerpt: typeof doc.excerpt === "string" ? doc.excerpt : "",
    status,
    featuredImageId: doc.featuredImage ? id(doc.featuredImage) : undefined,
    authorId: doc.author ? id(doc.author) : "unknown",
    authorName:
      typeof doc.author === "object" && doc.author
        ? doc.author.displayName ?? doc.author.email ?? "Unknown"
        : "Unknown",
    categoryIds: relIds(doc.categories),
    tagIds: relIds(doc.tags),
    publishedAt: toOptionalDate(doc.publishedAt ?? doc.createdAt),
    scheduledFor: toOptionalDate(doc.scheduledFor),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt ?? doc.createdAt),
    viewCount: typeof doc.viewCount === "number" ? doc.viewCount : 0,
    commentCount: typeof doc.commentCount === "number" ? doc.commentCount : 0,
    allowComments: doc.allowComments !== false,
    seo: typeof doc.seo === "object" ? doc.seo : undefined,
    locale: typeof doc.locale === "string" ? doc.locale : undefined,
    relatedPostIds: relIds(doc.relatedPosts),
    relatedPosts: toRelatedItemSummaries(doc.relatedPosts, "post"),
    relatedStoryIds: relIds(doc.relatedStories),
    relatedStories: toRelatedItemSummaries(doc.relatedStories, "story"),
    relatedGuideIds: relIds(doc.relatedGuides),
    relatedGuides: toRelatedItemSummaries(doc.relatedGuides, "guide"),
    relatedTourTypeIds: relIds(doc.relatedTourTypes),
    relatedTourTypes: toRelatedItemSummaries(doc.relatedTourTypes, "tourType"),
  };
}

function mapSlide(doc: Doc): HeroSlide {
  return {
    id: id(doc.id),
    locale: String(doc.locale ?? "en").toLowerCase(),
    title: doc.title ?? "Untitled slide",
    subtitle: doc.subtitle ?? undefined,
    buttonText: doc.buttonText ?? "Learn more",
    buttonLink: doc.buttonLink ?? "/",
    imageUrl: mediaUrl(doc.image),
    order: typeof doc.order === "number" ? doc.order : Number(doc.order) || 0,
    active: doc.active !== false,
    status: doc.status === "published" ? "published" : "draft",
    overlayOpacity: typeof doc.overlayOpacity === "number" ? doc.overlayOpacity : null,
    alt: typeof doc.alt === "string" ? doc.alt : null,
    startAt: toOptionalDate(doc.startAt),
    endAt: toOptionalDate(doc.endAt),
    updatedBy: null,
    updatedAt: toOptionalDate(doc.updatedAt),
  };
}

function isSlideLive(slide: HeroSlide, reference: Date): boolean {
  if (!slide.active || slide.status !== "published") return false;
  if (!slide.imageUrl || !slide.title) return false;
  if (slide.startAt && slide.startAt > reference) return false;
  if (slide.endAt && slide.endAt < reference) return false;
  return true;
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "site-settings",
    limit: 1,
    depth: 1,
  });
  return mapSiteSettings(result.docs[0]);
}

async function fetchPublicContent(): Promise<PublicContent> {
  const payload = await getPayloadClient();

  const [settings, tourTypes, tours, stories, reviews, slides, posts, guidesResult] = await Promise.all([
    fetchSiteSettings(),
    payload.find({ collection: "tour-types", limit: 100, depth: 0, sort: "order" }),
    payload.find({ collection: "tours", limit: 100, depth: 2 }),
    payload.find({ collection: "stories", limit: 100, depth: 1, sort: "-publishedAt" }),
    payload.find({
      collection: "reviews",
      limit: 100,
      depth: 1,
      where: { status: { equals: "approved" } },
      sort: "-approvedAt",
    }),
    payload.find({ collection: "slides", limit: 100, depth: 1, sort: "order" }),
    payload.find({
      collection: "posts",
      limit: 6,
      depth: 1,
      where: { and: [{ type: { equals: "post" } }, { status: { equals: "published" } }] },
      sort: "-publishedAt",
    }),
    payload.find({ collection: "guides", limit: 100, depth: 1, sort: "name" }),
  ]);

  const now = new Date();
  const mappedSlides = slides.docs
    .map(mapSlide)
    .filter((slide) => isSlideLive(slide, now))
    .sort((a, b) => (a.order === b.order ? a.title.localeCompare(b.title) : a.order - b.order));

  return {
    siteSettings: settings,
    tourTypes: tourTypes.docs.map(mapTourType),
    tours: tours.docs.map(mapTour),
    stories: stories.docs.map(mapStory),
    reviews: reviews.docs.map(mapReview),
    slides: mappedSlides,
    posts: posts.docs.map(mapPost),
    guides: guidesResult.docs.map(mapGuide),
  };
}

export const getPublicContent = cache(async (): Promise<PublicContent> => {
  try {
    return await fetchPublicContent();
  } catch (error) {
    console.warn("Falling back to local content because the database could not be reached", error);
    return {
      siteSettings: fallbackSiteSettings,
      tourTypes: [],
      tours: [],
      stories: [],
      reviews: [],
      slides: [],
      posts: [],
      guides: [],
    };
  }
});

export const getSiteSettings = cache(async () => {
  try {
    return await fetchSiteSettings();
  } catch (error) {
    console.warn("Falling back to local site settings", error);
    return fallbackSiteSettings;
  }
});

// Guide Profile functions

function mapGuideLanguage(item: Doc): GuideLanguageProficiency {
  return {
    id: id(item.id ?? item),
    name: item.name ?? (typeof item === "string" ? item : ""),
    code: item.code ?? undefined,
    proficiency: item.proficiency ?? undefined,
  };
}

function mapGuide(doc: Doc): Guide {
  const languages = Array.isArray(doc.languages)
    ? doc.languages.map((l: Doc) => mapGuideLanguage(l))
    : [];
  const provinces = relNames(doc.provinces);
  const nationalities = relNames(doc.nationalities);

  return {
    id: id(doc.id),
    name: doc.name ?? "Guide",
    photo: mediaUrl(doc.photo),
    phone: doc.phone ?? undefined,
    email: doc.email ?? undefined,
    bio: doc.bio ?? undefined,
    cardNumber: doc.cardNumber ?? undefined,
    cardType: doc.cardType ?? undefined,
    cardIssuePlace: doc.cardIssuePlace ?? undefined,
    cardIssueDate: doc.cardIssueDate ?? undefined,
    cardExpiryDate: doc.cardExpiryDate ?? undefined,
    experienceYears: typeof doc.experienceYears === "number" ? doc.experienceYears : undefined,
    languages,
    languageIds: relIds(doc.languages),
    provinces,
    provinceIds: relIds(doc.provinces),
    nationalities,
    nationalityIds: relIds(doc.nationalities),
    tourTypeIds: relIds(doc.tourTypes),
    tourTypes: toRelatedItemSummaries(doc.tourTypes, "tourType"),
  };
}

async function fetchGuideById(guideId: string): Promise<Guide | null> {
  const payload = await getPayloadClient();

  try {
    const guideDoc = await payload.findByID({
      collection: "guides",
      id: guideId,
      depth: 2,
    });

    if (!guideDoc) return null;

    const guide = mapGuide(guideDoc);

    // Fetch tours for this guide
    const toursResult = await payload.find({
      collection: "tours",
      depth: 1,
      where: {
        and: [
          { guides: { equals: guideId } },
          { status: { equals: "finished" } },
        ],
      },
      sort: "-startDate",
      limit: 100,
    });

    const tours = toursResult.docs.map(mapTour);

    // Compute stats
    guide.totalTours = tours.length;
    guide.totalPax = tours.reduce((sum, tour) => sum + (tour.clientCount || 0), 0);

    // Fetch reviews for this guide's tours
    const tourIds = tours.map((t) => t.id);
    if (tourIds.length > 0) {
      const reviewsResult = await payload.find({
        collection: "reviews",
        depth: 0,
        where: {
          and: [
            { tour: { in: tourIds } },
            { status: { equals: "approved" } },
          ],
        },
        limit: 100,
      });

      const reviews = reviewsResult.docs.map(mapReview);
      guide.totalReviews = reviews.length;
      guide.averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
    } else {
      guide.totalReviews = 0;
      guide.averageRating = 0;
    }

    return guide;
  } catch (error) {
    console.warn("Error fetching guide:", error);
    return null;
  }
}

async function fetchGuideTours(guideId: string): Promise<Tour[]> {
  const payload = await getPayloadClient();

  try {
    const result = await payload.find({
      collection: "tours",
      depth: 1,
      where: {
        and: [
          { guides: { equals: guideId } },
          { status: { equals: "finished" } },
        ],
      },
      sort: "-startDate",
      limit: 100,
    });

    return result.docs.map(mapTour);
  } catch (error) {
    console.warn("Error fetching guide tours:", error);
    return [];
  }
}

async function fetchGuideReviews(guideId: string): Promise<Review[]> {
  const payload = await getPayloadClient();

  try {
    // First get guide's tours
    const toursResult = await payload.find({
      collection: "tours",
      depth: 0,
      where: {
        and: [
          { guides: { equals: guideId } },
          { status: { equals: "finished" } },
        ],
      },
      limit: 100,
    });

    const tourIds = toursResult.docs.map((t) => id(t.id));

    if (tourIds.length === 0) return [];

    // Then get reviews for those tours
    const reviewsResult = await payload.find({
      collection: "reviews",
      depth: 1,
      where: {
        and: [
          { tour: { in: tourIds } },
          { status: { equals: "approved" } },
        ],
      },
      sort: "-approvedAt",
      limit: 100,
    });

    return reviewsResult.docs.map(mapReview);
  } catch (error) {
    console.warn("Error fetching guide reviews:", error);
    return [];
  }
}

export const getGuideProfile = cache(async (guideId: string) => {
  try {
    return await fetchGuideById(guideId);
  } catch (error) {
    console.warn("Error fetching guide profile:", error);
    return null;
  }
});

export const getGuideTours = cache(async (guideId: string) => {
  try {
    return await fetchGuideTours(guideId);
  } catch (error) {
    console.warn("Error fetching guide tours:", error);
    return [];
  }
});

export const getGuideReviews = cache(async (guideId: string) => {
  try {
    return await fetchGuideReviews(guideId);
  } catch (error) {
    console.warn("Error fetching guide reviews:", error);
    return [];
  }
});

export const getAllGuides = cache(async (): Promise<Guide[]> => {
  const payload = await getPayloadClient();

  try {
    const result = await payload.find({
      collection: "guides",
      depth: 1,
      limit: 100,
      sort: "name",
    });

    return result.docs.map(mapGuide);
  } catch (error) {
    console.warn("Error fetching guides:", error);
    return [];
  }
});

export const getGuideRelatedPosts = cache(async (guideId: string): Promise<RelatedItemSummary[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "posts",
      depth: 1,
      limit: 20,
      where: {
        and: [
          { relatedGuides: { equals: guideId } },
          { status: { equals: "published" } },
        ],
      },
      sort: "-publishedAt",
    });
    return toRelatedItemSummaries(result.docs, "post");
  } catch (error) {
    console.warn("Error fetching guide related posts:", error);
    return [];
  }
});

export const getTourReviews = cache(async (tourId: string): Promise<Review[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "reviews",
      depth: 0,
      limit: 100,
      where: {
        and: [
          { tour: { equals: tourId } },
          { status: { equals: "approved" } },
        ],
      },
      sort: "-approvedAt",
    });
    return result.docs.map(mapReview);
  } catch (error) {
    console.warn("Error fetching tour reviews:", error);
    return [];
  }
});

/** Tours whose `relatedPosts`/`relatedStories` reference this content item (reverse lookup). */
export const getRelatedTours = cache(
  async (field: "relatedPosts" | "relatedStories", targetId: string): Promise<RelatedItemSummary[]> => {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "tours",
        depth: 1,
        limit: 20,
        where: { [field]: { equals: targetId } },
      });
      return toRelatedItemSummaries(result.docs, "tour");
    } catch (error) {
      console.warn(`Error fetching tours related via ${field}:`, error);
      return [];
    }
  }
);

/** Posts whose `relatedStories`/`relatedGuides`/`relatedTourTypes` reference this content item (reverse lookup). */
export const getRelatedPostsByField = cache(
  async (
    field: "relatedStories" | "relatedGuides" | "relatedTourTypes",
    targetId: string
  ): Promise<RelatedItemSummary[]> => {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "posts",
        depth: 1,
        limit: 20,
        where: {
          and: [
            { [field]: { equals: targetId } },
            { status: { equals: "published" } },
          ],
        },
      });
      return toRelatedItemSummaries(result.docs, "post");
    } catch (error) {
      console.warn(`Error fetching posts related via ${field}:`, error);
      return [];
    }
  }
);

export const getTourTypeBySlug = cache(async (slug: string): Promise<TourType | null> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "tour-types",
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } },
    });
    const doc = result.docs[0];
    return doc ? mapTourType(doc) : null;
  } catch (error) {
    console.warn("Error fetching tour type:", error);
    return null;
  }
});

export const getToursForTourType = cache(async (tourTypeId: string): Promise<RelatedItemSummary[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "tours",
      depth: 1,
      limit: 50,
      where: { and: [{ tourTypes: { equals: tourTypeId } }, { status: { equals: "finished" } }] },
    });
    return toRelatedItemSummaries(result.docs, "tour");
  } catch (error) {
    console.warn("Error fetching tours for tour type:", error);
    return [];
  }
});

export const getGuidesForTourType = cache(async (tourTypeId: string): Promise<RelatedItemSummary[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "guides",
      depth: 1,
      limit: 50,
      where: { tourTypes: { equals: tourTypeId } },
    });
    return toRelatedItemSummaries(result.docs, "guide");
  } catch (error) {
    console.warn("Error fetching guides for tour type:", error);
    return [];
  }
});

export const getStoriesByField = cache(
  async (field: "relatedTourTypes" | "relatedGuides", targetId: string): Promise<RelatedItemSummary[]> => {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "stories",
        depth: 1,
        limit: 20,
        where: { [field]: { equals: targetId } },
      });
      return toRelatedItemSummaries(result.docs, "story");
    } catch (error) {
      console.warn(`Error fetching stories related via ${field}:`, error);
      return [];
    }
  }
);

export const getStoryBySlug = cache(async (slug: string): Promise<Story | null> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "stories",
      depth: 1,
      limit: 1,
      where: { slug: { equals: slug } },
    });
    const doc = result.docs[0];
    return doc ? mapStory(doc) : null;
  } catch (error) {
    console.warn("Error fetching story:", error);
    return null;
  }
});

/** Posts's own `relatedPosts` if curated, otherwise falls back to same-category posts. */
export async function getRelatedPostsFor(
  postId: string,
  categoryIds: string[],
  explicit: RelatedItemSummary[]
): Promise<RelatedItemSummary[]> {
  if (explicit.length > 0) return explicit;
  try {
    const payload = await getPayloadClient();
    const conditions: Doc[] = [
      { id: { not_equals: postId } },
      { type: { equals: "post" } },
      { status: { equals: "published" } },
    ];
    if (categoryIds.length > 0) {
      conditions.push({ categories: { in: categoryIds } });
    }
    const result = await payload.find({
      collection: "posts",
      depth: 1,
      limit: 3,
      where: { and: conditions },
      sort: "-publishedAt",
    });
    return toRelatedItemSummaries(result.docs, "post");
  } catch (error) {
    console.warn("Error fetching related posts:", error);
    return [];
  }
}

function mapComment(doc: Doc): Comment {
  return {
    id: id(doc.id),
    postId: doc.post ? id(doc.post) : "",
    postType: "post",
    authorName: doc.authorName ?? "Anonymous",
    authorEmail: doc.authorEmail ?? "",
    authorUrl: typeof doc.authorUrl === "string" ? doc.authorUrl : undefined,
    content: doc.content ?? "",
    status: doc.status ?? "pending",
    parentId: doc.parent ? id(doc.parent) : null,
    userId: doc.user ? id(doc.user) : undefined,
    createdAt: toDate(doc.createdAt),
    updatedAt: doc.updatedAt ? toDate(doc.updatedAt) : undefined,
  };
}

export const getPostComments = cache(async (postId: string): Promise<Comment[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "comments",
      depth: 0,
      limit: 200,
      where: {
        and: [
          { post: { equals: postId } },
          { status: { equals: "approved" } },
        ],
      },
      sort: "createdAt",
    });
    return result.docs.map(mapComment);
  } catch (error) {
    console.warn("Error fetching post comments:", error);
    return [];
  }
});

function mapMustItems(value: unknown): MustSeeDoEatItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item: Doc) => ({
      title: item?.title ?? "",
      description: typeof item?.description === "string" ? item.description : undefined,
      imageUrl: mediaUrl(item?.image) || undefined,
    }))
    .filter((item) => item.title);
}

function mapDestination(doc: Doc): Destination {
  return {
    id: id(doc.id),
    name: doc.name ?? "Destination",
    slug: typeof doc.slug === "string" && doc.slug ? doc.slug : id(doc.id),
    summary: typeof doc.summary === "string" ? doc.summary : undefined,
    description: doc.description ? lexicalToText(doc.description) : undefined,
    heroImageUrl: mediaUrl(doc.heroImage) || undefined,
    order: typeof doc.order === "number" ? doc.order : undefined,
    tours: toRelatedItemSummaries(doc.tours, "tour"),
    tourTypes: toRelatedItemSummaries(doc.tourTypes, "tourType"),
    guides: toRelatedItemSummaries(doc.guides, "guide"),
    posts: toRelatedItemSummaries(doc.posts, "post"),
    stories: toRelatedItemSummaries(doc.stories, "story"),
    mustSee: mapMustItems(doc.mustSee),
    mustDo: mapMustItems(doc.mustDo),
    mustEat: mapMustItems(doc.mustEat),
    seo: typeof doc.seo === "object" ? doc.seo : undefined,
  };
}

export const getDestinations = cache(async (): Promise<Destination[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "destinations",
      depth: 1,
      limit: 100,
      sort: "order",
      where: { status: { equals: "published" } },
    });
    return result.docs.map(mapDestination);
  } catch (error) {
    console.warn("Error fetching destinations:", error);
    return [];
  }
});

export const getDestination = cache(async (slug: string): Promise<Destination | null> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "destinations",
      depth: 2,
      limit: 1,
      where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] },
    });
    const doc = result.docs[0];
    return doc ? mapDestination(doc) : null;
  } catch (error) {
    console.warn("Error fetching destination:", error);
    return null;
  }
});

function mapFaq(doc: Doc): Faq {
  const relatedTo = doc.relatedTo;
  let relatedToType: FaqRelatedToType | undefined;
  let relatedToId: string | undefined;
  if (relatedTo && typeof relatedTo === "object" && "relationTo" in relatedTo) {
    relatedToType = relatedTo.relationTo as FaqRelatedToType;
    relatedToId = id(relatedTo.value);
  }
  return {
    id: id(doc.id),
    question: doc.question ?? "",
    answer: lexicalToText(doc.answer),
    category: typeof doc.category === "string" ? doc.category : undefined,
    order: typeof doc.order === "number" ? doc.order : undefined,
    relatedToType,
    relatedToId,
  };
}

/** General/site-wide FAQs (no `relatedTo` target set). */
export const getFaqs = cache(async (): Promise<Faq[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "faqs",
      depth: 0,
      limit: 200,
      sort: "order",
      where: { status: { equals: "published" } },
    });
    // Postgres adapter doesn't support `exists` on polymorphic relationship fields, so filter in JS instead.
    return result.docs.filter((doc) => !doc.relatedTo).map(mapFaq);
  } catch (error) {
    console.warn("Error fetching faqs:", error);
    return [];
  }
});

export const getFaqsFor = cache(async (relationTo: FaqRelatedToType, targetId: string): Promise<Faq[]> => {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "faqs",
      depth: 0,
      limit: 100,
      sort: "order",
      where: {
        and: [
          { status: { equals: "published" } },
          { "relatedTo.relationTo": { equals: relationTo } },
          { "relatedTo.value": { equals: targetId } },
        ],
      },
    });
    return result.docs.map(mapFaq);
  } catch (error) {
    console.warn("Error fetching faqs for relation:", error);
    return [];
  }
});
