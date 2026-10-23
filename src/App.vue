<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fetchEmployees } from '@/api/directus'
import AppHeader from '@/components/AppHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import EmployeeCard from '@/components/EmployeeCard.vue'
import EmployeeTable from '@/components/EmployeeTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchSelect from '@/components/SearchSelect.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useToast } from '@/composables/ui'
import { config } from '@/config'
import { matchesQuery, phoneDigits, searchKey } from '@/lib/format'
import type { Row, SortDir, SortKey } from '@/types'

const toast = useToast()
const rows = ref<Row[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const params = new URLSearchParams(location.search)
const q = ref(params.get('q') ?? '')
const company = ref('')
const site = ref('')
const view = ref<'cards' | 'table'>(readView())
const limit = ref(60)
const searchInput = ref<HTMLInputElement | null>(null)

// Standard ist die Liste. Neuer Schlüssel, damit eine früher gemerkte Kachel-Wahl nicht greift.
const VIEW_KEY = 'telefonliste.ansicht'
function readView(): 'cards' | 'table' {
  try {
    return localStorage.getItem(VIEW_KEY) === 'cards' ? 'cards' : 'table'
  } catch {
    return 'table'
  }
}
watch(view, (v) => {
  try {
    localStorage.setItem(VIEW_KEY, v)
  } catch {
    /* egal */
  }
})

// Unter lg (Tablet/Handy) ist die Liste zu eng – dort immer Kacheln, Umschalter ausgeblendet
const narrowQuery = window.matchMedia('(max-width: 1023px)')
const narrow = ref(narrowQuery.matches)
const onNarrow = (e: MediaQueryListEvent) => (narrow.value = e.matches)
const effectiveView = computed(() => (narrow.value ? 'cards' : view.value))

const COLORS =['bg-brand-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500']
function color(key: string) {
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return COLORS[h % COLORS.length]
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchEmployees()
    rows.value = data.map((e) => ({
      ...e,
      _key: searchKey(e.firstName, e.lastName, e.email, e.jobTitle, e.company, e.location),
      _digits: `${phoneDigits(e.phone)} ${phoneDigits(e.mobile)}`,
      _initials: ((e.firstName[0] ?? '') + (e.lastName[0] ?? '')).toUpperCase(),
      _color: color(e.email || `${e.firstName}${e.lastName}`),
    }))
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

// Suche in der URL halten – so lässt sich ein Treffer als Link teilen
watch(q, () => {
  limit.value = 60
  const url = new URL(location.href)
  if (q.value) url.searchParams.set('q', q.value)
  else url.searchParams.delete('q')
  history.replaceState(null, '', url)
})
watch([company, site], () => (limit.value = 60))

/** Optionen mit Anzahl – gezählt unter dem jeweils ANDEREN Filter, damit z. B. nach Wahl
 *  einer Firma nur deren Niederlassungen erscheinen. Die aktuelle Auswahl bleibt immer drin. */
function optionsFor(key: 'company' | 'location', otherKey: 'company' | 'location', otherValue: string, selected: string) {
  const counts = new Map<string, number>()
  for (const r of rows.value) {
    if (!r[key] || (otherValue && r[otherKey] !== otherValue)) continue
    counts.set(r[key], (counts.get(r[key]) ?? 0) + 1)
  }
  if (selected && !counts.has(selected)) counts.set(selected, 0)
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value, 'de'))
}
const companyOptions = computed(() => optionsFor('company', 'location', site.value, company.value))
const siteOptions = computed(() => optionsFor('location', 'company', company.value, site.value))
const companies = computed(() => new Set(rows.value.map((r) => r.company).filter(Boolean)))
const sites = computed(() => new Set(rows.value.map((r) => r.location).filter(Boolean)))

const filtered = computed(() =>
  rows.value.filter((r) =>
    (!company.value || r.company === company.value)
    && (!site.value || r.location === site.value)
    && matchesQuery(r._key, r._digits, q.value)),
)
// ── Sortierung (Spaltenköpfe der Tabelle) ──────────────────────────────────
// Klick: aufsteigend → absteigend → zurück zur Standardsortierung (Name ↑).
// Leere Werte stehen immer am Ende, egal in welche Richtung.
const sortKey = ref<SortKey>('name')
const sortDir = ref<SortDir>('asc')
watch([sortKey, sortDir], () => (limit.value = 60))

function toggleSort(key: SortKey) {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortKey.value = 'name'
    sortDir.value = 'asc'
  }
}
const collator = new Intl.Collator('de', { sensitivity: 'base', numeric: true })
const byName = (a: Row, b: Row) => collator.compare(a.lastName, b.lastName) || collator.compare(a.firstName, b.firstName)
function sortValue(r: Row, key: SortKey): string {
  if (key === 'phone') return r.phone.replace(/[^\d+]/g, '')
  if (key === 'name') return `${r.lastName} ${r.firstName}`.trim()
  return r[key]
}

const sorted = computed(() => {
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filtered.value].sort((a, b) => {
    if (key === 'name') return dir * byName(a, b)
    const va = sortValue(a, key)
    const vb = sortValue(b, key)
    if (!va || !vb) return va ? -1 : vb ? 1 : byName(a, b)
    return dir * collator.compare(va, vb) || byName(a, b)
  })
})
const shown = computed(() => sorted.value.slice(0, limit.value))
const hasFilters = computed(() => !!(q.value || company.value || site.value))

