'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import Image from 'next/image'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError(false)
    await new Promise(r => setTimeout(r, 300))
    if (login(password)) {
      router.replace('/hunde')
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'linear-gradient(160deg, #e6f2ea 0%, #f4faf5 60%)',
    }}>
      {/* Logo + Vereinsname */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Image
          src="/logo.webp"
          alt="Tierschutzverein Verlorene Hundeseelen Südpfalz e.V."
          width={110}
          height={110}
          style={{ marginBottom: '1rem' }}
          priority
        />
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--gruen-dunkel)',
          lineHeight: 1.3,
        }}>
          Verlorene Hundeseelen
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-grau)', marginTop: '0.25rem' }}>
          Südpfalz e.V. · Hundevermittlung
        </p>
      </div>

      {/* Login Card */}
      <div style={{
        background: 'var(--weiss)',
        borderRadius: '1.25rem',
        padding: '2rem 1.5rem',
        width: '100%',
        maxWidth: '360px',
        boxShadow: '0 4px 24px rgba(61,107,79,0.10)',
        border: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--text-dunkel)',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          Anmelden
        </h2>

        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-grau)',
          marginBottom: '0.5rem',
        }}>
          Passwort
        </label>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Passwort eingeben"
          autoComplete="current-password"
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            borderRadius: '0.75rem',
            border: error ? '2px solid #d04040' : '1.5px solid var(--border)',
            fontSize: '1rem',
            color: 'var(--text-dunkel)',
            background: error ? '#fff5f5' : 'var(--bg)',
            outline: 'none',
            marginBottom: '0.5rem',
            transition: 'border-color 0.15s',
          }}
        />
        {error && (
          <p style={{ fontSize: '0.875rem', color: '#d04040', marginBottom: '1rem' }}>
            Falsches Passwort – bitte nochmal versuchen.
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !password}
          style={{
            width: '100%',
            padding: '1rem',
            marginTop: '1rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: loading || !password ? '#a8c4ae' : 'var(--gruen-button)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Wird angemeldet…' : 'Anmelden'}
        </button>
      </div>

      <p style={{
        marginTop: '2rem',
        fontSize: '0.75rem',
        color: 'var(--text-grau)',
        textAlign: 'center',
      }}>
        Nur für autorisierte Vereinsmitglieder
      </p>
    </div>
  )
}
