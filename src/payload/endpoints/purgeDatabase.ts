import type { Endpoint } from 'payload'

export const purgeDatabaseEndpoint: Endpoint = {
  path: '/purge-database',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin role required' }, { status: 403 })
    }

    const deleted: Record<string, number> = {}

    for (const collection of payload.config.collections) {
      if (collection.slug === 'users') continue

      const { docs, errors } = await payload.delete({
        collection: collection.slug,
        where: {},
        overrideAccess: true,
      })

      deleted[collection.slug] = docs.length

      if (errors.length > 0) {
        payload.logger.error({ collection: collection.slug, errors }, 'purge-database: some docs failed to delete')
      }
    }

    payload.logger.warn({ user: user.id, deleted }, 'purge-database: database purged by admin')

    return Response.json({ success: true, deleted })
  },
}
