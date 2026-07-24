import type { Endpoint } from 'payload'

export const debugUserRoleEndpoint: Endpoint = {
  path: '/debug/user-role',
  method: 'get',
  handler: async (req) => {
    const { user } = req

    if (!user) {
      return Response.json({ error: 'Not authenticated', user: null }, { status: 401 })
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
    })
  },
}
