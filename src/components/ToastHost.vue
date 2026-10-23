<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { useToast } from '@/composables/ui'

const { toasts, dismiss } = useToast()

const TOAST_STYLE = {
  success: { icon: 'check', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  error: { icon: 'alert', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
} as const
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
    <TransitionGroup enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-2 opacity-0"
                     leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-x-4">
      <div v-for="t in toasts" :key="t.id" class="card flex items-start gap-3 p-3.5 shadow-lg" role="status">
        <span class="mt-0.5 grid h-7 w-7 place-items-center rounded-full" :class="TOAST_STYLE[t.kind].cls">
          <AppIcon :name="TOAST_STYLE[t.kind].icon" :size="15" :stroke="2.5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold">{{ t.title }}</p>
          <p v-if="t.message" class="mt-0.5 text-sm muted break-words">{{ t.message }}</p>
        </div>
        <button class="btn-ghost btn-sm -mr-1 !p-1" aria-label="Schließen" @click="dismiss(t.id)">
          <AppIcon name="x" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
