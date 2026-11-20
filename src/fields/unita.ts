/**
 * Unità di misura delle dosi.
 *
 * L'elenco è chiuso perché il ricalcolo delle porzioni arrotonda in modo diverso
 * a seconda dell'unità (vedi docs/riferimento/04-specifiche-funzionali.md §1):
 * - `peso`/`volume`: interi, multipli di 5 sopra i 100;
 * - `cucchiaio`/`conteggio`: un decimale o frazioni leggibili (½, ¼).
 *
 * Nessuna unità = conteggio del solo ingrediente ("2 uova").
 */
export const UNITA = [
  { value: 'g', label: 'g', tipo: 'peso' },
  { value: 'kg', label: 'kg', tipo: 'peso' },
  { value: 'ml', label: 'ml', tipo: 'volume' },
  { value: 'cl', label: 'cl', tipo: 'volume' },
  { value: 'l', label: 'l', tipo: 'volume' },
  { value: 'cucchiaio', label: 'cucchiaio', plurale: 'cucchiai', tipo: 'cucchiaio' },
  { value: 'cucchiaino', label: 'cucchiaino', plurale: 'cucchiaini', tipo: 'cucchiaio' },
  { value: 'tazza', label: 'tazza', plurale: 'tazze', tipo: 'conteggio' },
  { value: 'bicchiere', label: 'bicchiere', plurale: 'bicchieri', tipo: 'conteggio' },
  { value: 'pezzo', label: 'pezzo', plurale: 'pezzi', tipo: 'conteggio' },
  { value: 'spicchio', label: 'spicchio', plurale: 'spicchi', tipo: 'conteggio' },
  { value: 'fetta', label: 'fetta', plurale: 'fette', tipo: 'conteggio' },
  { value: 'foglia', label: 'foglia', plurale: 'foglie', tipo: 'conteggio' },
  { value: 'rametto', label: 'rametto', plurale: 'rametti', tipo: 'conteggio' },
  { value: 'mazzetto', label: 'mazzetto', plurale: 'mazzetti', tipo: 'conteggio' },
  { value: 'bustina', label: 'bustina', plurale: 'bustine', tipo: 'conteggio' },
  { value: 'confezione', label: 'confezione', plurale: 'confezioni', tipo: 'conteggio' },
  { value: 'vasetto', label: 'vasetto', plurale: 'vasetti', tipo: 'conteggio' },
  { value: 'noce', label: 'noce', plurale: 'noci', tipo: 'conteggio' },
  { value: 'pizzico', label: 'pizzico', plurale: 'pizzichi', tipo: 'conteggio' },
] as const

export type Unita = (typeof UNITA)[number]['value']
export type TipoUnita = (typeof UNITA)[number]['tipo']

export const unitaOptions = UNITA.map(({ value, label }) => ({ value, label }))

/** Etichetta dell'unità accordata alla quantità: «1 cucchiaio», «2 cucchiai», «200 g». */
export function etichettaUnita(unita: string | null | undefined, quantita: number): string {
  const u = UNITA.find((x) => x.value === unita)
  if (!u) return ''
  return quantita > 1 && 'plurale' in u ? u.plurale : u.label
}

export function tipoUnita(unita: string | null | undefined): TipoUnita {
  return UNITA.find((u) => u.value === unita)?.tipo ?? 'conteggio'
}
