'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { avviaAllarme, fermaAllarme, preparaAudio } from './allarme'

/**
 * Stato condiviso della pagina ricetta: porzioni scelte e timer attivi.
 * I timer si basano sull'ora di fine (Date.now), così restano esatti anche se
 * il browser rallenta la pagina in background.
 */

export type Timer = {
  id: string
  etichetta: string
  totale: number
  /** Secondi rimasti quando il timer è in pausa o scaduto. */
  rimasti: number
  /** Ora di fine in ms quando il timer è attivo. */
  fineAlle: number | null
  stato: 'attivo' | 'pausa' | 'scaduto'
}

type CucinaContext = {
  porzioniBase: number
  porzioni: number
  setPorzioni: (n: number) => void
  timer: Timer[]
  ora: number
  avvia: (id: string, etichetta: string, secondi: number) => void
  pausa: (id: string) => void
  riprendi: (id: string) => void
  aggiungi: (id: string, secondi: number) => void
  azzera: (id: string) => void
  rimuovi: (id: string) => void
}

const Ctx = createContext<CucinaContext | null>(null)

export function useCucina(): CucinaContext {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCucina va usato dentro <CucinaProvider>')
  return ctx
}

export function secondiRimasti(t: Timer, ora: number): number {
  return t.stato === 'attivo' && t.fineAlle ? Math.max(0, (t.fineAlle - ora) / 1000) : t.rimasti
}

export function CucinaProvider({
  porzioniBase,
  children,
}: {
  porzioniBase: number
  children: React.ReactNode
}) {
  const [porzioni, setPorzioniState] = useState(porzioniBase)
  const [timer, setTimer] = useState<Timer[]>([])
  const [ora, setOra] = useState(() => Date.now())
  const titoloOriginale = useRef<string | null>(null)

  const setPorzioni = useCallback((n: number) => {
    setPorzioniState(Math.min(999, Math.max(1, Math.round(n))))
  }, [])

  const aggiorna = useCallback((id: string, fn: (t: Timer) => Timer) => {
    setTimer((lista) => lista.map((t) => (t.id === id ? fn(t) : t)))
  }, [])

  const avvia = useCallback((id: string, etichetta: string, secondi: number) => {
    preparaAudio()
    const adesso = Date.now()
    setOra(adesso)
    setTimer((lista) => {
      const nuovo: Timer = {
        id,
        etichetta,
        totale: secondi,
        rimasti: secondi,
        fineAlle: adesso + secondi * 1000,
        stato: 'attivo',
      }
      return lista.some((t) => t.id === id)
        ? lista.map((t) => (t.id === id ? nuovo : t))
        : [...lista, nuovo]
    })
  }, [])

  const pausa = useCallback(
    (id: string) =>
      aggiorna(id, (t) =>
        t.stato === 'attivo'
          ? { ...t, stato: 'pausa', rimasti: secondiRimasti(t, Date.now()), fineAlle: null }
          : t,
      ),
    [aggiorna],
  )

  const riprendi = useCallback(
    (id: string) => {
      preparaAudio()
      aggiorna(id, (t) =>
        t.stato === 'pausa' ? { ...t, stato: 'attivo', fineAlle: Date.now() + t.rimasti * 1000 } : t,
      )
    },
    [aggiorna],
  )

  const aggiungi = useCallback(
    (id: string, secondi: number) => {
      preparaAudio()
      aggiorna(id, (t) => {
        if (t.stato === 'attivo' && t.fineAlle) return { ...t, fineAlle: t.fineAlle + secondi * 1000 }
        if (t.stato === 'pausa') return { ...t, rimasti: t.rimasti + secondi }
        // Scaduto: riparte con il minuto in più.
        return { ...t, stato: 'attivo', rimasti: secondi, fineAlle: Date.now() + secondi * 1000 }
      })
    },
    [aggiorna],
  )

  const azzera = useCallback(
    (id: string) =>
      aggiorna(id, (t) => ({ ...t, stato: 'pausa', rimasti: t.totale, fineAlle: null })),
    [aggiorna],
  )

  const rimuovi = useCallback((id: string) => {
    setTimer((lista) => lista.filter((t) => t.id !== id))
  }, [])

  const attivi = timer.some((t) => t.stato === 'attivo')
  const scaduti = timer.some((t) => t.stato === 'scaduto')

  // Battito: aggiorna l'ora e segna i timer finiti.
  useEffect(() => {
    if (!attivi) return
    const tick = () => {
      const adesso = Date.now()
      setOra(adesso)
      setTimer((lista) =>
        lista.some((t) => t.stato === 'attivo' && t.fineAlle && t.fineAlle <= adesso)
          ? lista.map((t) =>
              t.stato === 'attivo' && t.fineAlle && t.fineAlle <= adesso
                ? { ...t, stato: 'scaduto', rimasti: 0, fineAlle: null }
                : t,
            )
          : lista,
      )
    }
    const intervallo = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(intervallo)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [attivi])

  // Allarme finché c'è un timer scaduto non ancora chiuso.
  useEffect(() => {
    if (!scaduti) return
    avviaAllarme()
    if (titoloOriginale.current === null) titoloOriginale.current = document.title
    document.title = `⏰ Tempo! · ${titoloOriginale.current}`
    return () => {
      fermaAllarme()
      if (titoloOriginale.current !== null) document.title = titoloOriginale.current
      titoloOriginale.current = null
    }
  }, [scaduti])

  const valore = useMemo<CucinaContext>(
    () => ({
      porzioniBase,
      porzioni,
      setPorzioni,
      timer,
      ora,
      avvia,
      pausa,
      riprendi,
      aggiungi,
      azzera,
      rimuovi,
    }),
    [porzioniBase, porzioni, setPorzioni, timer, ora, avvia, pausa, riprendi, aggiungi, azzera, rimuovi],
  )

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>
}
