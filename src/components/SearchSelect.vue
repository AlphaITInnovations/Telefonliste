<script setup lang="ts">
/**
 * Auswahlfeld mit Suche (für lange Listen wie 111 Niederlassungen).
 * Optik und Tastatursteuerung wie der RecipientPicker in AlphaContactSync.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { searchKey } from '@/lib/format'

const props = defineProps<{
  options: { value: string; count: number }[]
  placeholder: string
  icon: string
  label: string
}>()
const model = defineModel<string>({ required: true })

const open = ref(false)
const q = ref('')
const active = ref(0)
const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  const terms = searchKey(q.value).split(/\s+/).filter(Boolean)
  return props.options.filter((o) => {
    const key = searchKey(o.value)
    return terms.every((t) => key.includes(t))
  })
})

async function toggle() {
  open.value = !open.value
  if (open.value) {
    q.value = ''
    active.value = Math.max(0, filtered.value.findIndex((o) => o.value === model.value))
    await nextTick()
    input.value?.focus()
    scrollActive()
  }
}
function choose(value: string) {
  model.value = value
  open.value = false
}
function onEnter() {
  const o = filtered.value[active.value]
  if (o) choose(o.value)
}
function move(d: number) {
  const n = filtered.value.length
  if (!n) return
  active.value = (active.value + d + n) % n
  scrollActive()
}
function scrollActive() {
  void nextTick(() => list.value?.querySelector<HTMLElement>(`[data-i="${active.value}"]`)?.scrollIntoView({ block: 'nearest' }))
}
watch(q, () => (active.value = 0))

function onDocClick(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div ref="root" class="relative min-w-0 flex-1 md:w-60 md:flex-none">
    <button type="button" class="input flex items-center gap-2 text-left" :aria-expanded="open" aria-haspopup="listbox"
            :aria-label="label" @click="toggle" @keydown.down.prevent="!open && toggle()">
      <AppIcon :name="icon" :size="15" class="text-gray-400" />
      <span class="min-w-0 flex-1 truncate" :class="model ? '' : 'text-gray-500 dark:text-gray-400'">{{ model || placeholder }}</span>
      <span v-if="model" role="button" tabindex="0" class="-my-1 rounded-md p-0.5 muted hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
            :aria-label="`${label}-Filter entfernen`" @click.stop="model = ''" @keydown.enter.stop.prevent="model = ''">
        <AppIcon name="x" :size="14" />
      </span>
      <AppIcon v-else name="chevronDown" :size="16" class="text-gray-400 transition" :class="open ? 'rotate-180' : ''" />
    </button>

    <Transition enter-active-class="transition duration-100" enter-from-class="opacity-0 -translate-y-1"
                leave-active-class="transition duration-75" leave-to-class="opacity-0">
      <div v-if="open" class="card absolute right-0 z-40 mt-1 w-full min-w-64 p-1 shadow-xl">
        <div class="relative p-1">
          <AppIcon name="search" :size="14" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input ref="input" v-model="q" class="input !py-2 pl-9" :placeholder="`${label} suchen …`" autocomplete="off"
                 role="combobox" aria-expanded="true" :aria-label="`${label} suchen`"
                 @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="onEnter"
                 @keydown.esc.prevent="open = false" @keydown.tab="open = false" />
        </div>
        <div ref="list" class="max-h-72 overflow-y-auto" role="listbox" :aria-label="label">
          <button v-if="!q" type="button" role="option" :aria-selected="!model"
                  class="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm muted hover:bg-gray-50 dark:hover:bg-white/5"
                  @click="choose('')">
            {{ placeholder }}
          </button>
          <button v-for="(o, i) in filtered" :key="o.value" :data-i="i" type="button" role="option" :aria-selected="o.value === model"
                  class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm"
                  :class="i === active ? 'bg-brand-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'"
                  @mouseenter="active = i" @click="choose(o.value)">
            <span class="flex min-w-0 items-center gap-2">
              <AppIcon name="check" :size="14" class="text-brand-600" :class="o.value === model ? '' : 'invisible'" />
              <span class="truncate" :class="o.value === model ? 'font-semibold' : ''">{{ o.value }}</span>
            </span>
            <span class="shrink-0 text-xs tabular-nums muted">{{ o.count }}</span>
          </button>
          <p v-if="!filtered.length" class="px-3 py-4 text-center text-sm muted">Keine Treffer</p>
        </div>
      </div>
    </Transition>
  </div>
</template>
