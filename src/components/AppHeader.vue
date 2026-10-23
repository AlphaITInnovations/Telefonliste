<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { useTheme } from '@/composables/ui'

const { dark, toggle } = useTheme()
</script>

<template>
  <!-- Markenleiste im Stil der Alpha-Sidebar (Türkis, abgerundet, schwebend) -->
  <header class="sticky top-3 z-30 mx-3 mt-3 flex h-16 items-center justify-between gap-4 rounded-2xl bg-brand-500 px-4 text-white shadow-lg md:px-5">
    <a href="/" class="flex min-w-0 items-center gap-2.5">
      <img src="/logo.png" alt="" class="h-8 w-auto brightness-0 invert" draggable="false" />
      <span class="truncate text-[15px] font-semibold leading-tight">Telefonliste</span>
    </a>
    <button class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/90 transition hover:bg-white/15"
            :aria-label="dark ? 'Helles Design' : 'Dunkles Design'" @click="toggle">
      <AppIcon :name="dark ? 'sun' : 'moon'" />
      <span class="hidden sm:inline">{{ dark ? 'Helles Design' : 'Dunkles Design' }}</span>
    </button>
  </header>
</template>
