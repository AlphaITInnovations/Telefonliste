<script setup lang="ts">
import type { Employee } from '@/api/directus'
import AppIcon from '@/components/AppIcon.vue'
import TeamsIcon from '@/components/TeamsIcon.vue'
import { teamsChatHref, telHref } from '@/lib/format'

defineProps<{ employee: Employee; initials: string; color: string }>()
const emit = defineEmits<{ copy: [text: string] }>()
</script>

<template>
  <article class="card group flex flex-col p-5 transition hover:shadow-md">
    <div class="flex items-start gap-3.5">
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white" :class="color">
        {{ initials || '?' }}
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="truncate font-semibold">{{ employee.firstName }} {{ employee.lastName }}</h3>
        <p class="truncate text-sm muted">{{ employee.jobTitle || '—' }}</p>
      </div>
      <a v-if="employee.email" :href="teamsChatHref(employee.email)" target="_blank" rel="noopener"
         class="rounded-lg p-1.5 transition hover:bg-[#5059C9]/10"
         :title="`Teams-Chat mit ${employee.firstName} ${employee.lastName}`" :aria-label="`Teams-Chat mit ${employee.firstName} ${employee.lastName}`">
        <TeamsIcon :size="18" />
      </a>
    </div>

    <div v-if="employee.company || employee.location" class="mt-3 flex flex-wrap gap-1.5">
      <span v-if="employee.company" class="chip bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-300">
        <AppIcon name="building" :size="12" />{{ employee.company }}
      </span>
      <span v-if="employee.location" class="chip bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10">
        <AppIcon name="pin" :size="12" />{{ employee.location }}
      </span>
    </div>

    <div class="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm dark:border-white/[0.06]">
      <div v-if="employee.phone" class="flex items-center justify-between gap-2">
        <a :href="telHref(employee.phone)" class="flex items-center gap-2 tabular-nums hover:text-brand-600"><AppIcon name="phone" :size="14" class="text-gray-400" />{{ employee.phone }}</a>
        <button class="muted opacity-0 transition hover:text-brand-600 focus:opacity-100 group-hover:opacity-100" aria-label="Nummer kopieren" @click="emit('copy', employee.phone)"><AppIcon name="copy" :size="14" /></button>
      </div>
      <div v-if="employee.mobile" class="flex items-center justify-between gap-2">
        <a :href="telHref(employee.mobile)" class="flex items-center gap-2 tabular-nums hover:text-brand-600"><AppIcon name="smartphone" :size="14" class="text-gray-400" />{{ employee.mobile }}</a>
        <button class="muted opacity-0 transition hover:text-brand-600 focus:opacity-100 group-hover:opacity-100" aria-label="Nummer kopieren" @click="emit('copy', employee.mobile)"><AppIcon name="copy" :size="14" /></button>
      </div>
      <div v-if="employee.email" class="flex items-center justify-between gap-2">
        <a :href="`mailto:${employee.email}`" class="flex min-w-0 items-center gap-2 hover:text-brand-600"><AppIcon name="mail" :size="14" class="text-gray-400" /><span class="truncate">{{ employee.email }}</span></a>
        <button class="muted opacity-0 transition hover:text-brand-600 focus:opacity-100 group-hover:opacity-100" aria-label="E-Mail kopieren" @click="emit('copy', employee.email)"><AppIcon name="copy" :size="14" /></button>
      </div>
      <p v-if="!employee.phone && !employee.mobile && !employee.email" class="text-xs muted">Keine Kontaktdaten hinterlegt</p>
    </div>
  </article>
</template>
