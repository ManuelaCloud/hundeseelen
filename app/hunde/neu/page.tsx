'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@/lib/auth'
import Header from '@/components/Header'
import HundForm from '@/components/HundForm'

export default function NeuPage() {
  const router = useRouter()
  useEffect(() => {
    if (!isLoggedIn()) router.replace('/login')
  }, [router])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title="Neuen Hund erfassen" />
      <HundForm />
    </div>
  )
}
