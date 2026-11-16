import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Immagine', plural: 'Immagini' },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      label: 'Testo alternativo',
      type: 'text',
      required: true,
      admin: {
        description: 'Cosa si vede nella foto, per chi usa un lettore di schermo.',
      },
    },
    {
      name: 'didascalia',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    // Formati per schede, pagina ricetta e Open Graph (1200×630).
    imageSizes: [
      { name: 'card', width: 640, height: 480, position: 'centre' },
      { name: 'step', width: 1024 },
      { name: 'hero', width: 1600 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'card',
  },
}
