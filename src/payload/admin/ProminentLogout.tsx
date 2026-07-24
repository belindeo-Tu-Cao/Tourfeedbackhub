'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@payloadcms/ui'

export const ProminentLogout = () => {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#dc2626',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Logout
    </button>
  )
}
