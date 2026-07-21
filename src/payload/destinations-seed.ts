import { getPayload } from 'payload'
import config from './payload.config'

type Id = string | number

const richText = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [{
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      textFormat: 0,
      children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
    }],
  },
})

async function seedDestinations() {
  const payload = await getPayload({ config })
  const log = (message: string) => payload.logger.info(`[destinations-seed] ${message}`)

  async function upsert(collection: string, where: Record<string, unknown>, data: Record<string, unknown>) {
    const result = await payload.find({ collection: collection as never, where: where as never, limit: 1, depth: 0 })
    const existing = result.docs[0] as { id: Id } | undefined
    if (existing) {
      return payload.update({ collection: collection as never, id: existing.id, data: data as never }) as Promise<{ id: Id }>
    }
    return payload.create({ collection: collection as never, data: data as never }) as Promise<{ id: Id }>
  }

  const provinces: Record<string, Id> = {}
  for (const province of [
    { name: 'Quang Tri', country: 'Vietnam' },
    { name: 'Thua Thien Hue', country: 'Vietnam' },
    { name: 'Da Nang', country: 'Vietnam' },
    { name: 'Quang Nam', country: 'Vietnam' },
  ]) {
    provinces[province.name] = (await upsert('provinces', { name: { equals: province.name } }, province)).id
  }

  const languages: Record<string, Id> = {}
  for (const language of [{ name: 'English', code: 'en' }, { name: 'Vietnamese', code: 'vi' }]) {
    languages[language.code] = (await upsert('languages', { code: { equals: language.code } }, language)).id
  }

  const tourTypes: Record<string, Id> = {}
  for (const tourType of [
    { title: 'Cultural', slug: 'cultural', description: 'Heritage sites, local traditions, and living culture.', icon: 'landmark', order: 1 },
    { title: 'Nature', slug: 'nature', description: 'Scenic landscapes, outdoor activities, and national parks.', icon: 'trees', order: 4 },
    { title: 'Food & Culinary', slug: 'food-culinary', description: 'Local dishes, markets, and hands-on food experiences.', icon: 'utensils', order: 3 },
  ]) {
    tourTypes[tourType.slug] = (await upsert('tour-types', { slug: { equals: tourType.slug } }, tourType)).id
  }

  const guides: Record<string, Id> = {}
  for (const guide of [
    { name: 'Quang Tri Heritage Team', bio: 'English-speaking local guides for the DMZ and Quang Tri heritage sites.', provinces: [provinces['Quang Tri']], languages: [languages.en, languages.vi], tourTypes: [tourTypes.cultural, tourTypes.nature] },
    { name: 'Hue Heritage Team', bio: 'Licensed local guides for Hue imperial heritage and the Perfume River.', provinces: [provinces['Thua Thien Hue']], languages: [languages.en, languages.vi], tourTypes: [tourTypes.cultural, tourTypes['food-culinary']] },
    { name: 'Da Nang Local Team', bio: 'Local guides for Da Nang city, coast, and nearby mountain landscapes.', provinces: [provinces['Da Nang']], languages: [languages.en, languages.vi], tourTypes: [tourTypes.cultural, tourTypes.nature] },
    { name: 'Hoi An Local Team', bio: 'Local guides for Hoi An Ancient Town, food, and riverside traditions.', provinces: [provinces['Quang Nam']], languages: [languages.en, languages.vi], tourTypes: [tourTypes.cultural, tourTypes['food-culinary']] },
  ]) {
    guides[guide.name] = (await upsert('guides', { name: { equals: guide.name } }, guide)).id
  }

  const category = await upsert('categories', { slug: { equals: 'destinations' } }, {
    name: 'Destinations', slug: 'destinations', description: 'Guides to places worth visiting.', order: 2,
  })

  const posts: Record<string, Id> = {}
  const postDefs = [
    { key: 'quang-tri', name: 'Quang Tri', slug: 'quang-tri-dmz-travel-guide', title: 'Quang Tri DMZ: A Thoughtful Travel Guide', excerpt: 'Plan a respectful journey through Quang Tri’s historic landmarks, resilient communities, and mountain scenery.', description: 'Quang Tri invites travelers to understand Vietnam’s history through places such as the Hien Luong Bridge, Vinh Moc Tunnels, Khe Sanh, and the Ancient Citadel. Allow time for reflection, local food, and the quiet landscapes around the Ben Hai River.', guide: 'Quang Tri Heritage Team', types: [tourTypes.cultural, tourTypes.nature] },
    { key: 'hue', name: 'Hue', slug: 'hue-imperial-city-travel-guide', title: 'Hue: Imperial Heritage, River Life, and Royal Cuisine', excerpt: 'A practical introduction to Hue’s citadel, tombs, Perfume River, and memorable local dishes.', description: 'Hue rewards slow travel. Explore the Imperial City in the morning, cross the Perfume River by boat, visit a royal tomb, and make room for the city’s delicate central Vietnamese cuisine.', guide: 'Hue Heritage Team', types: [tourTypes.cultural, tourTypes['food-culinary']] },
    { key: 'da-nang', name: 'Da Nang', slug: 'da-nang-city-coast-travel-guide', title: 'Da Nang: City Energy Between Mountains and Sea', excerpt: 'Discover a relaxed coastal city with beach time, mountain viewpoints, markets, and easy access to central Vietnam.', description: 'Da Nang balances a long sandy coastline with urban comforts and dramatic viewpoints. Start at My Khe Beach, visit the Marble Mountains, and watch sunset from Son Tra Peninsula.', guide: 'Da Nang Local Team', types: [tourTypes.cultural, tourTypes.nature] },
    { key: 'hoi-an', name: 'Hoi An', slug: 'hoi-an-ancient-town-food-guide', title: 'Hoi An: Lanterns, Heritage, and Local Flavors', excerpt: 'Make the most of Hoi An’s walkable old town, riverside evenings, tailor shops, and iconic dishes.', description: 'Hoi An is at its best on foot. Wander the historic lanes early, browse the market, enjoy cao lau or white rose dumplings, and return at dusk when lanterns brighten the Thu Bon River.', guide: 'Hoi An Local Team', types: [tourTypes.cultural, tourTypes['food-culinary']] },
  ]
  for (const post of postDefs) {
    posts[post.key] = (await upsert('posts', { slug: { equals: post.slug } }, {
      type: 'post', title: post.title, slug: post.slug, excerpt: post.excerpt, content: richText(post.description),
      status: 'published', categories: [category.id], locale: 'en', publishedAt: new Date('2026-07-21').toISOString(),
      relatedGuides: [guides[post.guide]], relatedTourTypes: post.types,
    })).id
  }

  const tours: Record<string, Id> = {}
  const tourDefs = [
    { key: 'quang-tri', code: 'QTR-001', name: 'Quang Tri DMZ & Heritage Day', summary: 'A full-day journey through Quang Tri’s most significant historic sites and peaceful river landscapes.', itinerary: 'Hien Luong Bridge → Vinh Moc Tunnels → Quang Tri Ancient Citadel.', province: 'Quang Tri', guide: 'Quang Tri Heritage Team', types: [tourTypes.cultural, tourTypes.nature] },
    { key: 'hue', code: 'HUE-001', name: 'Hue Imperial City & Royal Cuisine', summary: 'Discover the Nguyen dynasty’s citadel and the flavors that define Hue.', itinerary: 'Imperial City → Thien Mu Pagoda → Royal-style lunch → Perfume River.', province: 'Thua Thien Hue', guide: 'Hue Heritage Team', types: [tourTypes.cultural, tourTypes['food-culinary']] },
    { key: 'da-nang', code: 'DAN-001', name: 'Da Nang Coast & Marble Mountains', summary: 'A relaxed day combining Da Nang’s coastline, local neighborhoods, and Marble Mountains.', itinerary: 'My Khe Beach → Marble Mountains → Han Market → Son Tra Peninsula.', province: 'Da Nang', guide: 'Da Nang Local Team', types: [tourTypes.cultural, tourTypes.nature] },
    { key: 'hoi-an', code: 'HOI-001', name: 'Hoi An Ancient Town & Food Walk', summary: 'An evening of heritage lanes, market flavors, and lantern-lit riverside views.', itinerary: 'Hoi An Market → Ancient Town → Local tasting stops → Thu Bon River.', province: 'Quang Nam', guide: 'Hoi An Local Team', types: [tourTypes.cultural, tourTypes['food-culinary']] },
  ]
  for (const tour of tourDefs) {
    tours[tour.key] = (await upsert('tours', { code: { equals: tour.code } }, {
      code: tour.code, name: tour.name, summary: tour.summary, itinerary: tour.itinerary,
      status: 'for_sale', showFeedbackForm: true, clientCount: 0, provinces: [provinces[tour.province]],
      guides: [guides[tour.guide]], tourTypes: tour.types, guideLanguages: [languages.en, languages.vi], relatedPosts: [posts[tour.key]],
    })).id
  }

  const destinationDefs = [
    { name: 'Quang Tri', slug: 'quang-tri', province: 'Quang Tri', key: 'quang-tri', order: 1, summary: 'A powerful destination of DMZ history, resilient communities, and mountain-to-coast scenery.', description: 'Quang Tri is a place for thoughtful travel, pairing important historic sites with calm rivers, coastal villages, and the forested Truong Son range.', types: [tourTypes.cultural, tourTypes.nature], guide: 'Quang Tri Heritage Team', mustSee: [['Hien Luong Bridge and Ben Hai River', 'A lasting symbol of reunification at the former 17th parallel.'], ['Vinh Moc Tunnels', 'An underground village that tells a moving story of civilian resilience.']], mustDo: [['Take a guided DMZ visit', 'Learn the context behind each historic landmark with a local guide.'], ['Explore the western highlands', 'Follow Highway 9 toward Khe Sanh and mountain communities.']], mustEat: [['Banh bot loc', 'Transparent tapioca dumplings filled with shrimp and pork.']] },
    { name: 'Hue', slug: 'hue', province: 'Thua Thien Hue', key: 'hue', order: 2, summary: 'Vietnam’s imperial capital, where palaces, tombs, river life, and royal cuisine meet.', description: 'Hue offers a rich view of Nguyen dynasty heritage alongside a gentler rhythm of riverside gardens, pagodas, and exceptional central Vietnamese food.', types: [tourTypes.cultural, tourTypes['food-culinary']], guide: 'Hue Heritage Team', mustSee: [['Hue Imperial City', 'The walled heart of the Nguyen dynasty’s former capital.'], ['Royal Tombs', 'Elaborate hillside mausoleums with distinct architecture and gardens.']], mustDo: [['Cruise the Perfume River', 'See the city from the water, especially near sunset.'], ['Try a royal-inspired meal', 'Taste the refined dishes that make Hue a culinary destination.']], mustEat: [['Bun bo Hue', 'A deeply aromatic beef noodle soup with lemongrass and chili.']] },
    { name: 'Da Nang', slug: 'da-nang', province: 'Da Nang', key: 'da-nang', order: 3, summary: 'A friendly coastal city with beaches, mountains, markets, and easy central Vietnam connections.', description: 'Da Nang is a comfortable base for travelers who want beach time, city conveniences, and scenic day trips without giving up local character.', types: [tourTypes.cultural, tourTypes.nature], guide: 'Da Nang Local Team', mustSee: [['My Khe Beach', 'A long, lively beach close to the city center.'], ['Marble Mountains', 'Caves, pagodas, and viewpoints carved into limestone hills.']], mustDo: [['Visit Son Tra Peninsula', 'Look for sweeping sea views and the Linh Ung Pagoda.'], ['Browse Han Market', 'Find local snacks, coffee, and everyday Da Nang life.']], mustEat: [['Mi Quang', 'Turmeric noodles with herbs, peanuts, and a small amount of rich broth.']] },
    { name: 'Hoi An', slug: 'hoi-an', province: 'Quang Nam', key: 'hoi-an', order: 4, summary: 'A lantern-lit UNESCO trading port with living traditions, tailor shops, and memorable food.', description: 'Hoi An’s compact historic center is made for unhurried walks. Its merchant houses, temples, markets, and riverside evenings reveal layers of international trading history.', types: [tourTypes.cultural, tourTypes['food-culinary']], guide: 'Hoi An Local Team', mustSee: [['Japanese Covered Bridge', 'An enduring symbol of Hoi An’s multicultural trading past.'], ['Hoi An Ancient Town', 'Preserved streets, merchant homes, temples, and lanterns.']], mustDo: [['Walk the old town at dusk', 'The streets become especially atmospheric when lanterns are lit.'], ['Join a local food walk', 'Discover the market and dishes shaped by central Vietnamese traditions.']], mustEat: [['Cao lau', 'Hoi An’s signature noodle dish with herbs, pork, and crisp crackers.']] },
  ]

  for (const destination of destinationDefs) {
    const toItems = (items: string[][]) => items.map(([title, description]) => ({ title, description }))
    await upsert('destinations', { slug: { equals: destination.slug } }, {
      name: destination.name, slug: destination.slug, summary: destination.summary, description: richText(destination.description),
      province: provinces[destination.province], order: destination.order, status: 'published', tours: [tours[destination.key]],
      tourTypes: destination.types, guides: [guides[destination.guide]], posts: [posts[destination.key]], stories: [],
      mustSee: toItems(destination.mustSee), mustDo: toItems(destination.mustDo), mustEat: toItems(destination.mustEat),
      seo: { title: `${destination.name} Travel Guide | Tour Insights Hub`, description: destination.summary },
    })
  }

  log('seeded Quang Tri, Hue, Da Nang, and Hoi An with related provinces, guides, tour types, tours, and posts')
  process.exit(0)
}

seedDestinations().catch((error) => {
  console.error('[destinations-seed] failed:', error)
  process.exit(1)
})
