'use client'

import { useState } from 'react'
import { useAuth } from '@payloadcms/ui'

export const PurgeDatabaseButton = () => {
  const { user } = useAuth()
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const role = (user as { role?: string } | null)?.role

  if (role !== 'admin') {
    return null
  }

  const handlePurge = async () => {
    const confirmed = window.confirm(
      'This deletes ALL content data (tours, posts, feedback, reviews, media entries, etc). User accounts are kept. This cannot be undone. Continue?',
    )
    if (!confirmed) return

    const doubleConfirmed = window.confirm('Are you absolutely sure? Type OK to purge the database now.')
    if (!doubleConfirmed) return

    setStatus('working')
    setMessage('')

    try {
      const res = await fetch('/api/purge-database', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data?.error || 'Purge failed')
        return
      }

      setStatus('done')
      setMessage(`Deleted: ${Object.entries(data.deleted as Record<string, number>)
        .map(([slug, count]) => `${slug} (${count})`)
        .join(', ')}`)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Purge failed')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        margin: 0,
        padding: '1rem 1.5rem',
        border: '2px solid #d1453b',
        borderRadius: 8,
        backgroundColor: '#fef2f2',
        boxShadow: '0 4px 16px rgba(209, 69, 59, 0.5)',
        maxWidth: '90vw',
      }}
    >
      <strong style={{ color: '#d1453b', fontSize: '1.1rem' }}>Danger zone</strong>
      <p style={{ margin: '0.5rem 0', color: '#666' }}>
        Purge all content data from the database. Admin only.
      </p>
      <button
        type="button"
        onClick={handlePurge}
        disabled={status === 'working'}
        style={{
          background: '#d1453b',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          padding: '0.6rem 1.2rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: status === 'working' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'working' ? 'Purging…' : 'Purge database'}
      </button>
      {message && (
        <p style={{ marginTop: '0.5rem', wordBreak: 'break-word' }}>{message}</p>
      )}
    </div>
  )
}