const subtitle = computed(() => {
  if (loading.value || error.value) return undefined
  const n = rows.value.length
  return filtered.value.length === n ? `${n} Mitarbeitende` : `${filtered.value.length} von ${n} Mitarbeitenden`
})

function resetFilters() {
  q.value = ''
  company.value = ''
  site.value = ''
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Kopiert', text)
  } catch {
    toast.error('Kopieren nicht möglich')
  }
}

// „/" fokussiert die Suche, Esc leert sie
function onKey(ev: KeyboardEvent) {
  const active = document.activeElement
  if (ev.key === '/' && active !== searchInput.value && !(active instanceof HTMLInputElement || active instanceof HTMLSelectElement)) {
    ev.preventDefault()
    searchInput.value?.focus()
  } else if (ev.key === 'Escape' && active === searchInput.value) {
    q.value = ''
  }
}

onMounted(() => {
  void load()
  window.addEventListener('keydown', onKey)
  narrowQuery.addEventListener('change', onNarrow)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  narrowQuery.removeEventListener('change', onNarrow)
})
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />

    <main class="mx-auto w-full max-w-screen-2xl px-4 pb-12 pt-6 md:px-6">
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold tracking-tight">Telefonliste</h1>
          <p class="mt-1 flex items-center gap-2 text-sm muted">
            <span v-if="subtitle">{{ subtitle }}</span>
            <span v-else-if="loading">Lade Mitarbeitende …</span>
            <span v-if="config.useMock" class="chip bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300">Beispieldaten</span>
          </p>
        </div>
      </header>

      <!-- Filter -->
      <div class="card mb-5 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div class="relative flex-1">
          <AppIcon name="search" :size="16" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input ref="searchInput" v-model="q" type="search" class="input !border-transparent !bg-transparent pl-10 !ring-0"
                 placeholder="Name, Position, Nummer oder E-Mail suchen …" autofocus aria-label="Suche" />
          <kbd v-if="!q" class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-gray-200 px-1.5 text-xs muted dark:border-white/10 md:block">/</kbd>
        </div>
        <div class="flex flex-wrap gap-2">
          <SearchSelect v-if="companies.size > 1" v-model="company" :options="companyOptions" placeholder="Alle Firmen" icon="building" label="Firma" />
          <SearchSelect v-if="sites.size > 1" v-model="site" :options="siteOptions" placeholder="Alle Niederlassungen" icon="pin" label="Niederlassung" />
          <div class="hidden rounded-xl border border-gray-200 p-0.5 dark:border-white/10 lg:flex" role="group" aria-label="Ansicht">
            <button class="flex items-center gap-1.5 rounded-lg px-3 text-sm transition" :aria-pressed="view === 'table'"
                    :class="view === 'table' ? 'bg-brand-500 text-white' : 'muted hover:text-gray-900 dark:hover:text-gray-100'" title="Listenansicht" @click="view = 'table'">
              <AppIcon name="menu" :size="15" />Liste
            </button>
            <button class="flex items-center gap-1.5 rounded-lg px-3 text-sm transition" :aria-pressed="view === 'cards'"
                    :class="view === 'cards' ? 'bg-brand-500 text-white' : 'muted hover:text-gray-900 dark:hover:text-gray-100'" title="Kachelansicht" @click="view = 'cards'">
              <AppIcon name="dashboard" :size="15" />Kacheln
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading && effectiveView === 'table'" class="card space-y-3 p-5">
        <div v-for="i in 8" :key="i" class="skeleton h-11" />
      </div>
      <div v-else-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="i in 9" :key="i" class="skeleton h-44" />
      </div>

      <div v-else-if="error" class="card">
        <EmptyState icon="alert" title="Die Telefonliste konnte nicht geladen werden" :text="error">
          <button class="btn-primary" @click="load"><AppIcon name="rotate" :size="16" /> Erneut versuchen</button>
        </EmptyState>
      </div>

      <div v-else-if="!filtered.length" class="card">
        <EmptyState icon="search" :title="rows.length ? 'Keine Treffer' : 'Keine Mitarbeitenden gefunden'"
                    :text="rows.length ? 'Suche oder Filter anpassen.' : 'In AlphaCore sind keine aktiven Mitarbeitenden sichtbar.'">
          <button v-if="hasFilters" class="btn-secondary" @click="resetFilters">Filter zurücksetzen</button>
        </EmptyState>
      </div>

      <!-- Kacheln -->
      <div v-else-if="effectiveView === 'cards'" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <EmployeeCard v-for="r in shown" :key="r.id" :employee="r" :initials="r._initials" :color="r._color" @copy="copy" />
      </div>

      <!-- Liste -->
      <EmployeeTable v-else :rows="shown" :sort-key="sortKey" :sort-dir="sortDir"
                     :show-company="companies.size > 1" :show-location="sites.size > 1"
                     @sort="toggleSort" @copy="copy" />

      <div v-if="filtered.length > shown.length" class="mt-6 flex justify-center">
        <button class="btn-secondary" @click="limit += 120">Weitere anzeigen ({{ filtered.length - shown.length }})</button>
      </div>
    </main>

    <ToastHost />
  </div>
</template>
