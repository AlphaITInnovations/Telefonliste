<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'

withDefaults(defineProps<{ icon?: string; title: string; text?: string }>(), { icon: 'search' })
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-14 text-center">
    <span class="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
      <AppIcon :name="icon" :size="22" />
    </span>
    <h3 class="mt-4 text-sm font-semibold">{{ title }}</h3>
    <p v-if="text" class="mt-1 max-w-sm text-sm muted break-words">{{ text }}</p>
    <div v-if="$slots.default" class="mt-5"><slot /></div>
  </div>
</template>
