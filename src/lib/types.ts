export type RelatedItemType = 'post' | 'story' | 'tour' | 'guide' | 'tourType' | 'destination';

export interface RelatedItemSummary {
  id: string;
  type: RelatedItemType;
  title: string;
  href: string;
  slug?: string;
  imageUrl?: string;
  excerpt?: string;
}

export interface TourType {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  order?: number;
}

export interface Tour {
  id: string;
  code: string;
  name: string;
  summary: string;
  startDate: Date;
  endDate: Date;
  clientCount: number;
  clientNationalities: string[];
  clientNationalityIds?: string[];
  clientCountry: string;
  clientCity: string;
  provinces?: string[];
  provinceIds?: string[];
  itinerary: string;
  photoUrls: string[];
  videoUrls: string[];
  tourTypeIds?: string[];
  guideIds?: string[];
  guides?: RelatedItemSummary[];
  guideLanguages: string[];
  guideLanguageIds?: string[];
  status: 'finished' | 'for_sale';
  relatedPostIds?: string[];
  relatedPosts?: RelatedItemSummary[];
  relatedStoryIds?: string[];
  relatedStories?: RelatedItemSummary[];
  reviews?: Review[];
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverImageUrl: string;
  publishedAt: Date;
  readTimeMinutes?: number;
  tags?: string[];
  category?: string;
  relatedGuideIds?: string[];
  relatedGuides?: RelatedItemSummary[];
  relatedTourTypeIds?: string[];
  relatedTourTypes?: RelatedItemSummary[];
  relatedTourIds?: string[];
  relatedTours?: RelatedItemSummary[];
  relatedPostIds?: string[];
  relatedPosts?: RelatedItemSummary[];
}

export interface Review {
  id: string;
  authorDisplay: string;
  country: string;
  language: string;
  rating: number;
  message: string;
  tourId?: string;
  tourName?: string;
  photoUrls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  summary?: string;
  reviewType?: string;
}

export interface Feedback extends Review {
  submittedAt: Date;
  attachments?: Array<{
    fileName: string;
    storagePath: string;
    downloadUrl?: string;
  }>;
}

export interface FinishedTourComment {
  id: string;
  tourId: string;
  authorName: string;
  rating: number;
  message: string;
  createdAt: Date;
}

export interface GuideLanguage {
  id: string;
  name: string;
  code?: string;
}

export interface Province {
  id: string;
  name: string;
  country?: string;
}

export interface Nationality {
  id: string;
  name: string;
  code?: string;
}

export interface GuideLanguageProficiency {
  id: string;
  name: string;
  code?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

export interface Guide {
  id: string;
  name: string;
  photo?: string;
  phone?: string;
  email?: string;
  bio?: string;
  cardNumber?: string;
  cardType?: 'international' | 'domestic';
  cardIssuePlace?: string;
  cardIssueDate?: string;
  cardExpiryDate?: string;
  experienceYears?: number;
  languages?: GuideLanguageProficiency[];
  languageIds?: string[];
  provinces?: string[];
  provinceIds?: string[];
  nationalities?: string[];
  nationalityIds?: string[];
  tourTypeIds?: string[];
  tourTypes?: RelatedItemSummary[];
  relatedPosts?: RelatedItemSummary[];
  // Computed stats
  totalTours?: number;
  totalPax?: number;
  averageRating?: number;
  totalReviews?: number;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  whatsapp?: string;
  zalo?: string;
  address?: string;
  mapEmbedUrl?: string;
  location?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  zalo?: string;
}

export interface SiteSettings {
  siteName: string;
  logoUrlLight?: string;
  logoUrlDark?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroMediaUrl?: string;
  aboutTitle: string;
  aboutDescription: string;
  missionStatement?: string;
  values?: string[];
  contact: ContactInfo;
  social: SocialLinks;
  copyright?: string;
  languages: string[];
  defaultLanguage: string;
  primaryColor?: string;
  accentColor?: string;
}

export type SlideStatus = 'draft' | 'published';

export interface HeroSlide {
  id: string;
  locale: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  order: number;
  active: boolean;
  status: SlideStatus;
  overlayOpacity?: number | null;
  alt?: string | null;
  startAt?: Date | null;
  endAt?: Date | null;
  updatedBy?: string | null;
  updatedAt?: Date | null;
}

export interface PublicContent {
  siteSettings: SiteSettings;
  tourTypes: TourType[];
  tours: Tour[];
  stories: Story[];
  reviews: Review[];
  slides: HeroSlide[];
  posts: Post[];
  guides: Guide[];
}

export type NavigationMenuKey = 'header' | 'footer';

export type NavigationItemType = 'internal' | 'external' | 'hash';

export type NavigationAudience = 'guest' | 'user' | 'admin';

export interface NavigationBadge {
  text: string;
  color?: string;
}

export type NavigationArea = 'links' | 'legal' | 'social' | 'contact' | 'cta';

export interface NavigationMenuItem {
  id: string;
  label: string;
  href: string;
  type: NavigationItemType;
  order: number;
  parentId?: string | null;
  icon?: string;
  target?: '_self' | '_blank';
  visibleFor?: NavigationAudience[];
  badge?: NavigationBadge;
  area?: NavigationArea;
  group?: string;
  children?: NavigationMenuItem[];
}

export interface NavigationMenu {
  id: string;
  key: NavigationMenuKey;
  locale?: string | null;
  title?: string;
  published: boolean;
  updatedAt?: Date;
  items: NavigationMenuItem[];
  flatItems?: NavigationMenuItem[];
}

// CMS Core Types
export type PostStatus = 'draft' | 'published' | 'scheduled' | 'private' | 'trash';
export type PostType = 'post' | 'page';
export type MediaType = 'image' | 'video' | 'document' | 'audio' | 'other';
export type UserRole = 'admin' | 'editor' | 'author' | 'contributor' | 'subscriber';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  order?: number;
  count?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  createdAt: Date;
}

