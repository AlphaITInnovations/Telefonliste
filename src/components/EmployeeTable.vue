<script setup lang="ts">
/**
 * Listenansicht. Zusammengehörige Werte teilen sich eine Spalte (Name + Position,
 * Firma + Niederlassung, Telefon + Mobil), damit alles ohne seitliches Scrollen passt.
 * Jeder Wert bleibt einzeln sortierbar.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import SortButton from '@/components/SortButton.vue'
import TeamsIcon from '@/components/TeamsIcon.vue'
import { teamsChatHref, telHref } from '@/lib/format'
import type { Row, SortDir, SortKey } from '@/types'

const props = defineProps<{ rows: Row[]; sortKey: SortKey; sortDir: SortDir; showCompany: boolean; showLocation: boolean }>()
const emit = defineEmits<{ sort: [key: SortKey]; copy: [text: string] }>()

// Unter 1280 px reicht der Platz nicht für eine eigene Firma-Spalte –
// dann stehen Firma/Niederlassung unter Name und Position.
const wideQuery = window.matchMedia('(min-width: 1280px)')
const wide = ref(wideQuery.matches)
const onWide = (e: MediaQueryListEvent) => (wide.value = e.matches)
onMounted(() => wideQuery.addEventListener('change', onWide))
onBeforeUnmount(() => wideQuery.removeEventListener('change', onWide))

const hasOrg = computed(() => props.showCompany || props.showLocation)
const orgColumn = computed(() => wide.value && hasOrg.value)
const orgInline = computed(() => !wide.value && hasOrg.value)

function ariaSort(keys: SortKey[], key: SortKey, dir: SortDir) {
  if (!keys.includes(key)) return 'none'
  return dir === 'asc' ? 'ascending' : 'descending'
}

const th = 'border-b border-gray-200 bg-gray-50 px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:border-white/[0.07] dark:bg-ink-850 dark:text-gray-400 sticky top-[84px] z-10'
const copyBtn = 'rounded-md p-1 muted opacity-0 transition hover:bg-gray-100 hover:text-brand-600 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-white/10'
</script>

<template>
  <div class="card">
    <div class="rounded-2xl">
      <table class="w-full table-fixed text-sm">
        <colgroup v-if="orgColumn">
          <col class="w-[26%]" />
          <col class="w-[21%]" />
          <col class="w-[17%]" />
          <col />
          <col class="w-20" />
        </colgroup>
        <colgroup v-else>
          <col class="w-[35%]" />
          <col class="w-[20%]" />
          <col />
          <col class="w-20" />
        </colgroup>
        <thead>
          <tr>
            <th :class="[th, 'rounded-tl-2xl']" :aria-sort="ariaSort(orgInline ? ['name', 'jobTitle', 'company', 'location'] : ['name', 'jobTitle'], sortKey, sortDir)">
              <span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                <SortButton label="Name" column="name" :sort-key="sortKey" :sort-dir="sortDir" @sort="emit('sort', $event)" />
                <span class="text-gray-300 dark:text-gray-600">/</span>
                <SortButton label="Position" column="jobTitle" :sort-key="sortKey" :sort-dir="sortDir" @sort="emit('sort', $event)" />
                <template v-if="orgInline && showCompany">
                  <span class="text-gray-300 dark:text-gray-600">/</span>
                  <SortButton label="Firma" column="company" :sort-key="sortKey" :sort-dir="sortDir" @sort="emit('sort', $event)" />
                </template>
                <template v-if="orgInline && showLocation">
                  <span class="text-gray-300 dark:text-gray-600">/</span>
                  <SortButton label="Niederlassung" column="location" :sort-key="sortKey" :sort-dir="sortDir" @sort="emit('sort', $event)" />
                </template>
              </span>
            </th>
            <th v-if="orgColumn" :class="th" :aria-sort="ariaSort(['company', 'location'], sortKey, sortDir)">
              <span class="inline-flex items-center gap-2">
                <SortButton v-if="showCompany" label="Firma" column="company" :sort-key="sortKey" :sort-dir="sortDir" @sort="emit('sort', $event)" />
                <span v-if="showCompany && showLocation" class="text-gray-300 dark:text-gray-600">/</span>
                <SortButton v-if="showLocation" label="Niederlassung" column="location" :sort-key="sortKey" :sort-dir="sortDir" @sort="emit('sort', $event)" />
              </span>
            </th>
            <th :class="th" :aria-sort="ariaSort(['phone'], sortKey, sortDir)">
              <span class="inline-flex items-center gap-2">
                <SortButton label="Telefon" column="phone" :sort-key="sortKey" :sort-dir="sortDir" @sort="emit('sort', $event)" />
                <span class="text-gray-300 dark:text-gray-600">/</span>
                <span class="uppercase tracking-wide">Mobil</span>
              </span>
            </th>
            <th :class="th"><span class="uppercase tracking-wide">E-Mail</span></th>
            <th :class="[th, 'rounded-tr-2xl !px-3 text-center']"><span class="uppercase tracking-wide">Teams</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id"
              class="group border-b border-gray-100 transition-colors last:border-b-0 hover:bg-brand-50/50 dark:border-white/[0.05] dark:hover:bg-white/[0.03]">
            <!-- Name + Position -->
            <td class="px-5 py-3.5">
              <div class="flex min-w-0 items-center gap-3">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white" :class="r._color">{{ r._initials || '?' }}</span>
                <div class="min-w-0">
                  <p class="truncate font-semibold" :title="`${r.firstName} ${r.lastName}`">{{ r.lastName }}, {{ r.firstName }}</p>
                  <p class="line-clamp-2 text-xs muted" :title="r.jobTitle">{{ r.jobTitle || '—' }}</p>
                  <p v-if="orgInline && (r.company || r.location)" class="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                    <span v-if="showCompany && r.company" class="flex min-w-0 items-center gap-1" :title="r.company">
                      <AppIcon name="building" :size="12" class="shrink-0 text-gray-400" /><span class="truncate">{{ r.company }}</span>
                    </span>
                    <span v-if="showLocation && r.location" class="flex min-w-0 items-center gap-1" :title="r.location">
                      <AppIcon name="pin" :size="12" class="shrink-0 text-gray-400" /><span class="truncate">{{ r.location }}</span>
                    </span>
                  </p>
                </div>
              </div>
            </td>

            <!-- Firma + Niederlassung -->
            <td v-if="orgColumn" class="px-5 py-3.5">
              <p v-if="showCompany" class="line-clamp-2 leading-snug" :title="r.company">{{ r.company || '—' }}</p>
              <p v-if="showLocation && r.location" class="mt-0.5 flex min-w-0 items-center gap-1 text-xs muted" :title="r.location">
                <AppIcon name="pin" :size="12" class="shrink-0" /><span class="truncate">{{ r.location }}</span>
              </p>
            </td>

            <!-- Telefon + Mobil -->
            <td class="px-5 py-3.5">
              <div class="space-y-1">
                <div v-if="r.phone" class="flex items-center gap-1.5">
                  <AppIcon name="phone" :size="13" class="text-gray-400" />
                  <a :href="telHref(r.phone)" class="whitespace-nowrap tabular-nums hover:text-brand-600 hover:underline" :title="`${r.phone} anrufen`">{{ r.phone }}</a>
                  <button :class="copyBtn" aria-label="Telefonnummer kopieren" title="Kopieren" @click="emit('copy', r.phone)"><AppIcon name="copy" :size="13" /></button>
                </div>
                <div v-if="r.mobile" class="flex items-center gap-1.5">
                  <AppIcon name="smartphone" :size="13" class="text-gray-400" />
                  <a :href="telHref(r.mobile)" class="whitespace-nowrap tabular-nums hover:text-brand-600 hover:underline" :title="`${r.mobile} anrufen`">{{ r.mobile }}</a>
                  <button :class="copyBtn" aria-label="Mobilnummer kopieren" title="Kopieren" @click="emit('copy', r.mobile)"><AppIcon name="copy" :size="13" /></button>
                </div>
                <span v-if="!r.phone && !r.mobile" class="muted">—</span>
              </div>
            </td>

            <!-- E-Mail -->
            <td class="px-5 py-3.5">
              <div v-if="r.email" class="flex min-w-0 items-center gap-1.5">
                <a :href="`mailto:${r.email}`" class="min-w-0 [overflow-wrap:anywhere] hover:text-brand-600 hover:underline" :title="`E-Mail an ${r.email}`">{{ r.email }}</a>
                <button :class="copyBtn" aria-label="E-Mail kopieren" title="Kopieren" @click="emit('copy', r.email)"><AppIcon name="copy" :size="13" /></button>
              </div>
              <span v-else class="muted">—</span>
            </td>

            <!-- Teams -->
            <td class="px-3 py-3.5 text-center">
              <a v-if="r.email" :href="teamsChatHref(r.email)" target="_blank" rel="noopener"
                 class="inline-grid h-8 w-8 place-items-center rounded-lg transition hover:bg-[#5059C9]/10"
                 :title="`Teams-Chat mit ${r.firstName} ${r.lastName}`" :aria-label="`Teams-Chat mit ${r.firstName} ${r.lastName}`">
                <TeamsIcon :size="18" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
