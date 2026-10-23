import { config } from '@/config'
import { formatPhone } from '@/lib/format'
import { mockEmployees } from './mock'

export interface Employee {
  id: string | number
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  phone: string
  mobile: string
  company: string
  location: string
}

type Raw = Record<string, unknown>

// Alle Requests gehen an /api – der Proxy (Vite im Dev, nginx in Prod) leitet an
// AlphaCore weiter und hängt den Token an. So landet der Token nie im Browser.
const API_BASE = '/api'

/** Wert an einem dot-Pfad (`company.name`); nur Text/Zahl wird übernommen,
 *  damit eine nicht aufgelöste Relation nicht als ID oder Objekt erscheint. */
function pick(obj: Raw, path: string): string {
  if (!path) return ''
  let v: unknown = obj
  for (const key of path.split('.')) {
    if (v == null || typeof v !== 'object') return ''
    v = (v as Raw)[key]
  }
  return typeof v === 'string' ? v.trim() : ''
}

function normalize(raw: Raw): Employee {
  const f = config.fields
  return {
    id: raw.id as string | number,
    firstName: pick(raw, f.firstName),
    lastName: pick(raw, f.lastName),
    email: pick(raw, f.email),
    jobTitle: pick(raw, f.jobTitle),
    // Nur für die Anzeige gruppiert – tel:-Links, Suche und Sortierung nutzen die Ziffern
    phone: formatPhone(pick(raw, f.phone)),
    mobile: formatPhone(pick(raw, f.mobile)),
    company: pick(raw, f.company),
    location: pick(raw, f.location),
  }
}

/** Filter „aktive Mitarbeitende" wie in AlphaContactSync – läuft komplett in Directus,
 *  damit Status und Austrittsdatum nicht geladen werden müssen (Datensparsamkeit). */
function activeFilter(): Raw {
  const clauses: Raw[] = []
  if (config.statusField && config.statusValues.length) {
    clauses.push({ [config.statusField]: { _in: config.statusValues } })
  }
  if (config.exitDateField) {
    // -1 day: am letzten Arbeitstag noch in der Liste
    clauses.push({ _or: [{ [config.exitDateField]: { _null: true } }, { [config.exitDateField]: { _gte: '$NOW(-1 day)' } }] })
  }
  return clauses.length ? { _and: clauses } : {}
}

export async function fetchEmployees(): Promise<Employee[]> {
  if (config.useMock) {
    await new Promise((r) => setTimeout(r, 400))
    return mockEmployees.map(normalize)
  }

  const fields = ['id', ...Object.values(config.fields).filter(Boolean)]
  const params = new URLSearchParams({
    fields: fields.join(','),
    filter: JSON.stringify(activeFilter()),
    sort: `${config.fields.lastName},${config.fields.firstName}`,
    limit: '-1',
  })

  const res = await fetch(`${API_BASE}/items/${config.collection}?${params}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.errors?.[0]?.message ?? ''
    } catch {
      /* keine JSON-Antwort */
    }
    throw new Error(`AlphaCore ${res.status}${detail ? `: ${detail}` : ''}`)
  }
  const { data } = (await res.json()) as { data: Raw[] }
  return data.map(normalize)
}
