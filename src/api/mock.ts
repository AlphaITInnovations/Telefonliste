// Beispieldaten für VITE_USE_MOCK=true – Struktur entspricht den Default-Feldnamen aus .env.example
const rows: [string, string, string, string, string, string, string][] = [
  ['Anna', 'Becker', 'Geschäftsführerin', 'Alpha IT Innovations', 'Köln', '+49 221 123450', '+49 171 1234501'],
  ['Jonas', 'Weber', 'Teamlead Entwicklung', 'Alpha IT Innovations', 'Köln', '+49 221 123451', '+49 171 1234502'],
  ['Leonie', 'Schmitz', 'Frontend-Entwicklerin', 'Alpha IT Innovations', 'Berlin', '+49 30 987650', ''],
  ['Mehmet', 'Yılmaz', 'Backend-Entwickler', 'Alpha IT Innovations', 'Berlin', '+49 30 987651', '+49 160 2345678'],
  ['Sophie', 'Müller', 'HR Business Partner', 'Alpha Personal GmbH', 'Köln', '+49 221 123452', ''],
  ['Lukas', 'Hoffmann', 'Account Manager', 'Alpha Personal GmbH', 'München', '+49 89 555100', '+49 151 3456789'],
  ['Marie', 'Wagner', 'Buchhalterin', 'Alpha Personal GmbH', 'Köln', '+49 221 123453', ''],
  ['Felix', 'Klein', 'Systemadministrator', 'Alpha IT Innovations', 'Köln', '+49 221 123454', '+49 172 4567890'],
  ['Emma', 'Fischer', 'Marketing Managerin', 'Alpha Personal GmbH', 'München', '+49 89 555101', ''],
  ['Paul', 'Schulz', 'Niederlassungsleiter', 'Alpha Personal GmbH', 'München', '+49 89 555102', '+49 170 5678901'],
  ['Hannah', 'Koch', 'Teamassistenz', 'Alpha Personal GmbH', 'Berlin', '+49 30 987652', ''],
  ['Noah', 'Richter', 'Werkstudent IT', 'Alpha IT Innovations', 'Köln', '', '+49 176 6789012'],
  ['Mia', 'Wolf', 'Controllerin', 'Alpha Personal GmbH', 'Köln', '+49 221 123455', ''],
  ['Elias', 'Neumann', 'Disponent', 'Alpha Personal GmbH', 'Berlin', '+49 30 987653', '+49 175 7890123'],
  ['Lea', 'Schwarz', 'UX Designerin', 'Alpha IT Innovations', 'Berlin', '+49 30 987654', ''],
  ['Ben', 'Zimmermann', 'Regionalleiter', 'Alpha Personal GmbH', 'Köln', '+49 221 123456', ''],
]

const mail = (first: string, last: string) =>
  `${first}.${last}`.toLowerCase().replace(/ü/g, 'ue').replace(/ı/g, 'i') + '@alpha-it-innovations.org'

export const mockEmployees = rows.map(([first, last, jobTitle, company, location, phone, mobile], i) => ({
  id: i + 1,
  first_name: first,
  last_name: last,
  email: mail(first, last),
  job_title: jobTitle,
  phone,
  mobile,
  company: { name: company },
  location: { name: location },
}))
