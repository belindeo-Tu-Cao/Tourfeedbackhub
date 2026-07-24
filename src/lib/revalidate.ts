import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

// Keep in sync with TRANSLATIONS_TAG in src/i18n/db-messages.ts.
// Duplicated as a literal so the Payload config doesn't pull the
// db-messages module (and its Payload client) into every runtime.
const TRANSLATIONS_TAG = 'translations'

/**
 * Invalidate the Next.js Full Route Cache + the translations unstable_cache
 * so edits made in the Payload admin appear on the frontend immediately
 * instead of waiting for the next deploy.
 *
 * revalidatePath('/', 'layout') revalidates every route under the root
 * layout (all locale-prefixed pages read the same getPublicContent).
 */
function revalidateFrontend(): void {
  try {
    revalidateTag(TRANSLATIONS_TAG)
    revalidatePath('/', 'layout')
  } catch {
    // Thrown when invoked outside a Next.js request scope (e.g. seed
    // scripts run directly via node). Safe to ignore there.
  }
}

const afterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateFrontend()
  return doc
}

const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateFrontend()
  return doc
}

/**
 * Append content-revalidation hooks to a collection without clobbering any
 * hooks it already defines.
 */
export function withRevalidate(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), afterDelete],
    },
  }
}
