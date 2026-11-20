import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import type { Ricette } from '@/payload-types'

import { calcolaDose, testoDose } from './dosi'
import { immagine, popolati, righeDose } from './pagina'
import { isoDurata } from './tempi'

type RichTextData = Parameters<typeof convertLexicalToPlaintext>[0]['data']

export function testoSemplice(data: unknown): string {
  if (!data || typeof data !== 'object' || !('root' in data)) return ''
  return convertLexicalToPlaintext({ data: data as RichTextData })
    .replace(/\s+/g, ' ')
    .trim()
}

/** Schema.org/Recipe (docs/riferimento/04-specifiche-funzionali.md §5). */
export function recipeJsonLd(ricetta: Ricette, urlPagina: string, urlSito: string) {
  const assoluto = (url: string) => new URL(url, urlSito).toString()
  const img = immagine(ricetta.immagine, 'hero') ?? immagine(ricetta.immagine)
  const ingredienti = (ricetta.gruppiIngredienti ?? []).flatMap((g) =>
    righeDose(g.righe).map((r) => testoDose(calcolaDose(r, ricetta.dosiPer, ricetta.dosiPer))),
  )
  const categorie = popolati(ricetta.categorie).map((c) => c.nome)

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: ricetta.titolo,
    description: ricetta.descrizione || ricetta.seo?.descrizione || undefined,
    image: img ? [assoluto(img.url)] : undefined,
    author: { '@type': 'Organization', name: 'Mi ci metto', url: urlSito },
    datePublished: ricetta.dataPubblicazione || undefined,
    dateModified: ricetta.updatedAt,
    prepTime: isoDurata(ricetta.tempo),
    cookTime: isoDurata(ricetta.cottura),
    totalTime: isoDurata(ricetta.tempoTotale),
    recipeYield: `${ricetta.dosiPer} ${ricetta.dosiUnita || 'porzioni'}`,
    recipeCategory: categorie.length ? categorie : undefined,
    keywords: ricetta.paroleChiave?.length ? ricetta.paroleChiave.join(', ') : undefined,
    recipeIngredient: ingredienti,
    recipeInstructions: (ricetta.step ?? []).map((s, i) => {
      const imgStep = immagine(s.immagine, 'step')
      return {
        '@type': 'HowToStep',
        position: i + 1,
        name: s.titolo || undefined,
        text: testoSemplice(s.procedimento),
        url: `${urlPagina}#passaggio-${i + 1}`,
        image: imgStep ? assoluto(imgStep.url) : undefined,
      }
    }),
    url: urlPagina,
  }
}

/** JSON dentro <script>: niente «</script>» spezzati. */
export function serializzaJsonLd(dati: unknown): string {
  return JSON.stringify(dati).replace(/</g, '\\u003c')
}
