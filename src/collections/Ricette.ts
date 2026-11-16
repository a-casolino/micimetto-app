import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'
import { slugField } from 'payload'

import { unitaOptions } from '../fields/unita'
import { ingredientiIndice, tempoTotale } from '../lib/ricette/derivati'
import { slugify, slugMancante } from '../lib/slugify'

/** Dose scalabile: quantità numerica + unità. Le dosi senza numero vanno in `nota`. */
const doseFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'quantita',
        label: 'Quantità',
        type: 'number',
        min: 0,
        admin: {
          width: '25%',
          step: 0.25,
          description: 'Vuota per «q.b.», «un pizzico»…',
        },
      },
      {
        name: 'unita',
        label: 'Unità',
        type: 'select',
        options: unitaOptions,
        admin: {
          width: '25%',
          description: 'Vuota per un conteggio: «2» uova.',
        },
      },
      {
        name: 'nota',
        label: 'Nota',
        type: 'text',
        admin: {
          width: '50%',
          description: '«q.b.», «a temperatura ambiente», «circa». Non viene ricalcolata.',
        },
      },
    ],
  },
]

const calcolaDerivati: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const ricetta = { ...originalDoc, ...data }
  return {
    ...data,
    ingredientiIndice: ingredientiIndice(ricetta),
    tempoTotale: tempoTotale(ricetta),
  }
}

