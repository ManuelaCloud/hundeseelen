'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Hund } from '@/lib/supabase'
import Image from 'next/image'

type FormData = Omit<Hund, 'id' | 'erfasst_am' | 'foto'> & { foto?: string | null }

const LEER: FormData = {
  name: '', rasse: '', alter: '', geschlecht: 'Weiblich',
  status: 'verfuegbar', kurzbeschreibung: '', beschreibung: '',
  groesse: 'mittel', vertraeglichkeit: '', kastriert: false, foto: null,
}

function Feld({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block', fontSize: '0.875rem',
        fontWeight: 600, color: 'var(--gruen-dunkel)',
        marginBottom: '0.4rem',
      }}>
        {label}{required && <span style={{ color: '#c0392b' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '0.875rem 1rem',
  borderRadius: '0.75rem', border: '1.5px solid var(--border)',
  fontSize: '1rem', color: 'var(--text-dunkel)',
  background: 'white', outline: 'none',
}

const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE, appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%235a8f6a\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  paddingRight: '2.5rem',
}

export default function HundForm({ initial, id }: { initial?: Partial<Hund>; id?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ ...LEER, ...initial })
  const [fotoPreview, setFotoPreview] = useState<string | null>(initial?.foto || null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const isEdit = !!id

  const set = (field: keyof FormData, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name || !form.rasse || !form.kurzbeschreibung) {
      setError('Bitte Name, Rasse und Kurzbeschreibung ausfüllen.')
      return
    }
    setSaving(true)
    setError(null)

    let fotoUrl = form.foto || null

    // Upload new photo if selected
    if (fotoFile) {
      const ext = fotoFile.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filename, fotoFile, { upsert: true })
      if (uploadError) {
        setError('Foto-Upload fehlgeschlagen: ' + uploadError.message)
        setSaving(false)
        return
      }
      const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(filename)
      fotoUrl = urlData.publicUrl
    }

    const payload = { ...form, foto: fotoUrl }

    if (isEdit) {
      const { error: dbErr } = await supabase.from('hunde').update(payload).eq('id', id)
      if (dbErr) { setError(dbErr.message); setSaving(false); return }
    } else {
      const { error: dbErr } = await supabase.from('hunde').insert([payload])
      if (dbErr) { setError(dbErr.message); setSaving(false); return }
    }

    router.replace('/hunde')
  }

  return (
    <div style={{ padding: '1.25rem 1rem 5rem' }}>

      {/* Foto Upload */}
      <Feld label="Foto">
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed var(--border)',
            borderRadius: '1rem',
            background: 'var(--gruen-hell)',
            minHeight: '160px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
          }}
        >
          {fotoPreview ? (
            <Image
              src={fotoPreview}
              alt="Vorschau"
              width={340}
              height={180}
              style={{ objectFit: 'cover', width: '100%', height: '180px' }}
            />
          ) : (
            <>
              <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--gruen-dunkel)', fontWeight: 500 }}>
                Foto auswählen
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-grau)', marginTop: '0.25rem' }}>
                Tippe hier zum Hochladen
              </span>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFoto}
          style={{ display: 'none' }}
        />
        {fotoPreview && (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              marginTop: '0.5rem', width: '100%',
              padding: '0.6rem', borderRadius: '0.6rem',
              border: '1.5px solid var(--border)',
              background: 'white', color: 'var(--gruen-dunkel)',
              fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            Anderes Foto wählen
          </button>
        )}
      </Feld>

      <Feld label="Name" required>
        <input style={INPUT_STYLE} value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="z.B. Luna" />
      </Feld>

      <Feld label="Rasse" required>
        <input style={INPUT_STYLE} value={form.rasse}
          onChange={e => set('rasse', e.target.value)}
          placeholder="z.B. Mischling, Podenco" />
      </Feld>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Feld label="Alter">
          <input style={INPUT_STYLE} value={form.alter}
            onChange={e => set('alter', e.target.value)}
            placeholder="z.B. 2 Jahre" />
        </Feld>
        <Feld label="Geschlecht">
          <select style={SELECT_STYLE} value={form.geschlecht}
            onChange={e => set('geschlecht', e.target.value as Hund['geschlecht'])}>
            <option value="Weiblich">Weiblich</option>
            <option value="Männlich">Männlich</option>
          </select>
        </Feld>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Feld label="Grösse">
          <select style={SELECT_STYLE} value={form.groesse}
            onChange={e => set('groesse', e.target.value as Hund['groesse'])}>
            <option value="klein">Klein</option>
            <option value="mittel">Mittel</option>
            <option value="gross">Gross</option>
          </select>
        </Feld>
        <Feld label="Status">
          <select style={SELECT_STYLE} value={form.status}
            onChange={e => set('status', e.target.value as Hund['status'])}>
            <option value="verfuegbar">Verfügbar</option>
            <option value="reserviert">Reserviert</option>
            <option value="vermittelt">Vermittelt</option>
          </select>
        </Feld>
      </div>

      <Feld label="Kurzbeschreibung (für die Übersicht)" required>
        <textarea
          style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical', lineHeight: 1.5 }}
          value={form.kurzbeschreibung}
          onChange={e => set('kurzbeschreibung', e.target.value)}
          placeholder="1–2 Sätze über den Hund…"
        />
      </Feld>

      <Feld label="Ausführliche Beschreibung">
        <textarea
          style={{ ...INPUT_STYLE, minHeight: '120px', resize: 'vertical', lineHeight: 1.5 }}
          value={form.beschreibung}
          onChange={e => set('beschreibung', e.target.value)}
          placeholder="Charakter, Geschichte, Besonderheiten…"
        />
      </Feld>

      <Feld label="Verträglichkeit">
        <input style={INPUT_STYLE} value={form.vertraeglichkeit}
          onChange={e => set('vertraeglichkeit', e.target.value)}
          placeholder="z.B. kinderlieb, verträgt sich mit Katzen" />
      </Feld>

      {/* Kastriert Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem', background: 'white', borderRadius: '0.75rem',
        border: '1.5px solid var(--border)', marginBottom: '1.25rem',
      }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gruen-dunkel)' }}>
          Kastriert
        </span>
        <button
          onClick={() => set('kastriert', !form.kastriert)}
          style={{
            width: '52px', height: '28px', borderRadius: '999px',
            border: 'none', cursor: 'pointer',
            background: form.kastriert ? 'var(--gruen-button)' : '#ccc',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px',
            left: form.kastriert ? '26px' : '3px',
            width: '22px', height: '22px',
            background: 'white', borderRadius: '50%',
            transition: 'left 0.2s', display: 'block',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '0.75rem',
          background: '#fff0f0', border: '1px solid #f5c6c6',
          color: '#c0392b', fontSize: '0.875rem',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'white', borderTop: '1px solid var(--border)', zIndex: 50 }}>
        <button
          onClick={() => router.back()}
          style={{
            flex: 1, padding: '1rem', borderRadius: '0.75rem',
            border: '1.5px solid var(--border)', background: 'white',
            color: 'var(--text-grau)', fontSize: '0.95rem', fontWeight: 600,
          }}
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 2, padding: '1rem', borderRadius: '0.75rem',
            border: 'none',
            background: saving ? '#a8c4ae' : 'var(--gruen-button)',
            color: 'white', fontSize: '0.95rem', fontWeight: 700,
          }}
        >
          {saving ? 'Wird gespeichert…' : isEdit ? '✓ Änderungen speichern' : '✓ Hund erfassen'}
        </button>
      </div>
    </div>
  )
}
