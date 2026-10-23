const env = import.meta.env

const list = (v: string | undefined, fallback: string) =>
  (v ?? fallback).split(',').map((s) => s.trim()).filter(Boolean)

export const config = {
  useMock: env.VITE_USE_MOCK === 'true',
  collection: env.VITE_COLLECTION || 'mitarbeitende',
  statusField: env.VITE_STATUS_FIELD ?? 'status',
  statusValues: list(env.VITE_STATUS_VALUES, 'aktiv'),
  exitDateField: env.VITE_EXIT_DATE_FIELD ?? 'exit_date',
  fields: {
    firstName: env.VITE_FIELD_FIRST_NAME || 'first_name',
    lastName: env.VITE_FIELD_LAST_NAME || 'last_name',
    email: env.VITE_FIELD_EMAIL || 'email',
    // „Position" in der Liste = AlphaCore job_title, NICHT AlphaCore position (Rollen-Kategorie)
    jobTitle: env.VITE_FIELD_JOB_TITLE || 'job_title',
    phone: env.VITE_FIELD_PHONE || 'phone',
    mobile: env.VITE_FIELD_MOBILE || 'mobile',
    company: env.VITE_FIELD_COMPANY ?? 'company.name',
    location: env.VITE_FIELD_LOCATION ?? 'location.name',
  },
}
