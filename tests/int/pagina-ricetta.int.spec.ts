import { describe, expect, it } from 'vitest'

import { arrotonda, calcolaDose, formattaNumero, testoDose } from '@/lib/ricette/dosi'
import { formattaCountdown, isoDurata, secondiTimer, trovaTempi } from '@/lib/ricette/tempi'

const farina = { nome: 'farina 00' }
const uovo = { nome: 'uovo', plurale: 'uova' }

describe('dosi', () => {
  it('arrotonda come in cucina', () => {
    expect(arrotonda(333.3, 'peso')).toBe(335)
    expect(arrotonda(37.4, 'peso')).toBe(37)
    expect(arrotonda(2.46, 'volume')).toBe(2.5)
    expect(arrotonda(1.4, 'conteggio')).toBe(1.5)
    expect(arrotonda(0.1, 'cucchiaio')).toBe(0.25)
    expect(arrotonda(12.4, 'conteggio')).toBe(12)
  })

  it('scrive frazioni leggibili per cucchiai e conteggi', () => {
    expect(formattaNumero(0.5, 'cucchiaio')).toBe('½')
    expect(formattaNumero(1.75, 'conteggio')).toBe('1 ¾')
    expect(formattaNumero(2.5, 'peso')).toBe('2,5')
  })

  it('ricalcola le porzioni e accorda unità e nome', () => {
    expect(calcolaDose({ ingrediente: farina, quantita: 250, unita: 'g' }, 4, 6).quantita).toBe(
      '375 g',
    )
    const cucchiai = calcolaDose({ ingrediente: farina, quantita: 1, unita: 'cucchiaio' }, 2, 4)
    expect(cucchiai.quantita).toBe('2 cucchiai')
    const uova = calcolaDose({ ingrediente: uovo, quantita: 2 }, 4, 4)
    expect(uova).toMatchObject({ quantita: '2', nome: 'uova' })
    expect(calcolaDose({ ingrediente: uovo, quantita: 2 }, 4, 2).nome).toBe('uovo')
  })

  it('lascia stare le dosi senza numero', () => {
    const sale = calcolaDose({ ingrediente: { nome: 'sale' }, nota: 'q.b.' }, 4, 8)
    expect(sale).toMatchObject({ quantita: '', nota: 'q.b.' })
    expect(testoDose(sale)).toBe('sale q.b.')
  })
})

describe('tempi', () => {
  it('trova i tempi nel testo', () => {
    const testo = 'Cuoci per 10 minuti, poi inforna 30-35 min e lascia riposare un’ora.'
    const tempi = trovaTempi(testo)
    expect(tempi.map((t) => [t.testo, t.secondi, t.secondiMax])).toEqual([
      ['10 minuti', 600, undefined],
      ['30-35 min', 1800, 2100],
      ['un’ora', 3600, undefined],
    ])
    expect(testo.slice(tempi[1].inizio, tempi[1].fine)).toBe('30-35 min')
  })

  it('riconosce secondi, ore, intervalli con «da… a» e il quarto d’ora', () => {
    const t = trovaTempi('Frulla 45 secondi. Lievita da 2 a 3 ore. Riposa un quarto d’ora, poi 1,5 h.')
    expect(t.map((x) => x.testo)).toEqual(['45 secondi', '2 a 3 ore', 'un quarto d’ora', '1,5 h'])
    expect(t.map((x) => x.secondi)).toEqual([45, 7200, 900, 5400])
  })

  it('ignora numeri senza unità e parole che iniziano come un’unità', () => {
    expect(trovaTempi('Forno a 180 °C, 3 minestre, 2 hamburger')).toEqual([])
  })

  it('converte i timer espliciti e le durate', () => {
    expect(secondiTimer({ durata: 30, durataMax: 35, unita: 'minuti' })).toEqual({
      secondi: 1800,
      secondiMax: 2100,
    })
    expect(formattaCountdown(3725)).toBe('1:02:05')
    expect(formattaCountdown(59.2)).toBe('1:00')
    expect(isoDurata(90)).toBe('PT1H30M')
    expect(isoDurata(0)).toBeUndefined()
  })
})

describe('intervalli', () => {
  it('scrive gli intervalli in forma compatta', async () => {
    const { formattaIntervallo } = await import('@/lib/ricette/tempi')
    expect(formattaIntervallo(2100, 2400)).toBe('35–40 min')
    expect(formattaIntervallo(3600, 5400)).toBe('1 h–1 h 30 min')
    expect(formattaIntervallo(600)).toBe('10 min')
  })
})
