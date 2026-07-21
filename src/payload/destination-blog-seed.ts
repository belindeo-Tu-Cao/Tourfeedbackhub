import { getPayload } from 'payload'
import config from './payload.config'

type Id = string | number

const textNode = (text: string) => ({
  type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1,
})

const paragraph = (text: string) => ({
  type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0,
  children: [textNode(text)],
})

const heading = (text: string) => ({
  type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr',
  children: [textNode(text)],
})

const richText = (sections: Array<{ heading: string; body: string }>) => ({
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
    children: sections.flatMap((section) => [heading(section.heading), paragraph(section.body)]),
  },
})

async function seedDestinationBlogs() {
  const payload = await getPayload({ config })
  const log = (message: string) => payload.logger.info(`[destination-blog-seed] ${message}`)

  async function ensure(collection: string, where: Record<string, unknown>, data: Record<string, unknown>) {
    const result = await payload.find({ collection: collection as never, where: where as never, limit: 1, depth: 0 })
    const existing = result.docs[0] as { id: Id } | undefined
    if (existing) return existing
    return payload.create({ collection: collection as never, data: data as never }) as Promise<{ id: Id }>
  }

  async function upsertPost(slug: string, data: Record<string, unknown>) {
    const result = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    const existing = result.docs[0] as { id: Id } | undefined
    if (existing) {
      return payload.update({ collection: 'posts', id: existing.id, data: data as never }) as Promise<{ id: Id }>
    }
    return payload.create({ collection: 'posts', data: data as never }) as Promise<{ id: Id }>
  }

  const destinationCategory = await ensure('categories', { slug: { equals: 'destinations' } }, {
    name: 'Destinations', slug: 'destinations', description: 'Guides to places worth visiting.', order: 2,
  })

  const tags: Record<string, Id> = {}
  for (const tag of [
    { name: 'Vietnam', slug: 'vietnam' }, { name: 'Culture', slug: 'culture' },
    { name: 'Food', slug: 'food' }, { name: 'Hue', slug: 'hue' },
    { name: 'Da Nang', slug: 'da-nang' }, { name: 'Hoi An', slug: 'hoi-an' },
    { name: 'Phong Nha-Ke Bang', slug: 'phong-nha-ke-bang' }, { name: 'Caves', slug: 'caves' },
    { name: 'Adventure', slug: 'adventure' },
  ]) {
    tags[tag.slug] = (await ensure('tags', { slug: { equals: tag.slug } }, tag)).id
  }

  const cultural = await ensure('tour-types', { slug: { equals: 'cultural' } }, {
    title: 'Cultural', slug: 'cultural', description: 'Heritage sites, local traditions, and living culture.', icon: 'landmark', order: 1,
  })
  const nature = await ensure('tour-types', { slug: { equals: 'nature' } }, {
    title: 'Nature', slug: 'nature', description: 'Scenic landscapes, outdoor activities, and national parks.', icon: 'trees', order: 4,
  })
  const adventure = await ensure('tour-types', { slug: { equals: 'adventure' } }, {
    title: 'Adventure', slug: 'adventure', description: 'Trekking, caves, and off-the-beaten-path routes.', icon: 'mountain', order: 2,
  })
  const food = await ensure('tour-types', { slug: { equals: 'food-culinary' } }, {
    title: 'Food & Culinary', slug: 'food-culinary', description: 'Local dishes, markets, and hands-on food experiences.', icon: 'utensils', order: 3,
  })

  const posts = [
    {
      destinationSlug: 'hue', slug: 'how-to-spend-two-days-in-hue', title: 'How to Spend Two Meaningful Days in Hue',
      excerpt: 'A slow, practical itinerary for Hue’s imperial heritage, riverside calm, royal cuisine, and lesser-known corners.',
      tags: [tags.vietnam, tags.hue, tags.culture, tags.food], types: [cultural.id, food.id],
      content: richText([
        { heading: 'Start with the Imperial City', body: 'Give the Hue Imperial City a full morning rather than treating it as a quick photo stop. Enter early, move through the ceremonial gates and palaces at an unhurried pace, and leave time for the quieter corners of the Purple Forbidden City.' },
        { heading: 'Follow the Perfume River', body: 'In the afternoon, head toward the Perfume River. Thien Mu Pagoda is an easy landmark to combine with a short boat ride or a relaxed riverside walk. The river is especially beautiful in the softer light before sunset.' },
        { heading: 'Make room for Hue cuisine', body: 'Hue is one of Vietnam’s most distinctive food cities. Try bun bo Hue for breakfast, then explore small plates such as banh beo, banh nam, and banh bot loc. Royal-inspired meals can be a memorable dinner experience, but local family-run restaurants are equally rewarding.' },
        { heading: 'Choose one royal tomb for day two', body: 'Each Nguyen dynasty tomb has a different atmosphere. Minh Mang feels formal and balanced, Tu Duc is poetic and garden-like, and Khai Dinh is dramatic in its blend of Vietnamese and European details. Pick one or two and allow time to wander.' },
        { heading: 'Travel thoughtfully', body: 'Hue is best experienced slowly. Dress respectfully at religious sites, carry water during the warmer months, and consider a local guide when visiting the imperial complex or royal tombs for context that brings the architecture to life.' },
      ]),
    },
    {
      destinationSlug: 'da-nang', slug: 'da-nang-beyond-the-beach', title: 'Da Nang Beyond the Beach: Mountains, Markets, and Local Rhythm',
      excerpt: 'Use Da Nang as more than a beach stop: discover its mountains, local food, riverfront evenings, and easy day trips.',
      tags: [tags.vietnam, tags['da-nang'], tags.culture, tags.food], types: [cultural.id, nature.id],
      content: richText([
        { heading: 'Begin at the coast', body: 'My Khe Beach is a natural starting point, especially in the early morning when locals are swimming, exercising, and having coffee nearby. The long shoreline makes it easy to combine beach time with a relaxed city stay.' },
        { heading: 'Climb the Marble Mountains', body: 'The Marble Mountains bring together caves, pagodas, viewpoints, and stone-carving villages just south of central Da Nang. Wear shoes with grip and give yourself enough time for steps, uneven paths, and the atmospheric interior caves.' },
        { heading: 'See the peninsula at a gentler pace', body: 'Son Tra Peninsula offers a change of scene without a long journey. Follow the coastal road for wide sea views, stop at Linh Ung Pagoda, and keep an eye out for wildlife. A taxi or guided ride is a comfortable option if you do not ride a motorbike.' },
        { heading: 'Eat where the city eats', body: 'Try mi Quang, banh xeo, fresh seafood, and Vietnamese coffee. Han Market is useful for a glimpse of daily commerce, but some of the best meals are found in neighborhood restaurants a short walk away from the main tourist areas.' },
        { heading: 'Use Da Nang as a central base', body: 'Da Nang works well for travelers who want a modern, convenient base before continuing to Hoi An, Hue, or the Ba Na Hills. Keep one full day for the city itself instead of treating it only as a transit point.' },
      ]),
    },
    {
      destinationSlug: 'hoi-an', slug: 'hoi-an-food-and-lantern-evening-guide', title: 'A Food and Lantern Evening Guide to Hoi An',
      excerpt: 'Plan a well-paced Hoi An evening with market flavors, heritage lanes, lanterns, and a respectful approach to the old town.',
      tags: [tags.vietnam, tags['hoi-an'], tags.culture, tags.food], types: [cultural.id, food.id],
      content: richText([
        { heading: 'Arrive before the evening rush', body: 'Hoi An’s historic center is most enjoyable when you arrive before dusk. Use the late afternoon to explore merchant houses, assembly halls, small temples, and the lanes around the Japanese Covered Bridge before the streets become busier.' },
        { heading: 'Taste the town through its signature dishes', body: 'Start at the market or a trusted local eatery with cao lau, white rose dumplings, com ga, or a banh mi. Hoi An’s food reflects its trading-port history, so a guided tasting walk can add useful context as well as variety.' },
        { heading: 'Watch the town change at dusk', body: 'As lanterns come on, the riverside becomes the natural focus. Walk slowly, enjoy the view from the banks of the Thu Bon River, and step into quieter side lanes when the main streets are crowded.' },
        { heading: 'Shop with care', body: 'Hoi An is known for tailoring, leatherwork, and handicrafts. Ask clear questions about fabric, fit, timing, and alteration policies before ordering. For a short stay, simple garments are usually a safer choice than complicated designs.' },
        { heading: 'Help protect the old town', body: 'The lantern-lit atmosphere is part of what makes Hoi An special, but it is also a living community. Avoid blocking doorways for photos, use refillable water where possible, and support locally run businesses beyond the busiest streets.' },
      ]),
    },
    {
      slug: 'phong-nha-ke-bang-national-park-guide', title: 'Phong Nha-Ke Bang National Park: A First-Time Visitor’s Guide',
      excerpt: 'Plan a rewarding visit to Phong Nha-Ke Bang with cave choices, practical transport tips, and a respectful approach to this remarkable karst landscape.',
      tags: [tags.vietnam, tags['phong-nha-ke-bang'], tags.caves, tags.adventure], types: [nature.id, adventure.id],
      content: richText([
        { heading: 'Understand the landscape', body: 'Phong Nha-Ke Bang National Park in central Vietnam is a UNESCO-listed karst landscape of rivers, limestone mountains, forests, and some of the world’s most remarkable caves. Its scale is best appreciated by allowing more than a single rushed day.' },
        { heading: 'Choose caves that fit your time and comfort', body: 'Phong Nha Cave and Paradise Cave are accessible highlights for many visitors, while longer treks and expedition caves require booking with licensed operators. Read the activity description carefully, especially for walking distance, stairs, water crossings, and fitness requirements.' },
        { heading: 'Stay near Phong Nha town', body: 'Phong Nha town is a practical base for independent travelers. It has guesthouses, small restaurants, bicycle rentals, and transport connections to the park’s major attractions. A bicycle or arranged car makes it easier to explore the surrounding rural roads.' },
        { heading: 'Plan for weather and seasonality', body: 'Cave access and river conditions can change with rain, particularly during the wet season. Check current operating information with your accommodation or tour operator, wear shoes suitable for damp paths, and keep a light rain layer close at hand.' },
        { heading: 'Leave the landscape as you found it', body: 'Cave systems are delicate. Stay on marked paths, avoid touching formations, take all litter with you, and follow local guide instructions. These small choices help protect the park for both residents and future visitors.' },
      ]),
    },
    {
      slug: 'phong-nha-cave-underground-river-guide', title: 'Phong Nha Cave: What to Know Before Your Underground River Visit',
      excerpt: 'A practical guide to Phong Nha Cave’s boat journey, underground river, cave etiquette, and how to make the visit more meaningful.',
      tags: [tags.vietnam, tags['phong-nha-ke-bang'], tags.caves, tags.adventure], types: [nature.id, adventure.id],
      content: richText([
        { heading: 'A cave explored by boat', body: 'Phong Nha Cave is known for the Son River journey that leads into its entrance. The approach is part of the experience: limestone cliffs rise from the water before the boat glides from daylight into the cool, echoing interior.' },
        { heading: 'What the visit feels like', body: 'Inside, the cave reveals broad chambers, sculpted rock formations, and changing textures shaped by water over immense periods of time. The boat portion is gentle, while some routes may include a short walk on prepared pathways.' },
        { heading: 'How to prepare', body: 'Bring a light layer, protect cameras and phones from moisture, and choose footwear with a secure sole. If you are prone to motion discomfort, sit near the center of the boat and look ahead during the river journey.' },
        { heading: 'Go with curiosity, not haste', body: 'The most memorable visits allow space to listen and observe. Ask local guides about the cave’s geology, wartime history, and the way river levels affect access throughout the year.' },
        { heading: 'Respect the cave environment', body: 'Avoid flash photography where asked, do not touch stalactites or stalagmites, and remain within visitor areas. Cave formations grow extremely slowly, and even small disruptions can leave lasting damage.' },
      ]),
    },
    {
      slug: 'paradise-cave-thien-duong-cave-guide', title: 'Paradise Cave: Walking Through Thien Duong’s Limestone Cathedral',
      excerpt: 'Everything first-time visitors should know about Paradise Cave, from the boardwalk experience to timing, comfort, and cave conservation.',
      tags: [tags.vietnam, tags['phong-nha-ke-bang'], tags.caves, tags.adventure], types: [nature.id, adventure.id],
      content: richText([
        { heading: 'Why Paradise Cave stands out', body: 'Paradise Cave, also known as Thien Duong Cave, is celebrated for its immense dry chambers and dense limestone formations. The scale is immediately striking: a carefully built boardwalk carries visitors through a space that feels almost architectural.' },
        { heading: 'Expect stairs before the reward', body: 'Reaching the entrance involves a forest walk and a set of stairs, so comfortable shoes and water are worthwhile. The effort is manageable for many travelers, but take your time in hot or humid weather.' },
        { heading: 'Slow down on the boardwalk', body: 'Once inside, let your eyes adjust to the light and look beyond the largest formations. The cave’s patterns, textures, and changing ceiling heights are best enjoyed without rushing from one photo stop to the next.' },
        { heading: 'Time your visit well', body: 'Morning visits can be cooler and quieter. During busy periods, arriving early gives you more space on the walkways and a better chance to notice the cave’s natural soundscape.' },
        { heading: 'Keep a light footprint', body: 'Stay on the boardwalk, follow any photography guidance, and never climb on or touch formations. Paradise Cave is beautiful because its environment has been protected; careful visitors are part of that protection.' },
      ]),
    },
  ]

  for (const post of posts) {
    const postDoc = await upsertPost(post.slug, {
      type: 'post', title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
      status: 'published', categories: [destinationCategory.id], tags: post.tags, locale: 'en',
      publishedAt: new Date('2026-07-21').toISOString(), relatedTourTypes: post.types,
    })

    if (!post.destinationSlug) continue

    const destinationResult = await payload.find({
      collection: 'destinations', where: { slug: { equals: post.destinationSlug } }, limit: 1, depth: 0,
    })
    const destination = destinationResult.docs[0] as { id: Id; posts?: Array<Id | { id: Id }> } | undefined
    if (!destination) throw new Error(`Destination "${post.destinationSlug}" was not found. Run seed:destinations first.`)

    const relatedPostIds = (destination.posts ?? []).map((item) => typeof item === 'object' ? item.id : item)
    if (!relatedPostIds.some((id) => String(id) === String(postDoc.id))) relatedPostIds.push(postDoc.id)
    await payload.update({ collection: 'destinations', id: destination.id, data: { posts: relatedPostIds } as never })
  }

  log('seeded destination blogs, including Phong Nha-Ke Bang, Phong Nha Cave, and Paradise Cave; featured images intentionally left empty')
  process.exit(0)
}

seedDestinationBlogs().catch((error) => {
  console.error('[destination-blog-seed] failed:', error)
  process.exit(1)
})
