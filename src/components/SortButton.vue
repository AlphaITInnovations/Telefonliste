<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import type { SortDir, SortKey } from '@/types'

const props = defineProps<{ label: string; column: SortKey; sortKey: SortKey; sortDir: SortDir }>()
defineEmits<{ sort: [key: SortKey] }>()
</script>

<template>
  <button type="button"
          class="group/sort -mx-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 uppercase tracking-wide transition hover:text-gray-900 dark:hover:text-gray-100"
          :class="props.sortKey === column ? 'text-brand-600 dark:text-brand-300' : ''"
          :title="`Nach ${label} sortieren`" @click="$emit('sort', column)">
    {{ label }}
    <AppIcon :name="sortKey !== column ? 'sort' : sortDir === 'asc' ? 'arrowUp' : 'arrowDown'" :size="13"
             :class="sortKey === column ? '' : 'opacity-0 group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60'" />
  </button>
</template>
