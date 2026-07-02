'use client'
import Header from '@/components/Header'
import HundForm from '@/components/HundForm'

export default function NeuPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title="Neuen Hund erfassen" />
      <HundForm />
    </div>
  )
}
