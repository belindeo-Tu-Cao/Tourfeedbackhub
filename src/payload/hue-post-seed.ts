import { getPayload } from 'payload'
import path from 'path'
import config from './payload.config'

const IMG_DIR =
  'C:/Users/tucao/Downloads/Tour images-20260720T095739Z-1-001/Tour images/Hue imperial city'

const ADMIN_EMAIL = 'iposntmk@gmail.com'

// key -> source file + media title/alt. Idempotent lookup is by title.
const imageDefs: { key: string; file: string; title: string; alt: string }[] = [
  { key: 'noonGate', file: 'noon gate.jpg', title: 'Noon Gate (Ngọ Môn)', alt: 'Ngọ Môn — the Noon Gate of the Hue Imperial City' },
  { key: 'kienTrung', file: 'Điện kiến trung.jpg', title: 'Kien Trung Palace (Điện Kiến Trung)', alt: 'Điện Kiến Trung palace facade' },
  { key: 'kienTrung2', file: 'điện kiến trung-2.jpg', title: 'Kien Trung Palace — detail', alt: 'Điện Kiến Trung palace, second view' },
  { key: 'thaiHoa', file: 'điện thái hòa.jpg', title: 'Thai Hoa Palace (Điện Thái Hòa)', alt: 'Điện Thái Hòa — the Palace of Supreme Harmony' },
  { key: 'thaiHoa2', file: 'Thai-hoa-palace.jpg', title: 'Thai Hoa Palace — interior', alt: 'Thai Hoa Palace throne hall' },
  { key: 'nhaNhac', file: 'nhã-nhạc-cung-đình.jpg', title: 'Royal Court Music (Nhã nhạc cung đình)', alt: 'Nhã nhạc cung đình — Hue royal court music performance' },
  { key: 'chuongDuc', file: 'cửa chương đức.jpg', title: 'Chuong Duc Gate (Cửa Chương Đức)', alt: 'Cửa Chương Đức gate' },
  { key: 'hienNhon', file: 'cửa hiển nhơn.jpg', title: 'Hien Nhon Gate (Cửa Hiển Nhơn)', alt: 'Cửa Hiển Nhơn gate' },
  { key: 'thaiBinhLau', file: 'Thái bình lâu.jpg', title: 'Thai Binh Lau (Thái Bình Lâu)', alt: 'Thái Bình Lâu royal reading pavilion' },
  { key: 'truongSanh', file: 'cung trường sanh.jpg', title: 'Truong Sanh Residence (Cung Trường Sanh)', alt: 'Cung Trường Sanh residence' },
  { key: 'truongLang', file: 'trường lang trong tử cấm thành.jpg', title: 'Long Corridor (Trường lang) in the Forbidden City', alt: 'Trường lang corridor inside the Purple Forbidden City' },
  { key: 'gallery', file: 'IMG-20260718-WA0007.jpg', title: 'Hue Imperial City — grounds', alt: 'Walkway and grounds of the Hue Imperial City' },
]

