import { getPayload } from 'payload'
import config from './payload.config'

const ADMIN_EMAIL = 'iposntmk@gmail.com'

async function run() {
  const payload = await getPayload({ config })
  const log = (m: string) => payload.logger.info(`[quangtri-dmz-post] ${m}`)

  const ensure = async (collection: string, where: Record<string, unknown>, data: Record<string, unknown>) => {
    const r = await payload.find({ collection: collection as never, where: where as never, limit: 1, depth: 0 })
    if (r.docs.length) return r.docs[0] as { id: string | number }
    return (await payload.create({ collection: collection as never, data: data as never })) as { id: string | number }
  }

  const authorRes = await payload.find({ collection: 'users', where: { email: { equals: ADMIN_EMAIL } }, limit: 1 })
  const authorId = authorRes.docs[0]?.id

  const destCat = await ensure('categories', { slug: { equals: 'destinations' } }, {
    name: 'Destinations', slug: 'destinations', description: 'Guides to places worth visiting.', order: 2,
  })
  const vietnamTag = await ensure('tags', { slug: { equals: 'vietnam' } }, { name: 'Vietnam', slug: 'vietnam' })
  const quangTriTag = await ensure('tags', { slug: { equals: 'quang-tri' } }, { name: 'Quang Tri', slug: 'quang-tri' })
  const historyTag = await ensure('tags', { slug: { equals: 'history' } }, { name: 'History', slug: 'history' })
  const warHistoryTag = await ensure('tags', { slug: { equals: 'war-history' } }, { name: 'War History', slug: 'war-history' })

  const text = (t: string) => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
  const heading = (t: string, tag: 'h2' | 'h3' = 'h2') => ({
    type: 'heading', tag, format: '', indent: 0, version: 1, direction: 'ltr', children: [text(t)],
  })
  const paragraph = (t: string) => ({
    type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [text(t)],
  })
  const listItem = (t: string) => ({
    type: 'listitem', value: 1, format: '', indent: 0, version: 1, children: [text(t)],
  })
  const bulletList = (items: string[]) => ({
    type: 'list', listType: 'bullet', start: 1, tag: 'ul', format: '', indent: 0, version: 1,
    children: items.map((t) => listItem(t)),
  })

  const content = {
    root: {
      type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
      children: [
        paragraph(
          'If you are a history buff or a nature lover looking for a journey that resonates with stories of resilience, then Quang Tri province is a must-visit destination. Known as the "Land of Fire," this region holds the most significant relics of the Vietnam War, all connected by a complex web of strategic locations and heroic history.',
        ),
        paragraph('Here is your ultimate guide to exploring the iconic landmarks of Quang Tri.'),
        heading('1. The Division Line: Hien Luong Bridge and Ben Hai River'),
        paragraph(
          'Our journey begins at the 17th Parallel. Following the 1954 Geneva Accords, the Ben Hai River became the temporary demarcation line dividing Vietnam into North and South.',
        ),
        paragraph(
          'The Hien Luong Bridge, originally built by the French in 1950, stands as a poignant symbol of the country’s desire for reunification. Walking across this 178-meter steel bridge, you can feel the weight of history in every wooden plank. Nearby, the Reunification Monument stands tall, reminding every visitor of the long road to peace.',
        ),
        heading('2. Life Underground: Vinh Moc Tunnels'),
        paragraph(
          'Just north of the demarcation line, you’ll find the Vinh Moc Tunnels. During the war, this village was a prime target for American bombing because it was suspected of being a supply point for Con Co Island.',
        ),
        paragraph(
          'With nowhere else to go, the villagers moved their entire lives underground, carving out a massive network of tunnels that served as their homes, clinics, and meeting rooms. Exploring these cool, damp passages today is a humbling experience that highlights the incredible human spirit.',
        ),
        heading('3. The High Lookout: The Rockpile (Elliot Combat Base)'),
        paragraph(
          'As we head west along Highway 9, the landscape changes into dramatic karst mountains. Rising steeply from the valley is The Rockpile.',
        ),
        paragraph(
          'Standing 240 meters high, this solitary outcrop was a vital US Marine observation post from 1966 to 1969. Because it was so steep and rugged, it could only be reached by helicopter. Today, while you can’t climb to the top, you can stop along Highway 9 to take stunning photos of this "toothpick-shaped" mountain jutting into the sky.',
        ),
        heading('4. The Western Anchor: Khe Sanh Combat Base'),
        paragraph(
          'Continuing west towards the Lao border, we reach Khe Sanh. This base was instrumental for the US military as a staging point to attack movements along the Ho Chi Minh Trail.',
        ),
        paragraph(
          'It became the site of one of the most famous sieges in military history in 1968, which drew worldwide media attention. Today, the base houses a museum where you can see captured tanks and aircraft, offering a deep dive into the strategic maneuvers of both sides.',
        ),
        heading('5. The Gateway of the Trail: Dakrong Bridge'),
        paragraph(
          'Nestled in the majestic Truong Son mountains at km50 of Highway 9 is the Dakrong Bridge. This spot is the starting point of Highway 14A, a key branch of the legendary Ho Chi Minh Trail.',
        ),
        paragraph(
          'Initially, it was a simple iron bridge built by the North Vietnamese army to facilitate supplies to the Southern front. After being bombed and rebuilt many times, it was eventually replaced by a beautiful cable-stayed bridge between 2000 and 2003—the first of its kind designed and built by Vietnamese engineers. It’s a perfect "check-in" spot where you can admire the winding river and meet the resilient Van Kieu and Pa Co ethnic minorities.',
        ),
        heading('6. The Immortal Citadel: Quang Tri Ancient Citadel'),
        paragraph(
          'No trip to Quang Tri is complete without visiting the Ancient Citadel. Originally built during the Nguyen Dynasty, it later became the site of the legendary 81-day battle in 1972.',
        ),
        paragraph(
          'The fighting was so intense that the walls today are still riddled with bullet holes. It has become a sacred place of pilgrimage, where millions of Vietnamese come to honor the young soldiers—many of them students—who sacrificed their lives here. As the sun sets over the Thach Han River, the atmosphere becomes deeply peaceful, serving as a silent tribute to the past.',
        ),
        heading('Traveler’s Tips'),
        bulletList([
          'Best Way to Visit: Most travelers book a DMZ Tour from Hue or Da Nang for a seamless experience.',
          'Nearby Stops: Don’t forget to visit the Truong Son National Cemetery and the Mine Action Visitor Center in Dong Ha to learn about the ongoing legacy of the war.',
          'Cultural Experience: Take some time to visit local villages like Xa Lang or Klu near Dakrong to learn about the unique cultures of the mountain people.',
        ]),
        paragraph(
          'Quang Tri is more than just a destination; it is a journey through time that teaches us about the cost of war and the value of peace. Ready to explore?',
        ),
      ],
    },
  }

  const tuCaoRes = await payload.find({ collection: 'guides', where: { name: { equals: 'Tu Cao' } }, limit: 1, depth: 0 })
  const culturalRes = await payload.find({ collection: 'tour-types', where: { title: { equals: 'Cultural' } }, limit: 1, depth: 0 })
  const relatedGuides = tuCaoRes.docs[0] ? [(tuCaoRes.docs[0] as { id: string | number }).id] : []
  const relatedTourTypes = culturalRes.docs[0] ? [(culturalRes.docs[0] as { id: string | number }).id] : []

  const slug = 'exploring-quang-tri-land-of-fire'
  const postData = {
    type: 'post',
    title: 'Exploring the Legend of Quang Tri: A Journey Through Vietnam’s "Land of Fire"',
    slug,
    excerpt:
      'A DMZ guide to Quang Tri’s iconic wartime landmarks — from the Hien Luong Bridge and Vinh Moc Tunnels to Khe Sanh Combat Base, Dakrong Bridge, and the Ancient Citadel.',
    content,
    status: 'published',
    author: authorId,
    categories: [destCat.id],
    tags: [vietnamTag.id, quangTriTag.id, historyTag.id, warHistoryTag.id],
    publishedAt: new Date().toISOString(),
    locale: 'en',
    relatedGuides,
    relatedTourTypes,
  }

  const existing = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (existing.docs.length) {
    await payload.update({ collection: 'posts', id: (existing.docs[0] as { id: string | number }).id, data: postData as never })
    log(`updated post "${postData.title}"`)
  } else {
    await payload.create({ collection: 'posts', data: postData as never })
    log(`created post "${postData.title}"`)
  }

  log('done')
  process.exit(0)
}

run().catch((err) => {
  console.error('[quangtri-dmz-post] failed:', err)
  process.exit(1)
})
