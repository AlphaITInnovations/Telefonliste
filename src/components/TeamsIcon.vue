<script setup lang="ts">
// Vereinfachtes Microsoft-Teams-Symbol (Kachel mit „T" + Person) in den Teams-Farben.
withDefaults(defineProps<{ size?: number }>(), { size: 18 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true" class="shrink-0">
    <circle cx="18.2" cy="6.2" r="2.6" fill="#7B83EB" />
    <path d="M14.5 10h7a1.5 1.5 0 0 1 1.5 1.5v4.2a3.8 3.8 0 0 1-3.8 3.8h-.4a3.8 3.8 0 0 1-3.8-3.8V10z" fill="#7B83EB" />
    <circle cx="11.5" cy="5" r="3.2" fill="#5059C9" />
    <path d="M6 10h11v6.5a5.5 5.5 0 0 1-11 0z" fill="#5059C9" />
    <rect x="1" y="7" width="11" height="11" rx="1.8" fill="#4B53BC" />
    <path d="M3.8 10h5.4M6.5 10v5.5" stroke="#fff" stroke-width="1.7" stroke-linecap="round" />
  </svg>
</template>
