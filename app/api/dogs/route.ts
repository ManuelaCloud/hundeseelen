export const dynamic = 'force-dynamic'
export const revalidate = 60

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('hunde')
    .select('id, name, fotos, rasse, alter, geschlecht, groesse, vertraeglichkeit, kastriert, kurzbeschreibung, beschreibung')
    .eq('status', 'verfuegbar')
    .order('erfasst_am', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    }
  })
}
