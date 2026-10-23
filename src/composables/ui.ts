import { reactive, ref } from 'vue'

// ── Theme (wie AlphaContactSync: .dark am <html>, gemerkt im localStorage) ─────
const dark = ref(false)

export function initTheme() {
  let stored: string | null = null
  try {
    stored = localStorage.getItem('theme')
  } catch {
    /* privater Modus */
  }
  dark.value = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', dark.value)
}

export function useTheme() {
  function toggle() {
    dark.value = !dark.value
    document.documentElement.classList.toggle('dark', dark.value)
    try {
      localStorage.setItem('theme', dark.value ? 'dark' : 'light')
    } catch {
      /* egal */
    }
  }
  return { dark, toggle }
}

// ── Toasts ──────────────────────────────────────────────────────────────────
export interface Toast {
  id: number
  kind: 'success' | 'error'
  title: string
  message?: string
}

const toasts = reactive<Toast[]>([])
let toastSeq = 0

export function useToast() {
  function push(kind: Toast['kind'], title: string, message?: string, timeout = kind === 'error' ? 7000 : 3000) {
    const id = ++toastSeq
    toasts.push({ id, kind, title, message })
    window.setTimeout(() => dismiss(id), timeout)
  }
  function dismiss(id: number) {
    const i = toasts.findIndex((t) => t.id === id)
    if (i >= 0) toasts.splice(i, 1)
  }
  return {
    toasts,
    dismiss,
    success: (t: string, m?: string) => push('success', t, m),
    error: (t: string, m?: string) => push('error', t, m),
  }
}
