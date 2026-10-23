import type { Employee } from '@/api/directus'

export interface Row extends Employee { _key: string; _digits: string; _initials: string; _color: string }

export type SortKey = 'name' | 'jobTitle' | 'company' | 'location' | 'phone'
export type SortDir = 'asc' | 'desc'
