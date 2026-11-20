/**
 * Tempi della ricetta: riconoscimento dei timer nel testo degli step,
 * formattazione e durate ISO 8601 per il JSON-LD.
 */

export type TempoTrovato = {
  /** Posizione e testo originale nel paragrafo. */
  inizio: number
  fine: number
  testo: string
  /** Durata del conto alla rovescia, in secondi (il limite basso degli intervalli). */
  secondi: number
  /** Limite alto per gli intervalli «30-35 minuti». */
  secondiMax?: number
}

const NUMERO = String.raw`\d+(?:[.,]\d+)?`
const UNITA_TEMPO = String.raw`secondi|secondo|sec|minuti|minuto|min|ore|ora|h`

// «10 minuti», «30-35 min», «da 2 a 3 ore», «45 sec», «1,5 ore», «mezz'ora», «un'ora», «un quarto d'ora»
const PATTERN = new RegExp(
  String.raw`(?:(?<da>da\s+)?(?<n1>${NUMERO})(?:\s*(?:-|–|a)\s*(?<n2>${NUMERO}))?\s*(?<u>${UNITA_TEMPO})\b\.?)` +
    String.raw`|(?<mezzora>mezz['’]\s?ora)|(?<unora>un['’]\s?ora)|(?<quarto>un\s+quarto\s+d['’]\s?ora)`,
  'gi',
)

function secondiPerUnita(unita: string): number {
  const u = unita.toLowerCase()
  if (u.startsWith('s')) return 1
  if (u.startsWith('m')) return 60
  return 3600
}

function numero(n: string): number {
  return Number(n.replace(',', '.'))
}

export function trovaTempi(testo: string): TempoTrovato[] {
  const risultati: TempoTrovato[] = []
  for (const m of testo.matchAll(PATTERN)) {
    const g = m.groups ?? {}
    const inizio = m.index ?? 0
    let secondi: number
    let secondiMax: number | undefined
    if (g.mezzora) secondi = 1800
    else if (g.unora) secondi = 3600
    else if (g.quarto) secondi = 900
    else {
      const k = secondiPerUnita(g.u)
      secondi = Math.round(numero(g.n1) * k)
      if (g.n2) secondiMax = Math.round(numero(g.n2) * k)
      // «da 2 a 3 ore»: il «da» resta testo, il pulsante parte dal numero.
    }
    if (!secondi) continue
    const inizioPulsante = g.da ? inizio + g.da.length : inizio
    const testoTrovato = m[0].slice(inizioPulsante - inizio).replace(/\.$/, '')
    risultati.push({
      inizio: inizioPulsante,
      fine: inizioPulsante + testoTrovato.length,
      testo: testoTrovato,
      secondi,
      ...(secondiMax && secondiMax > secondi ? { secondiMax } : {}),
    })
  }
  return risultati
}

export type TimerCampo = {
  etichetta?: string | null
  durata: number
  durataMax?: number | null
  unita: 'secondi' | 'minuti' | 'ore'
}

export function secondiTimer(t: TimerCampo): { secondi: number; secondiMax?: number } {
  const k = t.unita === 'secondi' ? 1 : t.unita === 'ore' ? 3600 : 60
  const secondi = Math.round(t.durata * k)
  const secondiMax = t.durataMax ? Math.round(t.durataMax * k) : undefined
  return secondiMax && secondiMax > secondi ? { secondi, secondiMax } : { secondi }
}

/** «1 h 20 min», «45 min», «30 s». Per i minuti della scheda ricetta. */
export function formattaMinuti(minuti: number): string {
  if (minuti < 60) return `${minuti} min`
  const h = Math.floor(minuti / 60)
  const m = minuti % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

/** Etichetta breve di una durata in secondi: «10 min», «1 h 30 min», «45 s». */
export function formattaDurata(secondi: number): string {
  if (secondi < 60) return `${secondi} s`
  if (secondi % 60 === 0) return formattaMinuti(secondi / 60)
  const m = Math.floor(secondi / 60)
  return `${m} min ${secondi % 60} s`
}

/** Intervallo compatto: «35–40 min», altrimenti «1 h–1 h 30 min». */
export function formattaIntervallo(secondi: number, secondiMax?: number): string {
  if (!secondiMax) return formattaDurata(secondi)
  if (secondi % 60 === 0 && secondiMax % 60 === 0 && secondiMax < 3600) {
    return `${secondi / 60}–${secondiMax / 60} min`
  }
  return `${formattaDurata(secondi)}–${formattaDurata(secondiMax)}`
}

/** Conto alla rovescia: «9:59», «1:04:30». */
export function formattaCountdown(secondi: number): string {
  const s = Math.max(0, Math.ceil(secondi))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** Durata ISO 8601 per Schema.org: 90 → «PT1H30M». */
export function isoDurata(minuti: number | null | undefined): string | undefined {
  if (minuti == null || minuti <= 0) return undefined
  const h = Math.floor(minuti / 60)
  const m = minuti % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}`
}
