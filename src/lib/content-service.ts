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
    title: doc.title ?? "Tour Type",
    description: doc.description ?? "",
    icon: doc.icon ?? undefined,
    order: typeof doc.order === "number" ? doc.order : undefined,
  };
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
    guideId: doc.guide ? id(doc.guide) : undefined,
    guideName: doc.guideName ?? (typeof doc.guide === "object" ? doc.guide?.name : "") ?? "",
    guideLanguages: relNames(doc.guideLanguages),
    guideLanguageIds: relIds(doc.guideLanguages),
    status: doc.status === "for_sale" ? "for_sale" : "finished",
  };
}

function mapStory(doc: Doc): Story {
  return {
    id: id(doc.id),
    title: doc.title ?? "Story",
    excerpt: doc.excerpt ?? "",
    coverImageUrl: mediaUrl(doc.coverImage),
    publishedAt: toDate(doc.publishedAt ?? doc.createdAt),
    readTimeMinutes: typeof doc.readTimeMinutes === "number" ? doc.readTimeMinutes : undefined,
    tags: Array.isArray(doc.tags) ? doc.tags.map((t: Doc) => t?.tag).filter(Boolean) : undefined,
    category: typeof doc.category === "string" ? doc.category : undefined,
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
    payload.find({ collection: "tours", limit: 100, depth: 2, where: { status: { equals: "finished" } } }),
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
          { guide: { equals: guideId } },
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
          { guide: { equals: guideId } },
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
          { guide: { equals: guideId } },
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
