/**
 * Campi calcolati della ricetta, salvati a ogni modifica per poter filtrare
 * direttamente nel database:
 * - `ingredientiIndice`: tutti gli ingredienti usati (lista e step), per lo Svuotafrigo;
 * - `tempoTotale`: preparazione + cottura, per il filtro «tempo massimo».
 */

type Rel = number | string | { id: number | string } | null | undefined

type RigaConIngrediente = { ingrediente?: Rel }

export type RicettaPerDerivati = {
  tempo?: number | null
  cottura?: number | null
  gruppiIngredienti?: { righe?: RigaConIngrediente[] | null }[] | null
  step?: { ingredienti?: RigaConIngrediente[] | null }[] | null
}

function relId(rel: Rel): number | string | undefined {
  if (rel === null || rel === undefined || rel === '') return undefined
  return typeof rel === 'object' ? rel.id : rel
}

export function ingredientiIndice(ricetta: RicettaPerDerivati): (number | string)[] {
  const righe = [
    ...(ricetta.gruppiIngredienti ?? []).flatMap((g) => g.righe ?? []),
    ...(ricetta.step ?? []).flatMap((s) => s.ingredienti ?? []),
  ]
  const ids = new Map<string, number | string>()
  for (const riga of righe) {
    const id = relId(riga.ingrediente)
    if (id !== undefined) ids.set(String(id), id)
  }
  return [...ids.values()]
}

export function tempoTotale(ricetta: RicettaPerDerivati): number | null {
  const { tempo, cottura } = ricetta
  if (tempo == null && cottura == null) return null
  return (tempo ?? 0) + (cottura ?? 0)
}
