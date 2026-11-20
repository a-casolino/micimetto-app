import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Ingredienti, Media, Video } from '@/payload-types'

import type { RigaDose } from './dosi'

/**
 * Carica una ricetta per slug. Il pubblico vede solo le pubblicate;
 * chi è entrato nell'admin vede anche le bozze (anteprima).
 * `cache` evita una seconda query tra generateMetadata e la pagina.
 */
export const caricaRicetta = cache(async (slug: string) => {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  const anteprima = Boolean(user)

  const { docs } = await payload.find({
    collection: 'ricette',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft: anteprima,
    overrideAccess: false,
    user,
  })
  const ricetta = docs[0] ?? null
  return { ricetta, bozza: ricetta?._status === 'draft' }
})

export function popolato<T extends object>(v: number | T | null | undefined): T | null {
  return v && typeof v === 'object' ? v : null
}

export function popolati<T extends object>(v: (number | T)[] | null | undefined): T[] {
  return (v ?? []).filter((x): x is T => typeof x === 'object' && x !== null)
}

type RigaPayload = {
  ingrediente: number | Ingredienti
  quantita?: number | null
  unita?: string | null
  nota?: string | null
  facoltativo?: boolean | null
}

/** Righe pronte per i componenti client: solo dati serializzabili. */
export function righeDose(righe: RigaPayload[] | null | undefined): RigaDose[] {
  return (righe ?? []).flatMap((r) => {
    const ing = popolato(r.ingrediente)
    if (!ing) return []
    return [
      {
        ingrediente: { nome: ing.nome, plurale: ing.plurale ?? null },
        quantita: r.quantita ?? null,
        unita: r.unita ?? null,
        nota: r.nota ?? null,
        facoltativo: r.facoltativo ?? null,
      },
    ]
  })
}

export type Immagine = { url: string; width: number; height: number; alt: string }

/** URL e misure di un formato di Media, con ripiego sull'originale. */
export function immagine(
  media: number | Media | null | undefined,
  formato?: keyof NonNullable<Media['sizes']>,
): Immagine | null {
  const m = popolato(media)
  if (!m) return null
  const size = formato ? m.sizes?.[formato] : undefined
  const url = size?.url || m.url
  const width = (size?.url && size.width) || m.width
  const height = (size?.url && size.height) || m.height
  if (!url || !width || !height) return null
  return { url, width, height, alt: m.alt ?? '' }
}

export function videoPronti(video: (number | Video)[] | null | undefined): Video[] {
  // Senza API Bunny lo stato resta vuoto: il video si mostra lo stesso.
  return popolati<Video>(video).filter((v) => !v.stato || v.stato === 'pronto')
}