export interface MediaItem {
  id: string;
  fileName: string;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  mimeType: string;
  fileSize: number;
  mediaType: MediaType;
  url: string;
  storagePath: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export interface Post {
  id: string;
  type: PostType;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  featuredImageId?: string;
  featuredImage?: MediaItem;
  authorId: string;
  authorName?: string;
  categoryIds?: string[];
  categories?: Category[];
  tagIds?: string[];
  tags?: Tag[];
  publishedAt?: Date | null;
  scheduledFor?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount?: number;
  commentCount?: number;
  allowComments?: boolean;
  seo?: SEOMetadata;
  template?: string;
  order?: number;
  parentId?: string | null;
  locale?: string; // Language code: en, vi, etc.
  versions?: PostRevision[]; // Version history (keep last 3)
  relatedPostIds?: string[];
  relatedPosts?: RelatedItemSummary[];
  relatedStoryIds?: string[];
  relatedStories?: RelatedItemSummary[];
  relatedGuideIds?: string[];
  relatedGuides?: RelatedItemSummary[];
  relatedTourTypeIds?: string[];
  relatedTourTypes?: RelatedItemSummary[];
  relatedTourIds?: string[];
  relatedTours?: RelatedItemSummary[];
}

export interface PostRevision {
  id: string;
  postId: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  createdAt: Date;
  changeNote?: string;
}

export interface Comment {
  id: string;
  postId: string;
  postType: PostType;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  authorIp?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  parentId?: string | null;
  replies?: Comment[];
  userId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SEOMetadata {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  nofollow?: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  socialLinks?: SocialLinks;
  createdAt: Date;
  lastLoginAt?: Date;
  status: 'active' | 'inactive' | 'banned';
  permissions?: string[];
}

export interface ThemeSettings {
  primaryFont: string;
  secondaryFont: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  headerStyle: 'minimal' | 'classic' | 'modern';
  footerStyle: 'simple' | 'detailed';
  customCSS?: string;
  customJS?: string;
}

export interface WidgetArea {
  id: string;
  name: string;
  location: 'sidebar' | 'footer' | 'header' | 'custom';
  widgets: Widget[];
}

export interface Widget {
  id: string;
  type: 'text' | 'recent_posts' | 'categories' | 'tags' | 'search' | 'social' | 'custom';
  title?: string;
  content?: any;
  settings?: Record<string, any>;
  order: number;
}

export interface MustSeeDoEatItem {
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  summary?: string;
  description?: string;
  heroImageUrl?: string;
  order?: number;
  tours: RelatedItemSummary[];
  tourTypes: RelatedItemSummary[];
  guides: RelatedItemSummary[];
  posts: RelatedItemSummary[];
  stories: RelatedItemSummary[];
  mustSee: MustSeeDoEatItem[];
  mustDo: MustSeeDoEatItem[];
  mustEat: MustSeeDoEatItem[];
  seo?: SEOMetadata;
}

export type FaqRelatedToType = 'tours' | 'tour-types' | 'destinations' | 'guides';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  relatedToType?: FaqRelatedToType;
  relatedToId?: string;
}

export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  topPosts: Array<{postId: string; title: string; views: number}>;
  topPages: Array<{url: string; views: number}>;
  referrers: Array<{source: string; count: number}>;
  devices: {mobile: number; desktop: number; tablet: number};
  period: {start: Date; end: Date};
}
