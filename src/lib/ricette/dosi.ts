/**
 * Ricalcolo delle dosi per le porzioni scelte (docs/riferimento/04-specifiche-funzionali.md §1).
 *
 * Q_target = Q_base × P_target / P_base, poi un arrotondamento «da cucina»
 * che dipende dal tipo di unità (`tipoUnita()` in src/fields/unita.ts):
 * - peso/volume: multipli di 5 sopra 100, interi sopra 10, un decimale sotto;
 * - cucchiai e conteggi: quarti (½ ¼ ¾) sotto 10, interi sopra.
 * Le dosi senza quantità («q.b.») non si toccano.
 */

import { etichettaUnita, tipoUnita, type TipoUnita } from '../../fields/unita'

export type IngredienteDose = {
  nome: string
  plurale?: string | null
}

export type RigaDose = {
  ingrediente: IngredienteDose
  quantita?: number | null
  unita?: string | null
  nota?: string | null
  facoltativo?: boolean | null
}

export function scala(quantita: number, porzioniBase: number, porzioni: number): number {
  if (!porzioniBase || porzioniBase <= 0) return quantita
  return (quantita * porzioni) / porzioniBase
}

export function arrotonda(quantita: number, tipo: TipoUnita): number {
  if (quantita <= 0) return 0
  if (tipo === 'peso' || tipo === 'volume') {
    if (quantita >= 100) return Math.round(quantita / 5) * 5
    if (quantita >= 10) return Math.round(quantita)
    return Math.max(Math.round(quantita * 10) / 10, 0.1)
  }
  if (quantita >= 10) return Math.round(quantita)
  return Math.max(Math.round(quantita * 4) / 4, 0.25)
}

const FRAZIONI: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' }

/** «1 ½», «¼», «2,5», «150». */
export function formattaNumero(quantita: number, tipo: TipoUnita): string {
  const intero = Math.floor(quantita)
  const resto = Math.round((quantita - intero) * 100) / 100
  if ((tipo === 'cucchiaio' || tipo === 'conteggio') && FRAZIONI[resto]) {
    return intero > 0 ? `${intero} ${FRAZIONI[resto]}` : FRAZIONI[resto]
  }
  return quantita.toLocaleString('it-IT', { maximumFractionDigits: 1 })
}

export type DoseCalcolata = {
  /** «150 g», «2 cucchiai», «3»; vuoto per le dosi senza quantità. */
  quantita: string
  /** Nome accordato: «uova» per 2 uova senza unità. */
  nome: string
  nota: string
  facoltativo: boolean
}

export function calcolaDose(riga: RigaDose, porzioniBase: number, porzioni: number): DoseCalcolata {
  const nota = riga.nota?.trim() ?? ''
  const base = {
    nome: riga.ingrediente.nome,
    nota,
    facoltativo: Boolean(riga.facoltativo),
  }
  if (riga.quantita == null) return { ...base, quantita: '' }

  const tipo = tipoUnita(riga.unita)
  const valore = arrotonda(scala(riga.quantita, porzioniBase, porzioni), tipo)
  const numero = formattaNumero(valore, tipo)
  const unita = etichettaUnita(riga.unita, valore)
  const plurale = !riga.unita && valore > 1 && riga.ingrediente.plurale

  return {
    ...base,
    quantita: unita ? `${numero} ${unita}` : numero,
    nome: plurale || riga.ingrediente.nome,
  }
}

/** Testo unico per JSON-LD e lettori di schermo: «150 g farina», «sale q.b.». */
export function testoDose(dose: DoseCalcolata): string {
  const parti = [dose.quantita, dose.nome, dose.nota].filter(Boolean)
  return parti.join(' ') + (dose.facoltativo ? ' (facoltativo)' : '')
}

/** Passo del selettore porzioni: 1 per le ricette da 1-12 porzioni, 5 per «40 biscotti». */
export function passoPorzioni(porzioniBase: number): number {
  return porzioniBase > 12 ? 5 : 1
}
