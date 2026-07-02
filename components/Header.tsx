'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

export default function Header({ title }: { title: string }) {
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <header style={{
      background: 'var(--gruen-dunkel)',
      color: 'white',
      padding: '0.875rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <Image
        src="/logo.webp"
        alt="Logo"
        width={36}
        height={36}
        style={{ borderRadius: '50%', background: 'white', padding: '2px', flexShrink: 0 }}
      />
      <span style={{ flex: 1, fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
        {title}
      </span>
      <button
        onClick={handleLogout}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          borderRadius: '0.5rem',
          padding: '0.4rem 0.75rem',
          fontSize: '0.8rem',
          fontWeight: 500,
        }}
      >
        Abmelden
      </button>
    </header>
  )
}
