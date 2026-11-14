import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

const doseFields = [
  {
    name: 'quantita',
    label: 'Quantità',
    type: 'number' as const,
    min: 0,
  },
  {
    name: 'unita',
    label: 'Unità',
    type: 'text' as const,
    admin: {
      description: 'g, ml, cucchiai. Vuoto se la dose non è numerica.',
    },
  },
]

export const Ricette: CollectionConfig = {
  slug: 'ricette',
  labels: { singular: 'Ricetta', plural: 'Ricette' },
  admin: {
    useAsTitle: 'titolo',
    group: 'Cucina',
    defaultColumns: ['titolo', 'categoria', '_status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  fields: [
    {
      name: 'titolo',
      type: 'text',
      required: true,
    },
    slugField({ useAsSlug: 'titolo' }),
    {
      name: 'immagine',
      label: 'Immagine',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'introduzione',
      type: 'richText',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tempo',
          label: 'Preparazione (minuti)',
          type: 'number',
          min: 0,
        },
        {
          name: 'cottura',
          label: 'Cottura (minuti)',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'difficolta',
          label: 'Difficoltà',
          type: 'number',
          min: 1,
          max: 100,
        },
        {
          name: 'valutazione',
          label: 'Golosità',
          type: 'number',
          min: 0,
          max: 100,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'dosiPer',
          label: 'Porzioni base',
          type: 'number',
          min: 0,
          required: true,
          defaultValue: 1,
        },
        {
          name: 'dosiUnita',
          label: 'Unità porzioni',
          type: 'text',
          defaultValue: 'persone',
        },
      ],
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categorie',
    },
    {
      name: 'indiceFit',
      label: 'Indice fit',
      type: 'relationship',
      relationTo: 'indici-fit',
    },
    {
      name: 'occasione',
      type: 'relationship',
      relationTo: 'occasioni',
    },
    {
      name: 'gruppiIngredienti',
      label: 'Ingredienti',
      type: 'array',
      labels: { singular: 'Gruppo', plural: 'Gruppi' },
      fields: [
        {
          name: 'titolo',
          label: 'Titolo del gruppo',
          type: 'text',
          admin: {
            description: 'Per esempio «Per l’impasto».',
          },
        },
        {
          name: 'righe',
          type: 'array',
          labels: { singular: 'Ingrediente', plural: 'Ingredienti' },
          fields: [
            {
              name: 'ingrediente',
              type: 'relationship',
              relationTo: 'ingredienti',
              required: true,
            },
            ...doseFields,
            {
              name: 'nota',
              label: 'Nota',
              type: 'text',
              admin: {
                description: 'q.b., un pizzico, e le altre dosi senza numero.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'step',
      label: 'Procedimento',
      type: 'array',
      labels: { singular: 'Step', plural: 'Step' },
      fields: [
        {
          name: 'ingredienti',
          label: 'Ingredienti di questo step',
          type: 'array',
          fields: [
            {
              name: 'ingrediente',
              type: 'relationship',
              relationTo: 'ingredienti',
            },
            ...doseFields,
          ],
        },
        {
          name: 'procedimento',
          type: 'richText',
          required: true,
        },
        {
          name: 'consiglio',
          label: 'Consiglio',
          type: 'richText',
        },
        {
          name: 'immagine',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'galleria',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
        },
        {
          name: 'bunnyVideoId',
          label: 'Video Bunny',
          type: 'text',
          admin: {
            description: 'ID del video su Bunny Stream.',
          },
        },
      ],
    },
  ],
}
