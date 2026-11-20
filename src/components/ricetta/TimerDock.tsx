'use client'

import { formattaCountdown } from '@/lib/ricette/tempi'

import { secondiRimasti, useCucina } from './CucinaProvider'

/** Riquadro fluttuante con tutti i timer, visibile mentre si scorre la ricetta. */
export function TimerDock() {
  const { timer, ora, pausa, riprendi, aggiungi, azzera, rimuovi } = useCucina()
  if (timer.length === 0) return null

  return (
    <section className="mcm-dock" aria-label="Timer">
      <ul>
        {timer.map((t) => {
          const rimasti = secondiRimasti(t, ora)
          const progresso = t.totale ? 1 - rimasti / t.totale : 1
          return (
            <li key={t.id} className={`mcm-dock__timer is-${t.stato}`}>
              <div className="mcm-dock__testa">
                <span className="mcm-dock__etichetta">{t.etichetta}</span>
                <span className="mcm-dock__tempo mcm-num" role="timer" aria-live="off">
                  {t.stato === 'scaduto' ? 'Tempo!' : formattaCountdown(rimasti)}
                </span>
              </div>
              <div className="mcm-dock__barra" aria-hidden="true">
                <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, progresso))})` }} />
              </div>
              <div className="mcm-dock__comandi">
                {t.stato === 'attivo' && (
                  <button type="button" onClick={() => pausa(t.id)}>
                    Pausa
                  </button>
                )}
                {t.stato === 'pausa' && (
                  <button type="button" onClick={() => riprendi(t.id)}>
                    Riprendi
                  </button>
                )}
                <button type="button" onClick={() => aggiungi(t.id, 60)}>
                  +1 min
                </button>
                {t.stato !== 'scaduto' && (
                  <button type="button" onClick={() => azzera(t.id)}>
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  className={t.stato === 'scaduto' ? 'is-primario' : undefined}
                  onClick={() => rimuovi(t.id)}
                  aria-label={`Chiudi il timer ${t.etichetta}`}
                >
                  {t.stato === 'scaduto' ? 'Fatto' : '✕'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mcm-visually-hidden" aria-live="assertive">
        {timer
          .filter((t) => t.stato === 'scaduto')
          .map((t) => `Tempo scaduto: ${t.etichetta}.`)
          .join(' ')}
      </p>
    </section>
  )
}
