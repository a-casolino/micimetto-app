import type { CollectionConfig } from 'payload'

type TaxonomyArgs = {
  slug: string
  singular: string
  plural: string
}

export function taxonomy({ slug, singular, plural }: TaxonomyArgs): CollectionConfig {
  return {
    slug,
    labels: { singular, plural },
    admin: {
      useAsTitle: 'nome',
      group: 'Cucina',
      defaultColumns: ['nome', 'updatedAt'],
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
    ],
  }
}