async function run() {
  const payload = await getPayload({ config })
  const log = (m: string) => payload.logger.info(`[hue-post] ${m}`)

  // --- 1. Author ---
  const adminRes = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
    limit: 1,
  })
  const authorId = adminRes.docs[0]?.id
  if (!authorId) throw new Error(`admin user ${ADMIN_EMAIL} not found — run npm run seed first`)

  // --- 2. Category + tag (idempotent) ---
  const ensure = async (collection: string, where: Record<string, unknown>, data: Record<string, unknown>) => {
    const r = await payload.find({ collection: collection as never, where: where as never, limit: 1, depth: 0 })
    if (r.docs.length) return r.docs[0] as { id: string | number }
    return (await payload.create({ collection: collection as never, data: data as never })) as { id: string | number }
  }
  const destCat = await ensure('categories', { slug: { equals: 'destinations' } }, {
    name: 'Destinations', slug: 'destinations', description: 'Guides to places worth visiting.', order: 2,
  })
  const cultureTag = await ensure('tags', { slug: { equals: 'culture' } }, { name: 'Culture', slug: 'culture' })
  const hueTag = await ensure('tags', { slug: { equals: 'hue' } }, { name: 'Hue', slug: 'hue' })

  // --- 3. Media uploads (idempotent by title) ---
  const media: Record<string, string | number> = {}
  for (const d of imageDefs) {
    const existing = await payload.find({
      collection: 'media',
      where: { title: { equals: d.title } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length) {
      media[d.key] = (existing.docs[0] as { id: string | number }).id
      log(`media exists: ${d.title}`)
    } else {
      const created = await payload.create({
        collection: 'media',
        data: { title: d.title, altText: d.alt, mediaType: 'image' } as never,
        filePath: path.join(IMG_DIR, d.file),
      })
      media[d.key] = (created as { id: string | number }).id
      log(`uploaded: ${d.file} -> "${d.title}"`)
    }
  }

  // --- 4. Lexical richText builders ---
  const text = (t: string) => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
  const heading = (t: string, tag: 'h2' | 'h3' = 'h2') => ({
    type: 'heading', tag, format: '', indent: 0, version: 1, direction: 'ltr', children: [text(t)],
  })
  const paragraph = (t: string) => ({
    type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [text(t)],
  })
  const image = (id: string | number) => ({
    type: 'upload', version: 3, relationTo: 'media', value: id, fields: null,
  })

  const section = (h: string, body: string, imgKey: string, extraKey?: string) => {
    const nodes: unknown[] = [heading(h), paragraph(body), image(media[imgKey])]
    if (extraKey && media[extraKey]) nodes.push(image(media[extraKey]))
    return nodes
  }

  const content = {
    root: {
      type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
      children: [
        paragraph(
          'Wrapped in moats and thick citadel walls on the north bank of the Perfume River, the Hue Imperial City (Kinh thành Huế) was the seat of the Nguyen dynasty from 1802 to 1945. This UNESCO World Heritage site strings together grand gates, ceremonial palaces, quiet pavilions, and the living tradition of royal court music. Here is a walk through its highlights.',
        ),
        ...section(
          'Ngọ Môn — The Noon Gate',
          'The Noon Gate is the majestic main entrance to the Imperial City, reserved in the past for the emperor. Its five passages are crowned by the Ngũ Phụng (Five Phoenix) pavilion, where the king appeared for great ceremonies.',
          'noonGate',
        ),
        ...section(
          'Điện Thái Hòa — Palace of Supreme Harmony',
          'The most important palace of the citadel, Điện Thái Hòa housed the royal throne and hosted coronations, birthdays, and state audiences. Rows of lacquered ironwood columns and a gilded throne set the stage for the dynasty’s grandest rituals.',
          'thaiHoa',
          'thaiHoa2',
        ),
        ...section(
          'Điện Kiến Trung — Kien Trung Palace',
          'A striking blend of Vietnamese and European design, Kien Trung Palace was the residence of the last two emperors, Khải Định and Bảo Đại. Recently restored, its ornate facade and colorful mosaics are once again open to visitors.',
          'kienTrung',
          'kienTrung2',
        ),
        ...section(
          'Nhã nhạc cung đình — Royal Court Music',
          'Recognized by UNESCO as an Intangible Cultural Heritage, Nhã nhạc is the refined ceremonial music of the Nguyen court. Costumed musicians and dancers still perform inside the citadel, offering a living echo of imperial ritual.',
          'nhaNhac',
        ),
        ...section(
          'Thái Bình Lâu — The Reading Pavilion',
          'Built for Emperor Khải Định, Thái Bình Lâu was a peaceful retreat where the king read and relaxed. Its delicate ceramic mosaics and garden setting make it one of the most graceful corners of the Forbidden City.',
          'thaiBinhLau',
        ),
        ...section(
          'Cung Trường Sanh — Truong Sanh Residence',
          'Set in the northwest of the citadel, Cung Trường Sanh served as a garden residence for the queen mothers. Landscaped grounds, rockeries, and pavilions gave the royal elders a tranquil place to retire.',
          'truongSanh',
        ),
        ...section(
          'Cửa Hiển Nhơn — Hien Nhon Gate',
          'The eastern gate of the Imperial City, Cửa Hiển Nhơn is famed for its intricate porcelain and glass mosaic decoration. Historically it was the entrance reserved for male officials.',
          'hienNhon',
        ),
        ...section(
          'Cửa Chương Đức — Chuong Duc Gate',
          'Mirroring Hien Nhon on the western side, Cửa Chương Đức was the gate for the queen, princesses, and court women. Its colorful ornamentation makes it a favorite photo stop.',
          'chuongDuc',
        ),
        heading('The Trường Lang and Forbidden City'),
        paragraph(
          'Long covered corridors (trường lang) once linked the palaces of the Tử Cấm Thành, the innermost Purple Forbidden City reserved for the emperor and his family. Walking them today ties the whole complex together.',
        ),
        image(media.truongLang),
        image(media.gallery),
      ],
    },
  }

  // --- 5. Create / update post ---
  const slug = 'hue-imperial-city-guide'
  const postData = {
    type: 'post',
    title: 'A Walk Through the Hue Imperial City',
    slug,
    excerpt:
      'Gates, palaces, and royal court music: a guide to the highlights of the Nguyen dynasty’s citadel in Hue.',
    content,
    status: 'published',
    author: authorId,
    categories: [destCat.id],
    tags: [cultureTag.id, hueTag.id],
    featuredImage: media.noonGate,
    publishedAt: new Date('2026-07-20').toISOString(),
    locale: 'en',
  }

  const existingPost = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (existingPost.docs.length) {
    await payload.update({ collection: 'posts', id: (existingPost.docs[0] as { id: string | number }).id, data: postData as never })
    log(`updated post "${postData.title}"`)
  } else {
    await payload.create({ collection: 'posts', data: postData as never })
    log(`created post "${postData.title}"`)
  }

  log('✅ done')
  process.exit(0)
}

run().catch((err) => {
  console.error('[hue-post] failed:', err)
  process.exit(1)
})
