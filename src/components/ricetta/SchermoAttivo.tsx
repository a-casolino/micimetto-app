'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Stato = 'spento' | 'acceso' | 'non-supportato' | 'negato'

/**
 * Interruttore «Schermo sempre acceso» con la Screen Wake Lock API.
 * Il browser rilascia il blocco quando la scheda va in background:
 * lo richiediamo di nuovo al ritorno (visibilitychange).
 */
export function SchermoAttivo() {
  const [stato, setStato] = useState<Stato>('spento')
  const voluto = useRef(false)
  const lock = useRef<WakeLockSentinel | null>(null)

  const richiedi = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      setStato('non-supportato')
      return
    }
    try {
      lock.current = await navigator.wakeLock.request('screen')
      setStato('acceso')
      lock.current.addEventListener('release', () => {
        lock.current = null
        if (!voluto.current) setStato('spento')
      })
    } catch {
      voluto.current = false
      setStato('negato')
    }
  }, [])

  useEffect(() => {
    const alRitorno = () => {
      if (voluto.current && document.visibilityState === 'visible' && !lock.current) void richiedi()
    }
    document.addEventListener('visibilitychange', alRitorno)
    return () => {
      document.removeEventListener('visibilitychange', alRitorno)
      voluto.current = false
      void lock.current?.release()
    }
  }, [richiedi])

  const cambia = async () => {
    if (stato === 'acceso') {
      voluto.current = false
      await lock.current?.release()
      lock.current = null
      setStato('spento')
    } else {
      voluto.current = true
      await richiedi()
    }
  }

  const acceso = stato === 'acceso'
  return (
    <div className="mcm-schermo">
      <button
        type="button"
        role="switch"
        aria-checked={acceso}
        className={`mcm-switch${acceso ? ' is-acceso' : ''}`}
        onClick={cambia}
      >
        <span className="mcm-switch__pallino" aria-hidden="true" />
        Schermo acceso
      </button>
      {stato === 'non-supportato' && (
        <p className="mcm-avviso" role="status">
          Questo browser non può tenere lo schermo acceso.
        </p>
      )}
      {stato === 'negato' && (
        <p className="mcm-avviso" role="status">
          Il browser ha rifiutato (risparmio energetico?). Riprova tra poco.
        </p>
      )}
    </div>
  )
}
