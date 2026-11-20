'use client'

import { passoPorzioni } from '@/lib/ricette/dosi'

import { useCucina } from './CucinaProvider'

export function Porzioni({ unita }: { unita: string }) {
  const { porzioni, porzioniBase, setPorzioni } = useCucina()
  const passo = passoPorzioni(porzioniBase)
  const modificato = porzioni !== porzioniBase

  return (
    <div className="mcm-porzioni" role="group" aria-label="Porzioni">
      <button
        type="button"
        className="mcm-tondo"
        onClick={() => setPorzioni(porzioni - passo)}
        disabled={porzioni <= passo}
        aria-label="Meno porzioni"
      >
        −
      </button>
      <output className="mcm-porzioni__valore" aria-live="polite">
        <span className="mcm-num">{porzioni}</span> {unita}
      </output>
      <button
        type="button"
        className="mcm-tondo"
        onClick={() => setPorzioni(porzioni + passo)}
        aria-label="Più porzioni"
      >
        +
      </button>
      {modificato && (
        <button type="button" className="mcm-link" onClick={() => setPorzioni(porzioniBase)}>
          Ripristina {porzioniBase}
        </button>
      )}
    </div>
  )
}
