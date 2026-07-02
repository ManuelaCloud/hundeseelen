'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Hund } from '@/lib/supabase'
import Image from 'next/image'

type FormData = Omit<Hund, 'id' | 'erfasst_am'>

const LEER: FormData = {
  name: '', rasse: '', alter: '', geschlecht: 'Weiblich',
  status: 'verfuegbar', kurzbeschreibung: '', beschreibung: '',
  groesse: 'mittel', vertraeglichkeit: '', kastriert: false, fotos: [],
}

function Feld({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gruen-dunkel)', marginBottom: '0.4rem' }}>
        {label}{required && <span style={{ color: '#c0392b' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem',
  border: '1.5px solid var(--border)', fontSize: '1rem',
  color: 'var(--text-dunkel)', background: 'white', outline: 'none',
}
const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE, appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%235a8f6a\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem',
}

export default function HundForm({ initial, id }: { initial?: Partial<Hund>; id?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ ...LEER, ...initial, fotos: initial?.fotos || [] })
  const [previews, setPreviews] = useState<string[]>(initial?.fotos || [])
  const [newFiles, setNewFiles] = useState<(File | null)[]>([null, null, null, null, null])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const isEdit = !!id

  const set = (field: keyof FormData, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleFoto = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const newFilesArr = [...newFiles]
    newFilesArr[index] = file
    setNewFiles(newFilesArr)
    const newPreviews = [...previews]
    newPreviews[index] = URL.createObjectURL(file)
    setPreviews(newPreviews)
  }

  const removeFoto = (index: number) => {
    const newPreviews = [...previews]
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
    const newFilesArr = [...newFiles]
    newFilesArr[index] = null
    setNewFiles(newFilesArr)
    const newFotos = [...form.fotos]
    newFotos.splice(index, 1)
    set('fotos', newFotos)
  }

  const handleSave = async () => {
    if (!form.name || !form.rasse || !form.kurzbeschreibung) {
      setError('Bitte Name, Rasse und Kurzbeschreibung ausfüllen.')
      return
    }
    setSaving(true)
    setError(null)

    // Upload new files and collect all URLs
    const fotoUrls: string[] = [...form.fotos]

    for (let i = 0; i < 5; i++) {
      const file = newFiles[i]
      if (!file) continue
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('fotos').upload(filename, file, { upsert: true })
      if (uploadError) {
        setError('Foto-Upload fehlgeschlagen: ' + uploadError.message)
        setSaving(false)
        return
      }
      const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(filename)
      // Replace or append
      if (i < fotoUrls.length) {
        fotoUrls[i] = urlData.publicUrl
      } else {
        fotoUrls.push(urlData.publicUrl)
      }
    }

    const payload = { ...form, fotos: fotoUrls }

    if (isEdit) {
      const { error: dbErr } = await supabase.from('hunde').update(payload).eq('id', id)
      if (dbErr) { setError(dbErr.message); setSaving(false); return }
    } else {
      const { error: dbErr } = await supabase.from('hunde').insert([payload])
      if (dbErr) { setError(dbErr.message); setSaving(false); return }
    }

    router.replace('/hunde')
  }

  const slotCount = Math.min(5, previews.length + 1)

  return (
    <div style={{ padding: '1.25rem 1rem 5rem' }}>

      {/* Fotos */}
      <Feld label={`Fotos (max. 5, erstes = Hauptfoto)`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {Array.from({ length: slotCount }).map((_, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div
                onClick={() => fileRefs[i]?.current?.click()}
                style={{
                  aspectRatio: '1', borderRadius: '0.75rem',
                  border: previews[i] ? 'none' : '2px dashed var(--border)',
                  background: previews[i] ? 'transparent' : 'var(--gruen-hell)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', position: 'relative',
                }}
              >
                {previews[i] ? (
                  <>
                    <Image src={previews[i]} alt={`Foto ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                    {i === 0 && (
                      <span style={{
                        position: 'absolute', top: '4px', left: '4px',
                        background: 'var(--gruen-button)', color: 'white',
                        fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px',
                        borderRadius: '999px',
                      }}>HAUPT</span>
                    )}
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '1.5rem' }}>{i === 0 ? '📷' : '+'}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-grau)', marginTop: '0.2rem' }}>
                      {i === 0 ? 'Hauptfoto' : `Foto ${i + 1}`}
                    </span>
                  </>
                )}
              </div>
              {previews[i] && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFoto(i) }}
                  style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: '#c0392b', color: 'white', border: 'none',
                    fontSize: '0.75rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 10,
                  }}
                >×</button>
              )}
              <input
                ref={fileRefs[i]}
                type="file" accept="image/*" capture="environment"
                onChange={(e) => handleFoto(i, e)}
                style={{ display: 'none' }}
              />
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-grau)', marginTop: '0.5rem' }}>
          Erstes Foto erscheint in der Übersicht. Weitere nur im Detail.
        </p>
      </Feld>

      <Feld label="Name" required>
        <input style={INPUT_STYLE} value={form.name} onChange={e => set('name', e.target.value)} placeholder="z.B. Luna" />
      </Feld>

      <Feld label="Rasse" required>
        <input style={INPUT_STYLE} value={form.rasse} onChange={e => set('rasse', e.target.value)} placeholder="z.B. Mischling, Podenco" />
      </Feld>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Feld label="Alter">
          <input style={INPUT_STYLE} value={form.alter} onChange={e => set('alter', e.target.value)} placeholder="z.B. 2 Jahre" />
        </Feld>
        <Feld label="Geschlecht">
          <select style={SELECT_STYLE} value={form.geschlecht} onChange={e => set('geschlecht', e.target.value as Hund['geschlecht'])}>
            <option value="Weiblich">Weiblich</option>
            <option value="Männlich">Männlich</option>
          </select>
        </Feld>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Feld label="Grösse">
          <select style={SELECT_STYLE} value={form.groesse} onChange={e => set('groesse', e.target.value as Hund['groesse'])}>
            <option value="klein">Klein</option>
            <option value="mittel">Mittel</option>
            <option value="gross">Gross</option>
          </select>
        </Feld>
        <Feld label="Status">
          <select style={SELECT_STYLE} value={form.status} onChange={e => set('status', e.target.value as Hund['status'])}>
            <option value="verfuegbar">Verfügbar</option>
            <option value="reserviert">Reserviert</option>
            <option value="vermittelt">Vermittelt</option>
          </select>
        </Feld>
      </div>

      <Feld label="Kurzbeschreibung" required>
        <textarea style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical', lineHeight: 1.5 }}
          value={form.kurzbeschreibung} onChange={e => set('kurzbeschreibung', e.target.value)}
          placeholder="1–2 Sätze über den Hund…" />
      </Feld>

      <Feld label="Ausführliche Beschreibung">
        <textarea style={{ ...INPUT_STYLE, minHeight: '120px', resize: 'vertical', lineHeight: 1.5 }}
          value={form.beschreibung} onChange={e => set('beschreibung', e.target.value)}
          placeholder="Charakter, Geschichte, Besonderheiten…" />
      </Feld>

      <Feld label="Verträglichkeit">
        <input style={INPUT_STYLE} value={form.vertraeglichkeit} onChange={e => set('vertraeglichkeit', e.target.value)}
          placeholder="z.B. kinderlieb, verträgt sich mit Katzen" />
      </Feld>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem', background: 'white', borderRadius: '0.75rem',
        border: '1.5px solid var(--border)', marginBottom: '1.25rem',
      }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gruen-dunkel)' }}>Kastriert</span>
        <button onClick={() => set('kastriert', !form.kastriert)} style={{
          width: '52px', height: '28px', borderRadius: '999px', border: 'none',
          background: form.kastriert ? 'var(--gruen-button)' : '#ccc', position: 'relative', transition: 'background 0.2s',
        }}>
          <span style={{
            position: 'absolute', top: '3px', left: form.kastriert ? '26px' : '3px',
            width: '22px', height: '22px', background: 'white', borderRadius: '50%',
            transition: 'left 0.2s', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '0.75rem',
          background: '#fff0f0', border: '1px solid #f5c6c6',
          color: '#c0392b', fontSize: '0.875rem', marginBottom: '1rem',
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'white', borderTop: '1px solid var(--border)', zIndex: 50 }}>
        <button onClick={() => router.back()} style={{
          flex: 1, padding: '1rem', borderRadius: '0.75rem',
          border: '1.5px solid var(--border)', background: 'white',
          color: 'var(--text-grau)', fontSize: '0.95rem', fontWeight: 600,
        }}>Abbrechen</button>
        <button onClick={handleSave} disabled={saving} style={{
          flex: 2, padding: '1rem', borderRadius: '0.75rem', border: 'none',
          background: saving ? '#a8c4ae' : 'var(--gruen-button)',
          color: 'white', fontSize: '0.95rem', fontWeight: 700,
        }}>{saving ? 'Wird gespeichert…' : isEdit ? '✓ Änderungen speichern' : '✓ Hund erfassen'}</button>
      </div>
    </div>
  )
}
