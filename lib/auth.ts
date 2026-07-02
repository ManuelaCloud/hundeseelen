export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('hundeseelen_auth') === 'true'
}

export function login(password: string): boolean {
  // Password is checked client-side; the real protection is Supabase RLS
  const correct = process.env.NEXT_PUBLIC_APP_PASSWORD || 'tierschutz2026'
  if (password === correct) {
    sessionStorage.setItem('hundeseelen_auth', 'true')
    return true
  }
  return false
}

export function logout(): void {
  sessionStorage.removeItem('hundeseelen_auth')
}
