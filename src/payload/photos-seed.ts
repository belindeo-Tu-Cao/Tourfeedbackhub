import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'
import config from './payload.config'

// Source folder of raw photos to push into the Media collection (→ R2 via storage-s3).
const PHOTOS_DIR = path.resolve(process.cwd(), 'photos')
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

// Turn a filename into a readable default title, e.g.
// "IMG-20260718-WA0000.jpg" -> "IMG 20260718 WA0000"
function titleFromFile(file: string): string {
  return path
    .basename(file, path.extname(file))
    .replace(/[-_]+/g, ' ')
    .trim()
}

async function seedPhotos() {
  const payload = await getPayload({ config })
  const log = (msg: string) => payload.logger.info(`[photos-seed] ${msg}`)

  if (!fs.existsSync(PHOTOS_DIR)) {
    throw new Error(`photos dir not found: ${PHOTOS_DIR}`)
  }

  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort()

  log(`found ${files.length} image(s) in ${PHOTOS_DIR}`)

  let created = 0
  let skipped = 0

  for (const file of files) {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: file } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      skipped++
      log(`skip (exists): ${file}`)
      continue
    }
    const title = titleFromFile(file)
    await payload.create({
      collection: 'media',
      data: { title, altText: title, mediaType: 'image' } as never,
      filePath: path.join(PHOTOS_DIR, file),
    })
    created++
    log(`uploaded: ${file}`)
  }

  log(`✅ done — ${created} uploaded, ${skipped} already present (${files.length} total)`)
  process.exit(0)
}

seedPhotos().catch((err) => {
  console.error('[photos-seed] failed:', err)
  process.exit(1)
})
