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
  { value: 'cucchiaio', label: 'cucchiaio', tipo: 'cucchiaio' },
  { value: 'cucchiaino', label: 'cucchiaino', tipo: 'cucchiaio' },
  { value: 'tazza', label: 'tazza', tipo: 'conteggio' },
  { value: 'bicchiere', label: 'bicchiere', tipo: 'conteggio' },
  { value: 'pezzo', label: 'pezzo', tipo: 'conteggio' },
  { value: 'spicchio', label: 'spicchio', tipo: 'conteggio' },
  { value: 'fetta', label: 'fetta', tipo: 'conteggio' },
  { value: 'foglia', label: 'foglia', tipo: 'conteggio' },
  { value: 'rametto', label: 'rametto', tipo: 'conteggio' },
  { value: 'mazzetto', label: 'mazzetto', tipo: 'conteggio' },
  { value: 'bustina', label: 'bustina', tipo: 'conteggio' },
  { value: 'confezione', label: 'confezione', tipo: 'conteggio' },
  { value: 'vasetto', label: 'vasetto', tipo: 'conteggio' },
  { value: 'noce', label: 'noce', tipo: 'conteggio' },
  { value: 'pizzico', label: 'pizzico', tipo: 'conteggio' },
] as const

export type Unita = (typeof UNITA)[number]['value']
export type TipoUnita = (typeof UNITA)[number]['tipo']

export const unitaOptions = UNITA.map(({ value, label }) => ({ value, label }))

export function tipoUnita(unita: string | null | undefined): TipoUnita {
  return UNITA.find((u) => u.value === unita)?.tipo ?? 'conteggio'
}
