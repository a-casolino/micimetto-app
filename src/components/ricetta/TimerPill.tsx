'use client'

import { formattaCountdown } from '@/lib/ricette/tempi'

import { secondiRimasti, useCucina } from './CucinaProvider'

type Props = {
  id: string
  /** Testo mostrato prima dell'avvio: «10 minuti», «30-35 min». */
  testo: string
  /** Nome del timer nel riquadro fluttuante: «Step 3 · 10 minuti». */
  etichetta: string
  secondi: number
}

/** Pulsante che avvia un timer; mentre gira mostra il conto alla rovescia e mette in pausa. */
export function TimerPill({ id, testo, etichetta, secondi }: Props) {
  const { timer, ora, avvia, pausa, riprendi } = useCucina()
  const t = timer.find((x) => x.id === id)

  if (!t) {
    return (
      <button
        type="button"
        className="mcm-timer-pill"
        onClick={() => avvia(id, etichetta, secondi)}
        aria-label={`Avvia timer: ${testo}`}
      >
        <span aria-hidden="true">⏱</span> {testo}
      </button>
    )
  }

  const rimasti = formattaCountdown(secondiRimasti(t, ora))
  if (t.stato === 'scaduto') {
    return (
      <button
        type="button"
        className="mcm-timer-pill is-scaduto"
        onClick={() => avvia(id, etichetta, secondi)}
        aria-label={`Tempo scaduto: ${testo}. Riavvia`}
      >
        <span aria-hidden="true">⏰</span> {testo} · finito
      </button>
    )
  }
  return (
    <button
      type="button"
      className={`mcm-timer-pill is-${t.stato}`}
      onClick={() => (t.stato === 'attivo' ? pausa(id) : riprendi(id))}
      aria-label={`${testo}: ${rimasti} rimasti. ${t.stato === 'attivo' ? 'Metti in pausa' : 'Riprendi'}`}
    >
      <span aria-hidden="true">{t.stato === 'attivo' ? '⏱' : '⏸'}</span>{' '}
      <span className="mcm-num">{rimasti}</span>
    </button>
  )
}
