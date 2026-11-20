'use client'

import { useId } from 'react'

import { calcolaDose, type RigaDose } from '@/lib/ricette/dosi'

import { useCucina } from './CucinaProvider'

export type GruppoIngredienti = { titolo?: string | null; righe: RigaDose[] }

function useDose(riga: RigaDose) {
  const { porzioni, porzioniBase } = useCucina()
  return calcolaDose(riga, porzioniBase, porzioni)
}

function RigaIngrediente({ riga }: { riga: RigaDose }) {
  const id = useId()
  const dose = useDose(riga)
  return (
    <li className="mcm-ingrediente">
      <input type="checkbox" id={id} className="mcm-ingrediente__check" />
      <label htmlFor={id}>
        <span className="mcm-ingrediente__nome">
          {dose.nome}
          {dose.quantita && dose.nota && <span className="mcm-muted"> {dose.nota}</span>}
          {dose.facoltativo && <span className="mcm-muted"> (facoltativo)</span>}
        </span>
        <span className="mcm-ingrediente__dose mcm-num">{dose.quantita || dose.nota}</span>
      </label>
    </li>
  )
}

/** Lista ingredienti con caselle per la «mise en place». */
export function ListaIngredienti({ gruppi }: { gruppi: GruppoIngredienti[] }) {
  return (
    <div className="mcm-ingredienti">
      {gruppi.map((gruppo, i) => (
        <div key={i} className="mcm-ingredienti__gruppo">
          {gruppo.titolo && <h3>{gruppo.titolo}</h3>}
          <ul>
            {gruppo.righe.map((riga, j) => (
              <RigaIngrediente key={j} riga={riga} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Chip({ riga }: { riga: RigaDose }) {
  const dose = useDose(riga)
  return (
    <li className="mcm-chip">
      <span className="mcm-num mcm-chip__dose">{dose.quantita || dose.nota}</span> {dose.nome}
      {dose.quantita && dose.nota && <span className="mcm-muted"> {dose.nota}</span>}
    </li>
  )
}

/** Dosi usate in uno step, ricalcolate con le porzioni scelte. */
export function IngredientiStep({ righe }: { righe: RigaDose[] }) {
  return (
    <ul className="mcm-chips" aria-label="Ingredienti di questo passaggio">
      {righe.map((riga, i) => (
        <Chip key={i} riga={riga} />
      ))}
    </ul>
  )
}
