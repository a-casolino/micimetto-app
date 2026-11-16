import type { CollectionConfig, CollectionSlug, Field } from 'payload'
import { slugField } from 'payload'

import { slugify, slugMancante } from '../lib/slugify'

type TaxonomyArgs = {
  slug: string
  singular: string
  plural: string
  /** Come le tassonomie gerarchiche di WordPress: un termine può avere un genitore. */
  hierarchical?: boolean
  extraFields?: Field[]
}

export function taxonomy({
  slug,
  singular,
  plural,
  hierarchical = false,
  extraFields = [],
}: TaxonomyArgs): CollectionConfig {
  return {
    slug,
    labels: { singular, plural },
    admin: {
      useAsTitle: 'nome',
      group: 'Cucina',
      defaultColumns: hierarchical ? ['nome', 'slug', 'parent'] : ['nome', 'slug'],
    },
    defaultSort: 'nome',
    hooks: {
      beforeValidate: [slugMancante('nome')],
    },
    access: {
      read: () => true,
    },
    fields: [
      {
        name: 'nome',
        type: 'text',
        required: true,
      },
      slugField({ useAsSlug: 'nome', slugify }),
      ...extraFields,
      ...(hierarchical
        ? [
            {
              name: 'parent',
              label: 'Genitore',
              type: 'relationship',
              relationTo: slug as CollectionSlug,
              admin: { position: 'sidebar' },
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            } satisfies Field,
          ]
        : []),
      {
        name: 'descrizione',
        type: 'textarea',
        admin: {
          description: "Testo introduttivo e meta description della pagina d'archivio.",
        },
      },
    ],
  }
}
