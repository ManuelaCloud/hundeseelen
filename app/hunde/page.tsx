'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@/lib/auth'
import { supabase, type Hund } from '@/lib/supabase'
import Header from '@/components/Header'
import Image from 'next/image'

const STATUS_LABEL: Record<string, string> = {
  verfuegbar: 'Verfügbar',
  reserviert: 'Reserviert',
  vermittelt: 'Vermittelt',
}
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  verfuegbar: { bg: '#d4edda', text: '#1a6b2a' },
  reserviert: { bg: '#fff3cd', text: '#7a5800' },
  vermittelt: { bg: '#e2e3e5', text: '#4a4a4a' },
}

export default function HundeListe() {
  const router = useRouter()
  const [hunde, setHunde] = useState<Hund[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return }
    loadHunde()
  }, [router])

  async function loadHunde() {
    setLoading(true)
    const { data } = await supabase
      .from('hunde')
      .select('*')
      .order('erfasst_am', { ascending: false })
    setHunde(data || [])
    setLoading(false)
  }

  async function handleDelete(hund: Hund) {
    if (!confirm(`${hund.name} wirklich löschen?`)) return
    setDeleting(hund.id)
    if (hund.foto) {
      const path = hund.foto.split('/storage/v1/object/public/fotos/')[1]
      if (path) await supabase.storage.from('fotos').remove([path])
    }
    await supabase.from('hunde').delete().eq('id', hund.id)
    setDeleting(null)
    loadHunde()
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title="Unsere Hunde" />

      <div style={{ padding: '1rem' }}>
        {/* Neuen Hund Button */}
        <button
          onClick={() => router.push('/hunde/neu')}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '0.875rem',
            border: 'none',
            background: 'var(--gruen-button)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>+</span> Neuen Hund erfassen
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-grau)' }}>
            Wird geladen…
          </div>
        )}

        {/* Leer */}
        {!loading && hunde.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem 1.5rem',
            background: 'white', borderRadius: '1rem',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🐾</div>
            <p style={{ color: 'var(--text-grau)', fontSize: '0.95rem' }}>
              Noch keine Hunde erfasst.<br />Tippe auf „Neuen Hund erfassen"!
            </p>
          </div>
        )}

        {/* Hundekarten */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {hunde.map(hund => (
            <div key={hund.id} style={{
              background: 'white',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(61,107,79,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {/* Foto */}
                <div style={{
                  width: '90px', flexShrink: 0,
                  background: 'var(--gruen-hell)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {hund.foto ? (
                    <Image
                      src={hund.foto}
                      alt={hund.name}
                      width={90}
                      height={100}
                      style={{ objectFit: 'cover', width: '90px', height: '100%' }}
                    />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>🐶</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dunkel)' }}>
                      {hund.name}
                    </h3>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: STATUS_COLOR[hund.status]?.bg,
                      color: STATUS_COLOR[hund.status]?.text,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {STATUS_LABEL[hund.status]}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-grau)', marginTop: '0.2rem' }}>
                    {hund.rasse} · {hund.alter} · {hund.geschlecht}
                  </p>
                  <p style={{
                    fontSize: '0.8rem', color: 'var(--text-grau)',
                    marginTop: '0.4rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {hund.kurzbeschreibung}
                  </p>
                </div>
              </div>

              {/* Aktionen */}
              <div style={{
                display: 'flex',
                borderTop: '1px solid var(--border)',
              }}>
                <button
                  onClick={() => router.push(`/hunde/${hund.id}`)}
                  style={{
                    flex: 1, padding: '0.75rem',
                    border: 'none', background: 'none',
                    color: 'var(--gruen-dunkel)',
                    fontSize: '0.875rem', fontWeight: 600,
                    borderRight: '1px solid var(--border)',
                  }}
                >
                  ✏️ Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(hund)}
                  disabled={deleting === hund.id}
                  style={{
                    flex: 1, padding: '0.75rem',
                    border: 'none', background: 'none',
                    color: deleting === hund.id ? '#aaa' : '#c0392b',
                    fontSize: '0.875rem', fontWeight: 600,
                  }}
                >
                  {deleting === hund.id ? '…' : '🗑️ Löschen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
