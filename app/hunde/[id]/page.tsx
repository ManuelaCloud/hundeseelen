'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { isLoggedIn } from '@/lib/auth'
import { supabase, type Hund } from '@/lib/supabase'
import Header from '@/components/Header'
import HundForm from '@/components/HundForm'

export default function BearbeitenPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [hund, setHund] = useState<Hund | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return }
    supabase.from('hunde').select('*').eq('id', id).single().then(({ data }) => {
      setHund(data)
      setLoading(false)
    })
  }, [id, router])

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title="Hund bearbeiten" />
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-grau)' }}>
        Wird geladen…
      </div>
    </div>
  )

  if (!hund) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title="Hund bearbeiten" />
      <div style={{ textAlign: 'center', padding: '3rem', color: '#c0392b' }}>
        Hund nicht gefunden.
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title={`${hund.name} bearbeiten`} />
      <HundForm initial={hund} id={id} />
    </div>
  )
}
