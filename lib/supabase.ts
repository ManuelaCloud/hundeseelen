import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Hund = {
  id: string
  name: string
  foto: string | null
  rasse: string
  alter: string
  geschlecht: 'Männlich' | 'Weiblich'
  status: 'verfuegbar' | 'reserviert' | 'vermittelt'
  kurzbeschreibung: string
  beschreibung: string
  groesse: 'klein' | 'mittel' | 'gross'
  vertraeglichkeit: string
  kastriert: boolean
  erfasst_am: string
}