export const Ricette: CollectionConfig = {
  slug: 'ricette',
  labels: { singular: 'Ricetta', plural: 'Ricette' },
  admin: {
    useAsTitle: 'titolo',
    group: 'Cucina',
    defaultColumns: ['titolo', 'categorie', 'tempoTotale', '_status', 'updatedAt'],
  },
  defaultSort: '-dataPubblicazione',
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
  hooks: {
    beforeValidate: [slugMancante('titolo')],
    beforeChange: [calcolaDerivati],
  },
  fields: [
    {
      name: 'titolo',
      type: 'text',
      required: true,
    },
    slugField({ useAsSlug: 'titolo', slugify }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Ricetta',
          fields: [
            {
              name: 'immagine',
              label: 'Immagine',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'descrizione',
              label: 'Descrizione breve',
              type: 'textarea',
              maxLength: 300,
              admin: {
                description:
                  'Una o due frasi per le schede, la ricerca e i risultati di Google (JSON-LD description).',
              },
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
                {
                  name: 'riposo',
                  label: 'Riposo (minuti)',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'Lievitazione, frigo… Non entra nel tempo totale.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'difficolta',
                  label: 'Difficoltà (1-100)',
                  type: 'number',
                  min: 1,
                  max: 100,
                },
                {
                  name: 'valutazione',
                  label: 'Golosità (0-100)',
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
                  min: 1,
                  required: true,
                  defaultValue: 4,
                  admin: {
                    description: 'Le quantità sono riferite a questo numero.',
                  },
                },
                {
                  name: 'dosiUnita',
                  label: 'Unità porzioni',
                  type: 'text',
                  defaultValue: 'persone',
                  admin: {
                    description: '«persone», «biscotti», «tortiera da 24 cm»…',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Ingredienti',
          fields: [
            {
              name: 'gruppiIngredienti',
              label: 'Ingredienti',
              type: 'array',
              labels: { singular: 'Gruppo', plural: 'Gruppi' },
              admin: {
                description:
                  'Un solo gruppo senza titolo per le ricette semplici; più gruppi per le sotto-ricette («Per l’impasto», «Per la crema»).',
              },
              fields: [
                {
                  name: 'titolo',
                  label: 'Titolo del gruppo',
                  type: 'text',
                },
                {
                  name: 'righe',
                  type: 'array',
                  labels: { singular: 'Ingrediente', plural: 'Ingredienti' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'ingrediente',
                          type: 'relationship',
                          relationTo: 'ingredienti',
                          required: true,
                          admin: { width: '75%' },
                        },
                        {
                          name: 'facoltativo',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: { width: '25%', style: { alignSelf: 'center' } },
                        },
                      ],
                    },
                    ...doseFields,
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Procedimento',
          fields: [
            {
              name: 'step',
              label: 'Procedimento',
              type: 'array',
              labels: { singular: 'Step', plural: 'Step' },
              fields: [
                {
                  name: 'titolo',
                  type: 'text',
                  admin: {
                    description:
                      'Facoltativo, per la Modalità Cucina e il JSON-LD (HowToStep name).',
                  },
                },
                {
                  name: 'ingredienti',
                  label: 'Ingredienti di questo step',
                  type: 'array',
                  fields: [
                    {
                      name: 'ingrediente',
                      type: 'relationship',
                      relationTo: 'ingredienti',
                      required: true,
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
                  name: 'timer',
                  type: 'array',
                  labels: { singular: 'Timer', plural: 'Timer' },
                  admin: {
                    description:
                      'Facoltativo: i tempi scritti nel testo («10 minuti», «30-35 min») diventano timer da soli. Usalo solo se il testo è ambiguo.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'etichetta',
                          type: 'text',
                          admin: { width: '40%', placeholder: 'Cottura in forno' },
                        },
                        {
                          name: 'durata',
                          type: 'number',
                          required: true,
                          min: 1,
                          admin: { width: '20%' },
                        },
                        {
                          name: 'durataMax',
                          label: 'Fino a',
                          type: 'number',
                          min: 1,
                          admin: { width: '20%', description: 'Per gli intervalli: 30-35.' },
                        },
                        {
                          name: 'unita',
                          label: 'Unità',
                          type: 'select',
                          required: true,
                          defaultValue: 'minuti',
                          options: [
                            { label: 'secondi', value: 'secondi' },
                            { label: 'minuti', value: 'minuti' },
                            { label: 'ore', value: 'ore' },
                          ],
                          admin: { width: '20%' },
                        },
                      ],
                    },
                  ],
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
                  name: 'video',
                  type: 'relationship',
                  relationTo: 'video',
                  hasMany: true,
                  admin: { description: 'Video di Bunny Stream per questo passaggio.' },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              admin: {
                description:
                  'Tutto facoltativo: se vuoto si usano titolo, descrizione breve e immagine.',
              },
              fields: [
                {
                  name: 'titolo',
                  label: 'Meta title',
                  type: 'text',
                  maxLength: 70,
                },
                {
                  name: 'descrizione',
                  label: 'Meta description',
                  type: 'textarea',
                  maxLength: 160,
                },
                {
                  name: 'immagine',
                  label: 'Immagine Open Graph',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'noindex',
                  label: 'Escludi dai motori di ricerca',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'paroleChiave',
              label: 'Parole chiave',
              type: 'text',
              hasMany: true,
              admin: { description: 'JSON-LD keywords.' },
            },
          ],
        },
      ],
    },
    // Sidebar
    {
      name: 'dataPubblicazione',
      label: 'Data di pubblicazione',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Se vuota viene impostata alla prima pubblicazione.',
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) =>
            value ?? (siblingData?._status === 'published' ? new Date().toISOString() : value),
        ],
      },
    },
    {
      name: 'categorie',
      type: 'relationship',
      relationTo: 'categorie',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'indiceFit',
      label: 'Indice fit',
      type: 'relationship',
      relationTo: 'indici-fit',
      admin: { position: 'sidebar' },
    },
    {
      name: 'occasioni',
      type: 'relationship',
      relationTo: 'occasioni',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'ingredientiIndice',
      label: 'Tutti gli ingredienti',
      type: 'relationship',
      relationTo: 'ingredienti',
      hasMany: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calcolato dalla lista e dagli step. Serve allo Svuotafrigo.',
      },
    },
    {
      name: 'tempoTotale',
      label: 'Tempo totale (minuti)',
      type: 'number',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Preparazione + cottura.',
      },
    },
  ],
}
