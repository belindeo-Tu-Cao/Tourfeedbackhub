import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

import { Users } from './collections/Users'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Comments } from './collections/Comments'
import { Media } from './collections/Media'
import { Guides, Tours, TourComments } from './collections/Tours'
import { Feedback, Reviews } from './collections/Feedback'
import { Languages, Nationalities, Provinces, TourTypes } from './collections/MasterData'
import { Stories, Slides, NavigationMenus, Mail, SiteSettings, ThemeSettings } from './collections/SiteConfig'
import { Destinations } from './collections/Destinations'
import { FAQs } from './collections/FAQs'
import { purgeDatabaseEndpoint } from './endpoints/purgeDatabase'
import { debugUserRoleEndpoint } from './endpoints/debugUserRole'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      actions: [
        './admin/PurgeDatabaseButton#PurgeDatabaseButton',
        './admin/ProminentLogout#ProminentLogout',
      ],
    },
  },
  endpoints: [purgeDatabaseEndpoint, debugUserRoleEndpoint],
  collections: [
    Users,
    Posts,
    Categories,
    Tags,
    Comments,
    Media,
    Tours,
    TourComments,
    Feedback,
    Reviews,
    Guides,
    Languages,
    Nationalities,
    Provinces,
    TourTypes,
    Stories,
    Destinations,
    FAQs,
    Slides,
    NavigationMenus,
    SiteSettings,
    ThemeSettings,
    Mail,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-THIS',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: process.env.R2_ENDPOINT || '',
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})
