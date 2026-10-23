import { parsePhoneNumberFromString } from 'libphonenumber-js'

/** Rufnummer lesbar gruppieren: „+4951140080036" → „+49 511 40080036".
 *  Nummern ohne Ländervorwahl gelten als deutsch. Nicht erkennbare Nummern bleiben unverändert. */
export function formatPhone(n: string): string {
  if (!n) return ''
  const parsed = parsePhoneNumberFromString(n, 'DE')
  return parsed?.isValid() ? parsed.formatInternational() : n
}

/** Kleinschreibung, Umlaute & Akzente vereinheitlichen – „mueller" findet „Müller". */
export function searchKey(...parts: (string | null | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function digits(s: string): string {
  return s.replace(/\D/g, '')
}

/** Suchziffern einer Nummer – international UND national („+49 171 …" ↔ „0171 …"). */
export function phoneDigits(n: string): string {
  const d = digits(n)
  const national = n.trim().startsWith('+49') ? `0${d.slice(2)}` : n.trim().startsWith('0049') ? `0${d.slice(4)}` : ''
  return [d, national].filter(Boolean).join(' ')
}

/** Sieht die Eingabe wie eine Nummer aus, wird nur in den Ziffern gesucht,
 *  sonst muss jedes Wort im Suchschlüssel vorkommen. */
export function matchesQuery(key: string, numberDigits: string, query: string): boolean {
  const q = query.trim()
  if (!q) return true
  if (/^[\d\s+\-/()]+$/.test(q)) return numberDigits.includes(digits(q))
  return searchKey(q).split(/\s+/).every((t) => key.includes(t))
}

export function telHref(n: string): string {
  return `tel:${n.replace(/[^\d+]/g, '')}`
}

export function teamsChatHref(email: string): string {
  return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`
}
