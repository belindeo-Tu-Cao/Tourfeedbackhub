import { getPayload } from 'payload'
import path from 'path'
import config from './payload.config'

const SEED_MEDIA_DIR = path.resolve(process.cwd(), 'media', 'seed')

const ADMIN_EMAIL = 'iposntmk@gmail.com'
const ADMIN_PASSWORD = 'iposntmk@gmail.com'

const EXTRA_ADMINS = [{ email: 'belindeo@gmail.com', password: 'belindeo@gmail.com' }]

async function seed() {
  const payload = await getPayload({ config })
  const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

  // Generic idempotent helper: find a doc by a where filter, create if missing.
  async function ensure<T extends Record<string, unknown>>(
    collection: string,
    where: Record<string, unknown>,
    data: T,
  ): Promise<{ id: string | number }> {
    const existing = await payload.find({
      collection: collection as never,
      where: where as never,
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      return existing.docs[0] as { id: string | number }
    }
    const created = await payload.create({
      collection: collection as never,
      data: data as never,
    })
    return created as { id: string | number }
  }

  // ---------------------------------------------------------------------------
  // 1. Admin user
  // ---------------------------------------------------------------------------
  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
    limit: 1,
  })
  if (existingAdmin.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: 'Site Admin',
        role: 'admin',
        status: 'active',
      },
    })
    log(`created admin user ${ADMIN_EMAIL}`)
  } else {
    log(`admin user ${ADMIN_EMAIL} already exists`)
  }
  const adminUser = (
    await payload.find({
      collection: 'users',
      where: { email: { equals: ADMIN_EMAIL } },
      limit: 1,
    })
  ).docs[0]

  for (const extraAdmin of EXTRA_ADMINS) {
    const existingExtraAdmin = await payload.find({
      collection: 'users',
      where: { email: { equals: extraAdmin.email } },
      limit: 1,
    })
    if (existingExtraAdmin.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: extraAdmin.email,
          password: extraAdmin.password,
          displayName: extraAdmin.email,
          role: 'admin',
          status: 'active',
        },
      })
      log(`created admin user ${extraAdmin.email}`)
    } else {
      log(`admin user ${extraAdmin.email} already exists`)
    }
  }

  // ---------------------------------------------------------------------------
  // 1.5 Media — upload seed images to R2 (via storage-s3 adapter)
  // ---------------------------------------------------------------------------
  async function ensureMedia(
    file: string,
    data: Record<string, unknown>,
  ): Promise<{ id: string | number }> {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: file } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) return existing.docs[0] as { id: string | number }
    const created = await payload.create({
      collection: 'media',
      data: data as never,
      filePath: path.join(SEED_MEDIA_DIR, file),
    })
    return created as { id: string | number }
  }

  const mediaDefs = [
    { file: 'hero-vietnam.jpg', key: 'hero', title: 'Scenic Vietnam landscape', altText: 'Scenic Vietnam landscape' },
    { file: 'hero-reviews.jpg', key: 'reviews', title: 'Happy travelers on a tour', altText: 'Happy travelers on a tour' },
    { file: 'hanoi-street-food.jpg', key: 'han', title: 'Hanoi street food', altText: 'Hanoi Old Quarter street food' },
    { file: 'hoi-an-lantern.jpg', key: 'hoian', title: 'Hoi An lanterns', altText: 'Hoi An lantern-lit riverside' },
    { file: 'ninh-binh-trang-an.jpg', key: 'ninhbinh', title: 'Trang An boats', altText: 'Ninh Binh Trang An limestone karsts' },
    { file: 'saigon-cu-chi.jpg', key: 'saigon', title: 'Saigon & Cu Chi', altText: 'Ho Chi Minh City and Cu Chi Tunnels' },
    { file: 'about-guides.jpg', key: 'about', title: 'Local guides', altText: 'Local Vietnamese tour guides' },
    { file: 'tu-guide.png', key: 'tuGuide', title: 'Tu Cao — tour guide', altText: 'Portrait of guide Tu Cao' },
  ]
  const media: Record<string, string | number> = {}
  for (const m of mediaDefs) {
    const doc = await ensureMedia(m.file, { title: m.title, altText: m.altText, mediaType: 'image' })
    media[m.key] = doc.id
  }
  log(`media ready (${mediaDefs.length}) — uploaded to R2 bucket`)

  // ---------------------------------------------------------------------------
  // 2. Master data: languages, nationalities, provinces, tour types
  // ---------------------------------------------------------------------------
  const languageDefs = [
    { name: 'English', code: 'en' },
    { name: 'Vietnamese', code: 'vi' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Spanish', code: 'es' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Korean', code: 'ko' },
  ]
  const languages: Record<string, string | number> = {}
  for (const l of languageDefs) {
    const doc = await ensure('languages', { code: { equals: l.code } }, l)
    languages[l.code] = doc.id
  }
  log(`languages ready (${languageDefs.length})`)

  const nationalityDefs = [
    { name: 'United States', code: 'US' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'France', code: 'FR' },
    { name: 'Germany', code: 'DE' },
    { name: 'Australia', code: 'AU' },
    { name: 'Japan', code: 'JP' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Canada', code: 'CA' },
  ]
  const nationalities: Record<string, string | number> = {}
  for (const n of nationalityDefs) {
    const doc = await ensure('nationalities', { code: { equals: n.code } }, n)
    nationalities[n.code] = doc.id
  }
  log(`nationalities ready (${nationalityDefs.length})`)

  const provinceDefs = [
    { name: 'Hanoi', country: 'Vietnam' },
    { name: 'Ho Chi Minh City', country: 'Vietnam' },
    { name: 'Da Nang', country: 'Vietnam' },
    { name: 'Quang Nam', country: 'Vietnam' },
    { name: 'Thua Thien Hue', country: 'Vietnam' },
    { name: 'Lao Cai', country: 'Vietnam' },
    { name: 'Quang Ninh', country: 'Vietnam' },
    { name: 'Ninh Binh', country: 'Vietnam' },
  ]
  const provinces: Record<string, string | number> = {}
  for (const p of provinceDefs) {
    const doc = await ensure('provinces', { name: { equals: p.name } }, p)
    provinces[p.name] = doc.id
  }
  log(`provinces ready (${provinceDefs.length})`)

  const tourTypeDefs = [
    { title: 'Cultural', slug: 'cultural', description: 'Temples, heritage sites, and local traditions.', icon: 'landmark', order: 1 },
    { title: 'Adventure', slug: 'adventure', description: 'Trekking, kayaking, and off-the-beaten-path routes.', icon: 'mountain', order: 2 },
    { title: 'Food & Culinary', slug: 'food-culinary', description: 'Street food tours and cooking classes.', icon: 'utensils', order: 3 },
    { title: 'Nature', slug: 'nature', description: 'National parks, caves, and scenic landscapes.', icon: 'trees', order: 4 },
    { title: 'City', slug: 'city', description: 'Guided walks through historic city centers.', icon: 'building', order: 5 },
    { title: 'Beach', slug: 'beach', description: 'Coastal escapes and island hopping.', icon: 'waves', order: 6 },
  ]
  const tourTypes: Record<string, string | number> = {}
  for (const t of tourTypeDefs) {
    const doc = await ensure('tour-types', { title: { equals: t.title } }, t)
    tourTypes[t.title] = doc.id
  }
  log(`tour types ready (${tourTypeDefs.length})`)

  // ---------------------------------------------------------------------------
  // 3. Guides
  // ---------------------------------------------------------------------------
  const guideDefs = [
    {
      name: 'Linh Nguyen',
      phone: '+84 90 123 4567',
      email: 'linh.guide@example.com',
      spokenLanguages: [
        { language: languages.en },
        { language: languages.vi },
        { language: languages.fr },
      ],
      provinces: [provinces['Hanoi'], provinces['Ninh Binh']],
      nationalities: [nationalities.US, nationalities.FR],
      tourTypes: [tourTypes['Food & Culinary'], tourTypes['Nature'], tourTypes['Adventure']],
    },
    {
      name: 'Minh Tran',
      phone: '+84 91 234 5678',
      email: 'minh.guide@example.com',
      spokenLanguages: [
        { language: languages.en },
        { language: languages.vi },
        { language: languages.ja },
      ],
      provinces: [provinces['Da Nang'], provinces['Quang Nam']],
      nationalities: [nationalities.JP, nationalities.AU],
      tourTypes: [tourTypes['Cultural'], tourTypes['City']],
    },
    {
      name: 'Hoa Pham',
      phone: '+84 92 345 6789',
      email: 'hoa.guide@example.com',
      spokenLanguages: [
        { language: languages.en },
        { language: languages.vi },
        { language: languages.de },
      ],
      provinces: [provinces['Ho Chi Minh City']],
      nationalities: [nationalities.DE, nationalities.GB],
      tourTypes: [tourTypes['Cultural'], tourTypes['City']],
    },
    {
      name: 'Tu Cao',
      photo: media.tuGuide,
      cardNumber: '146171152',
      cardType: 'international',
      cardIssuePlace: 'Thừa Thiên - Huế',
      cardExpiryDate: new Date('2028-05-31').toISOString(),
      experienceYears: 6,
      spokenLanguages: [{ language: languages.en }],
      provinces: [provinces['Thua Thien Hue']],
      tourTypes: [tourTypes['Cultural'], tourTypes['Nature']],
    },
  ]
  const guides: Record<string, string | number> = {}
  for (const g of guideDefs) {
    const doc = await ensure('guides', { name: { equals: g.name } }, g)
    guides[g.name] = doc.id
  }
  log(`guides ready (${guideDefs.length})`)

  // ---------------------------------------------------------------------------
  // 4. Tours
  // ---------------------------------------------------------------------------
  const tourDefs = [
    {
      code: 'HAN-001',
      name: 'Hanoi Old Quarter & Street Food Walk',
      summary: 'A half-day walking tour through the buzzing Old Quarter with tastings.',
      itinerary: 'Hoan Kiem Lake → 36 Streets → Egg coffee → Bun cha lunch.',
      startDate: '2026-05-10',
      endDate: '2026-05-10',
      clientCount: 4,
      clientCountry: 'United States',
      clientCity: 'Boston',
      guides: [guides['Linh Nguyen'], guides['Tu Cao']],
      status: 'finished',
      showFeedbackForm: true,
      provinces: [provinces['Hanoi']],
      tourTypes: [tourTypes['Food & Culinary'], tourTypes['City']],
      clientNationalities: [nationalities.US],
      guideLanguages: [languages.en],
    },
    {
      code: 'DAD-002',
      name: 'Hoi An Ancient Town & Lantern Evening',
      summary: 'Explore the UNESCO-listed Hoi An and enjoy the lantern-lit riverside.',
      itinerary: 'Japanese Bridge → Tailor street → Boat ride → Lantern release.',
      startDate: '2026-06-02',
      endDate: '2026-06-02',
      clientCount: 2,
      clientCountry: 'Japan',
      clientCity: 'Osaka',
      guides: [guides['Minh Tran']],
      status: 'finished',
      showFeedbackForm: true,
      provinces: [provinces['Quang Nam'], provinces['Da Nang']],
      tourTypes: [tourTypes['Cultural'], tourTypes['City']],
      clientNationalities: [nationalities.JP],
      guideLanguages: [languages.ja, languages.en],
    },
    {
      code: 'NBH-003',
      name: 'Ninh Binh Trang An Boat & Cave Adventure',
      summary: 'Full-day nature escape rowing through limestone karsts and caves.',
      itinerary: 'Trang An boats → Mua Cave viewpoint → Bich Dong Pagoda.',
      startDate: '2026-04-18',
      endDate: '2026-04-18',
      clientCount: 6,
      clientCountry: 'France',
      clientCity: 'Lyon',
      guides: [guides['Linh Nguyen']],
      status: 'finished',
      showFeedbackForm: true,
      provinces: [provinces['Ninh Binh']],
      tourTypes: [tourTypes['Nature'], tourTypes['Adventure']],
      clientNationalities: [nationalities.FR],
      guideLanguages: [languages.fr, languages.en],
    },
    {
      code: 'SGN-004',
      name: 'Saigon Highlights & Cu Chi Tunnels',
      summary: 'History-focused day tour of Ho Chi Minh City and the Cu Chi Tunnels.',
      itinerary: 'War Remnants Museum → Reunification Palace → Cu Chi Tunnels.',
      startDate: '2026-07-01',
      endDate: '2026-07-01',
      clientCount: 3,
      clientCountry: 'Germany',
      clientCity: 'Munich',
      guides: [guides['Hoa Pham']],
      status: 'for_sale',
      showFeedbackForm: true,
      provinces: [provinces['Ho Chi Minh City']],
      tourTypes: [tourTypes['Cultural'], tourTypes['City']],
      clientNationalities: [nationalities.DE],
      guideLanguages: [languages.de, languages.en],
    },
  ]
  const tours: Record<string, string | number> = {}
  for (const t of tourDefs) {
    const doc = await ensure('tours', { code: { equals: t.code } }, t)
    tours[t.code] = doc.id
  }
  log(`tours ready (${tourDefs.length})`)

  // ---------------------------------------------------------------------------
  // 5. Reviews (approved, public) + Feedback (mixed statuses)
  // ---------------------------------------------------------------------------
  const reviewDefs = [
    {
      authorDisplay: 'Sarah M.',
      country: 'United States',
      language: 'en',
      rating: 5,
      message: 'Linh was fantastic — the street food walk was the highlight of our trip!',
      tour: tours['HAN-001'],
      tourName: 'Hanoi Old Quarter & Street Food Walk',
      status: 'approved',
      summary: 'Five-star street food experience with a knowledgeable guide.',
      reviewType: 'tour',
      approvedAt: new Date('2026-05-12').toISOString(),
    },
    {
      authorDisplay: 'Kenji T.',
      country: 'Japan',
      language: 'ja',
      rating: 5,
      message: 'Hoi An at night was magical. Minh spoke great Japanese and English.',
      tour: tours['DAD-002'],
      tourName: 'Hoi An Ancient Town & Lantern Evening',
      status: 'approved',
      summary: 'Beautiful evening tour, bilingual guide praised.',
      reviewType: 'tour',
      approvedAt: new Date('2026-06-04').toISOString(),
    },
    {
      authorDisplay: 'Camille D.',
      country: 'France',
      language: 'fr',
      rating: 4,
      message: 'Trang An was breathtaking. A bit rainy but Linh made it memorable.',
      tour: tours['NBH-003'],
      tourName: 'Ninh Binh Trang An Boat & Cave Adventure',
      status: 'approved',
      summary: 'Scenic nature tour, great despite weather.',
      reviewType: 'tour',
      approvedAt: new Date('2026-04-20').toISOString(),
    },
  ]
  const reviews: Record<string, string | number> = {}
  for (const r of reviewDefs) {
    const doc = await ensure('reviews', { authorDisplay: { equals: r.authorDisplay } }, r)
    reviews[r.authorDisplay] = doc.id
  }
  log(`reviews ready (${reviewDefs.length})`)

  const feedbackDefs = [
    {
      name: 'Sarah M.',
      country: 'United States',
      language: 'en',
      rating: 5,
      message: 'Linh was fantastic — the street food walk was the highlight of our trip!',
      tour: tours['HAN-001'],
      tourRef: tours['HAN-001'],
      guide: guides['Linh Nguyen'],
      status: 'approved',
      visible: true,
      featured: true,
      reviewTitle: 'Best food tour in Hanoi',
      feedbackSummary: 'Five-star street food experience.',
      review: reviews['Sarah M.'],
      approvedAt: new Date('2026-05-12').toISOString(),
      submittedAt: new Date('2026-05-11').toISOString(),
      source: 'website',
    },
    {
      name: 'Kenji T.',
      country: 'Japan',
      language: 'ja',
      rating: 5,
      message: 'Hoi An at night was magical. Minh spoke great Japanese and English.',
      tour: tours['DAD-002'],
      tourRef: tours['DAD-002'],
      guide: guides['Minh Tran'],
      status: 'approved',
      visible: true,
      featured: false,
      reviewTitle: 'Magical lantern evening',
      review: reviews['Kenji T.'],
      approvedAt: new Date('2026-06-04').toISOString(),
      submittedAt: new Date('2026-06-03').toISOString(),
      source: 'website',
    },
    {
      name: 'Anonymous Traveler',
      country: 'Australia',
      language: 'en',
      rating: 4,
      message: 'Great day out at Cu Chi, would recommend booking early.',
      tour: tours['SGN-004'],
      tourRef: tours['SGN-004'],
      guide: guides['Hoa Pham'],
      status: 'pending',
      visible: false,
      featured: false,
      submittedAt: new Date('2026-07-15').toISOString(),
      source: 'website',
    },
  ]
  for (const f of feedbackDefs) {
    await ensure('feedback', { name: { equals: f.name }, tour: { equals: f.tour } }, f)
  }
  log(`feedback ready (${feedbackDefs.length})`)

  // Tour comments
  const tourCommentDefs = [
    { tour: tours['HAN-001'], authorName: 'David L.', rating: 5, message: 'Loved every bite. Thanks Linh!' },
    { tour: tours['DAD-002'], authorName: 'Yuki S.', rating: 5, message: 'Unforgettable lanterns.' },
  ]
  for (const c of tourCommentDefs) {
    await ensure('tour-comments', { authorName: { equals: c.authorName } }, c)
  }
  log(`tour comments ready (${tourCommentDefs.length})`)

  // ---------------------------------------------------------------------------
  // 6. Blog: categories, tags, posts
  // ---------------------------------------------------------------------------
  const categoryDefs = [
    { name: 'Travel Tips', slug: 'travel-tips', description: 'Practical advice for travelers.', order: 1 },
    { name: 'Destinations', slug: 'destinations', description: 'Guides to places worth visiting.', order: 2 },
    { name: 'Food', slug: 'food', description: 'Culinary stories and recommendations.', order: 3 },
  ]
  const categories: Record<string, string | number> = {}
  for (const c of categoryDefs) {
    const doc = await ensure('categories', { slug: { equals: c.slug } }, c)
    categories[c.slug] = doc.id
  }
  log(`categories ready (${categoryDefs.length})`)

  const tagDefs = [
    { name: 'Vietnam', slug: 'vietnam' },
    { name: 'Street Food', slug: 'street-food' },
    { name: 'Culture', slug: 'culture' },
    { name: 'Nature', slug: 'nature' },
    { name: 'Quang Tri', slug: 'quang-tri' },
    { name: 'History', slug: 'history' },
    { name: 'War History', slug: 'war-history' },
  ]
  const tags: Record<string, string | number> = {}
  for (const t of tagDefs) {
    const doc = await ensure('tags', { slug: { equals: t.slug } }, t)
    tags[t.slug] = doc.id
  }
  log(`tags ready (${tagDefs.length})`)

  const richText = (text: string) => ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
        },
      ],
    },
  })

  const postDefs = [
    {
      type: 'post',
      title: 'Top 10 Street Foods to Try in Hanoi',
      slug: 'top-10-street-foods-hanoi',
      excerpt: 'From pho to egg coffee, here are the must-try dishes in the capital.',
      content: richText('Hanoi is a paradise for food lovers. Start with a steaming bowl of pho...'),
      status: 'published',
      author: adminUser.id,
      categories: [categories['food'], categories['travel-tips']],
      tags: [tags['vietnam'], tags['street-food']],
      publishedAt: new Date('2026-05-20').toISOString(),
      relatedGuides: [guides['Linh Nguyen']],
      relatedTourTypes: [tourTypes['Food & Culinary']],
    },
    {
      type: 'post',
      title: 'A First-Timer’s Guide to Hoi An',
      slug: 'first-timers-guide-hoi-an',
      excerpt: 'Everything you need to know before visiting the ancient town.',
      content: richText('Hoi An blends history, tailors, and lantern-lit nights into one charming town...'),
      status: 'published',
      author: adminUser.id,
      categories: [categories['destinations']],
      tags: [tags['vietnam'], tags['culture']],
      publishedAt: new Date('2026-06-10').toISOString(),
      relatedGuides: [guides['Minh Tran']],
      relatedTourTypes: [tourTypes['Cultural']],
    },
    {
      type: 'page',
      title: 'About Us',
      slug: 'about',
      excerpt: 'Learn more about Tour Insights Hub.',
      content: richText('We connect travelers with trusted local guides across Vietnam.'),
      status: 'published',
      author: adminUser.id,
    },
    {
      type: 'post',
      title: 'Quang Tri Strategic War History Map - 14 Historic Landmarks',
      slug: 'quang-tri-strategic-war-history-map',
      excerpt: 'Explore 14 iconic historical sites of Quang Tri - the legendary "Land of Fire" - from Vinh Moc Tunnels to Quang Tri Citadel, Khe Sanh Combat Base, and the Highway of Horror.',
      content: richText('Quang Tri province, once the dividing line between North and South Vietnam, holds some of the most significant wartime history in Southeast Asia. From the Ben Hai River at the 17th Parallel to Route 9, from the underground Vinh Moc Tunnels to the ancient Quang Tri Citadel, every inch of this land tells a story of courage, sacrifice, and the relentless pursuit of peace. This guide explores 14 must-visit historical landmarks that bring Vietnam\'s wartime history to life.'),
      status: 'published',
      author: adminUser.id,
      categories: [categories['destinations']],
      tags: [tags['vietnam'], tags['quang-tri'], tags['history'], tags['war-history']],
      publishedAt: new Date('2026-07-21').toISOString(),
      relatedGuides: [guides['Tu Cao']],
      relatedTourTypes: [tourTypes['Cultural']],
    },
  ]
  const posts: Record<string, string | number> = {}
  for (const p of postDefs) {
    const doc = await ensure('posts', { slug: { equals: p.slug } }, p)
    posts[p.slug] = doc.id
  }
  log(`posts ready (${postDefs.length})`)

  // ---------------------------------------------------------------------------
  // 7. Stories
  // ---------------------------------------------------------------------------
  const storyDefs = [
    {
      title: 'How a Rainy Day Became the Best Tour Ever',
      slug: 'rainy-day-best-tour-ever',
      excerpt: 'A traveler shares how flexibility turned a soggy afternoon into magic.',
      content: richText('The forecast said rain all day, but our guide Linh had other plans. Instead of cancelling, we rerouted through Trang An\'s covered pagodas and finished with hot ginger tea overlooking the karsts...'),
      publishedAt: new Date('2026-04-25').toISOString(),
      readTimeMinutes: 4,
      category: 'Traveler Stories',
      tags: [{ tag: 'ninh-binh' }, { tag: 'nature' }],
      relatedGuides: [guides['Linh Nguyen']],
      relatedTourTypes: [tourTypes['Nature'], tourTypes['Adventure']],
    },
    {
      title: 'Meet Linh: Hanoi’s Street Food Whisperer',
      slug: 'meet-linh-hanoi-street-food-whisperer',
      excerpt: 'The story behind one of our most-loved local guides.',
      content: richText('Linh Nguyen has led food walks through Hanoi\'s Old Quarter for over five years, and can tell you the story behind every bowl of pho on the block...'),
      publishedAt: new Date('2026-05-30').toISOString(),
      readTimeMinutes: 6,
      category: 'Guide Spotlight',
      tags: [{ tag: 'hanoi' }, { tag: 'food' }],
      relatedGuides: [guides['Linh Nguyen']],
      relatedTourTypes: [tourTypes['Food & Culinary']],
    },
  ]
  const stories: Record<string, string | number> = {}
  for (const s of storyDefs) {
    const doc = await ensure('stories', { title: { equals: s.title } }, s)
    stories[s.title] = doc.id
  }
  log(`stories ready (${storyDefs.length})`)

  // ---------------------------------------------------------------------------
  // 8. Hero slides
  // ---------------------------------------------------------------------------
  const slideDefs = [
    {
      title: 'Discover Vietnam with Local Experts',
      subtitle: 'Authentic tours guided by people who call it home.',
      buttonText: 'Browse Tours',
      buttonLink: '/tours',
      order: 1,
      active: true,
      status: 'published',
      overlayOpacity: 40,
      alt: 'Scenic Vietnam landscape',
    },
    {
      title: 'Real Feedback from Real Travelers',
      subtitle: 'Read verified reviews before you book.',
      buttonText: 'Read Reviews',
      buttonLink: '/reviews',
      order: 2,
      active: true,
      status: 'published',
      overlayOpacity: 40,
      alt: 'Happy travelers on a tour',
    },
  ]
  for (const s of slideDefs) {
    await ensure('slides', { title: { equals: s.title } }, s)
  }
  log(`slides ready (${slideDefs.length})`)

  // ---------------------------------------------------------------------------
  // 9. Navigation menus (header + footer)
  // ---------------------------------------------------------------------------
  // Always update header nav to include Guides menu
  const headerNavItems = [
    { label: 'Home', href: '/', type: 'internal' as const, order: 1, target: '_self' as const, icon: 'Home' },
    { label: 'Tours', href: '/tours', type: 'internal' as const, order: 2, target: '_self' as const, icon: 'Compass' },
    { label: 'Destinations', href: '/destinations', type: 'internal' as const, order: 3, target: '_self' as const, icon: 'MapPin' },
    { label: 'Guides', href: '/guides', type: 'internal' as const, order: 4, target: '_self' as const, icon: 'Users' },
    { label: 'Reviews', href: '/reviews', type: 'internal' as const, order: 5, target: '_self' as const, icon: 'Star' },
    { label: 'Stories', href: '/stories', type: 'internal' as const, order: 6, target: '_self' as const, icon: 'BookOpen' },
    { label: 'Blog', href: '/blog', type: 'internal' as const, order: 7, target: '_self' as const, icon: 'Newspaper' },
    { label: 'FAQ', href: '/faq', type: 'internal' as const, order: 8, target: '_self' as const, icon: 'HelpCircle' },
    { label: 'Contact', href: '/contact', type: 'internal' as const, order: 9, target: '_self' as const, icon: 'Phone' },
  ]

  const existingHeaderNav = await payload.find({
    collection: 'navigation-menus',
    where: { key: { equals: 'header' } },
    limit: 1,
  })

  if (existingHeaderNav.docs.length > 0) {
    // Update existing
    await payload.update({
      collection: 'navigation-menus',
      id: existingHeaderNav.docs[0].id,
      data: {
        items: headerNavItems,
      },
    })
    log('header navigation updated with Guides menu')
  } else {
    // Create new
    await payload.create({
      collection: 'navigation-menus',
      data: {
        key: 'header',
        title: 'Main Navigation',
        published: true,
        items: headerNavItems,
      },
    })
    log('header navigation created with Guides menu')
  }
  await ensure(
    'navigation-menus',
    { key: { equals: 'footer' } },
    {
      key: 'footer',
      title: 'Footer Navigation',
      published: true,
      items: [
        { label: 'Privacy Policy', href: '/privacy', type: 'internal', order: 1, area: 'legal', target: '_self', icon: 'Shield' },
        { label: 'Terms of Service', href: '/terms', type: 'internal', order: 2, area: 'legal', target: '_self', icon: 'FileText' },
        { label: 'Give Feedback', href: '/feedback', type: 'internal', order: 3, area: 'links', target: '_self', icon: 'MessageSquare' },
      ],
    },
  )
  log('navigation menus ready (2)')

  // ---------------------------------------------------------------------------
  // 10. Site settings + theme settings (singletons)
  // ---------------------------------------------------------------------------
  await ensure(
    'site-settings',
    { siteName: { equals: 'Tour Insights Hub' } },
    {
      siteName: 'Tour Insights Hub',
      heroTitle: 'Discover Vietnam with Local Experts',
      heroSubtitle: 'Authentic, guide-led tours and honest traveler feedback.',
      heroCtaLabel: 'Browse Tours',
      aboutTitle: 'About Tour Insights Hub',
      aboutDescription: 'We connect travelers with trusted local guides across Vietnam and collect verified feedback to keep quality high.',
      missionStatement: 'Better tours through honest, transparent traveler feedback.',
      values: [{ value: 'Authenticity' }, { value: 'Transparency' }, { value: 'Local expertise' }],
      contact: { email: 'hello@tourinsightshub.example', phone: '+84 90 000 0000', address: 'Hanoi, Vietnam' },
      social: { facebook: '#', instagram: '#', youtube: '#' },
      copyright: '© 2026 Tour Insights Hub. All rights reserved.',
      primaryColor: '#77B5FE',
      accentColor: '#4682B4',
    },
  )
  await ensure(
    'theme-settings',
    { primaryColor: { equals: '#77B5FE' } },
    {
      primaryFont: 'PT Sans',
      secondaryFont: 'Playfair',
      primaryColor: '#77B5FE',
      secondaryColor: '#4682B4',
      accentColor: '#4682B4',
      backgroundColor: '#F0F8FF',
      textColor: '#1f2937',
      linkColor: '#4682B4',
      headerStyle: 'modern',
      footerStyle: 'detailed',
    },
  )
  log('site + theme settings ready')

  // ---------------------------------------------------------------------------
  // 11. Attach media to content (idempotent updates)
  // ---------------------------------------------------------------------------
  const findId = async (collection: string, where: Record<string, unknown>) => {
    const r = await payload.find({ collection: collection as never, where: where as never, limit: 1, depth: 0 })
    return r.docs[0] ? (r.docs[0] as { id: string | number }).id : null
  }

  const tourPhoto: Record<string, string | number> = {
    'HAN-001': media.han, 'DAD-002': media.hoian, 'NBH-003': media.ninhbinh, 'SGN-004': media.saigon,
  }
  for (const [code, mid] of Object.entries(tourPhoto)) {
    if (tours[code]) {
      await payload.update({ collection: 'tours', id: tours[code], data: { photos: [{ photo: mid }] } as never })
    }
  }

  const slideImage: Record<string, string | number> = {
    'Discover Vietnam with Local Experts': media.hero,
    'Real Feedback from Real Travelers': media.reviews,
  }
  for (const [title, mid] of Object.entries(slideImage)) {
    const id = await findId('slides', { title: { equals: title } })
    if (id) await payload.update({ collection: 'slides', id, data: { image: mid } as never })
  }

  const postImage: Record<string, string | number> = {
    'top-10-street-foods-hanoi': media.han,
    'first-timers-guide-hoi-an': media.hoian,
  }
  for (const [slug, mid] of Object.entries(postImage)) {
    const id = await findId('posts', { slug: { equals: slug } })
    if (id) await payload.update({ collection: 'posts', id, data: { featuredImage: mid } as never })
  }

  const storyImage: Record<string, string | number> = {
    'How a Rainy Day Became the Best Tour Ever': media.ninhbinh,
    'Meet Linh: Hanoi’s Street Food Whisperer': media.han,
  }
  for (const [title, mid] of Object.entries(storyImage)) {
    const id = await findId('stories', { title: { equals: title } })
    if (id) await payload.update({ collection: 'stories', id, data: { coverImage: mid } as never })
  }

  const ssId = await findId('site-settings', { siteName: { equals: 'Tour Insights Hub' } })
  if (ssId) {
    await payload.update({
      collection: 'site-settings',
      id: ssId,
      data: { heroMedia: media.hero, aboutImage: media.about } as never,
    })
  }
  log('media attached to tours, slides, posts, stories, settings')

  // ---------------------------------------------------------------------------
  // 12. Cross-content relations (tours ↔ posts/stories, post ↔ post)
  // ---------------------------------------------------------------------------
  await payload.update({
    collection: 'tours',
    id: tours['HAN-001'],
    data: {
      relatedPosts: [posts['top-10-street-foods-hanoi']],
      relatedStories: [stories['Meet Linh: Hanoi’s Street Food Whisperer']],
    } as never,
  })
  await payload.update({
    collection: 'tours',
    id: tours['DAD-002'],
    data: { relatedPosts: [posts['first-timers-guide-hoi-an']] } as never,
  })
  await payload.update({
    collection: 'tours',
    id: tours['NBH-003'],
    data: { relatedStories: [stories['How a Rainy Day Became the Best Tour Ever']] } as never,
  })
  await payload.update({
    collection: 'posts',
    id: posts['top-10-street-foods-hanoi'],
    data: {
      relatedPosts: [posts['first-timers-guide-hoi-an']],
      relatedStories: [stories['Meet Linh: Hanoi’s Street Food Whisperer']],
    } as never,
  })
  await payload.update({
    collection: 'posts',
    id: posts['first-timers-guide-hoi-an'],
    data: { relatedPosts: [posts['top-10-street-foods-hanoi']] } as never,
  })
  log('cross-content relations wired (tours ↔ posts/stories, post ↔ post)')

  // ---------------------------------------------------------------------------
  // 13. Destinations
  // ---------------------------------------------------------------------------
  const destinationDefs = [
    {
      name: 'Hanoi',
      slug: 'hanoi',
      summary: 'Vietnam\'s capital — a maze of Old Quarter streets, French colonial architecture, and legendary street food.',
      description: richText('Hanoi rewards travelers who wander: hidden temples, egg coffee shops, and centuries-old trade streets sit around every corner of the Old Quarter.'),
      province: provinces['Hanoi'],
      order: 1,
      status: 'published',
      tours: [tours['HAN-001']],
      tourTypes: [tourTypes['Food & Culinary'], tourTypes['City']],
      guides: [guides['Linh Nguyen']],
      posts: [posts['top-10-street-foods-hanoi']],
      stories: [stories['Meet Linh: Hanoi’s Street Food Whisperer']],
      mustSee: [
        { title: 'Hoan Kiem Lake', description: 'The historic heart of Hanoi, ringed by legend and morning tai chi.' },
        { title: 'Temple of Literature', description: 'Vietnam\'s first national university, dating to 1070.' },
      ],
      mustDo: [
        { title: 'Walk the 36 Streets', description: 'Each street once specialized in a single trade — silk, silver, tin.' },
      ],
      mustEat: [
        { title: 'Bun Cha', description: 'Grilled pork with rice noodles, made famous by Anthony Bourdain and Obama.' },
        { title: 'Egg Coffee', description: 'A whipped egg-yolk custard layered over strong Vietnamese coffee.' },
      ],
    },
    {
      name: 'Hoi An',
      slug: 'hoi-an',
      summary: 'A UNESCO-listed ancient trading port known for lantern-lit nights and custom tailoring.',
      description: richText('Hoi An\'s Ancient Town has preserved its 15th-19th century trading-port character, best experienced on foot after sunset when lanterns light the riverside.'),
      province: provinces['Quang Nam'],
      order: 2,
      status: 'published',
      tours: [tours['DAD-002']],
      tourTypes: [tourTypes['Cultural'], tourTypes['City']],
      guides: [guides['Minh Tran']],
      posts: [posts['first-timers-guide-hoi-an']],
      stories: [],
      mustSee: [
        { title: 'Japanese Covered Bridge', description: 'A 16th-century bridge linking the Japanese and Chinese quarters.' },
      ],
      mustDo: [
        { title: 'Get a custom outfit tailored', description: 'Same-day tailoring is a Hoi An specialty.' },
        { title: 'Release a lantern on the Thu Bon River', description: 'A nightly ritual best done at dusk.' },
      ],
      mustEat: [
        { title: 'Cao Lau', description: 'A noodle dish unique to Hoi An, made with water from a specific local well.' },
      ],
    },
    {
      name: 'Ninh Binh',
      slug: 'ninh-binh',
      summary: 'Limestone karsts, rice paddies, and boat rides through caves — often called "Halong Bay on land."',
      description: richText('Ninh Binh\'s Trang An and Tam Coc waterways wind between towering limestone peaks, best explored by traditional rowboat.'),
      province: provinces['Ninh Binh'],
      order: 3,
      status: 'published',
      tours: [tours['NBH-003']],
      tourTypes: [tourTypes['Nature'], tourTypes['Adventure']],
      guides: [guides['Linh Nguyen']],
      posts: [],
      stories: [stories['How a Rainy Day Became the Best Tour Ever']],
      mustSee: [
        { title: 'Trang An Landscape Complex', description: 'A UNESCO World Heritage site of karst peaks and grottoes.' },
      ],
      mustDo: [
        { title: 'Row a sampan through Trang An\'s caves', description: 'Local rowers navigate low cave passages by hand.' },
        { title: 'Climb Mua Cave viewpoint', description: 'Roughly 500 steps to a panoramic view of the rice paddies below.' },
      ],
      mustEat: [
        { title: 'Com Chay (goat rice)', description: 'Ninh Binh\'s signature dish, paired with sticky rice.' },
      ],
    },
  ]
  const destinations: Record<string, string | number> = {}
  for (const d of destinationDefs) {
    const doc = await ensure('destinations', { slug: { equals: d.slug } }, d)
    destinations[d.slug] = doc.id
  }
  log(`destinations ready (${destinationDefs.length})`)

  // ---------------------------------------------------------------------------
  // 14. FAQs
  // ---------------------------------------------------------------------------
  const faqDefs: Array<Record<string, unknown>> = [
    {
      question: 'How do I book a tour?',
      answer: richText('Browse the Tours page, pick a tour that fits your travel dates, and reach out via the feedback or contact form to request availability.'),
      category: 'Booking',
      order: 1,
      status: 'published',
    },
    {
      question: 'Are your tour guides licensed?',
      answer: richText('Yes — every guide profile on this site shows their official tour-guide license number, type, and issuing authority.'),
      category: 'Guides',
      order: 2,
      status: 'published',
    },
    {
      question: 'Can I leave feedback after my tour?',
      answer: richText('Yes, use the Feedback page to submit a review. Submissions are moderated before appearing publicly.'),
      category: 'Reviews',
      order: 3,
      status: 'published',
    },
    {
      question: 'What languages does Linh Nguyen speak?',
      answer: richText('Linh Nguyen guides in English, Vietnamese, and French.'),
      category: 'Guides',
      order: 4,
      status: 'published',
      relatedTo: { relationTo: 'guides', value: guides['Linh Nguyen'] },
    },
    {
      question: 'What is the best time of year to visit Ninh Binh?',
      answer: richText('October to December offers golden rice paddies and cooler weather, ideal for boat rides through Trang An.'),
      category: 'Destinations',
      order: 5,
      status: 'published',
      relatedTo: { relationTo: 'destinations', value: destinations['ninh-binh'] },
    },
  ]
  for (const f of faqDefs) {
    await ensure('faqs', { question: { equals: f.question } }, f)
  }
  log(`faqs ready (${faqDefs.length})`)

  log('✅ Seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
