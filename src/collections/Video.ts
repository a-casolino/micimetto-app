import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import {
  BunnyNotFound,
  bunnyConfig,
  bunnyThumbnailUrl,
  fetchBunnyVideo,
  statoOptions,
  STATI_BUNNY,
} from '../lib/bunny'

/**
 * Legge da Bunny Stream durata, formato, stato e anteprima del video
 * quando l'ID cambia o quando il video non era ancora pronto.
 * Senza variabili d'ambiente Bunny il salvataggio funziona lo stesso, senza metadati.
 */
const sincronizzaBunny: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const config = bunnyConfig()
  const bunnyId = (data.bunnyId ?? originalDoc?.bunnyId)?.trim()
  if (!config?.apiKey || !bunnyId) return data

  const cambiato = bunnyId !== originalDoc?.bunnyId
  const daAggiornare = cambiato || originalDoc?.stato !== 'pronto' || data.risincronizza
  if (!daAggiornare) return { ...data, risincronizza: false }

  try {
    const video = await fetchBunnyVideo(config, bunnyId)
    return {
      ...data,
      bunnyId,
      titolo: data.titolo || originalDoc?.titolo || video.title,
      durata: video.length || null,
      larghezza: video.width || null,
      altezza: video.height || null,
      stato: STATI_BUNNY[video.status] ?? null,
      anteprima:
        config.cdnHostname && video.thumbnailFileName
          ? bunnyThumbnailUrl(config.cdnHostname, bunnyId, video.thumbnailFileName)
          : null,
      sincronizzatoIl: new Date().toISOString(),
      risincronizza: false,
    }
  } catch (err) {
    if (err instanceof BunnyNotFound) {
      throw new ValidationError({
        collection: 'video',
        errors: [
          {
            path: 'bunnyId',
            message: `Nessun video con questo ID nella libreria Bunny ${config.libraryId}.`,
          },
        ],
      })
    }
    // Bunny non raggiungibile: salva comunque, i metadati arriveranno al prossimo salvataggio.
    req.payload.logger.warn({ err, bunnyId }, 'Sincronizzazione Bunny Stream non riuscita')
    return data
  }
}

export const Video: CollectionConfig = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Video' },
  admin: {
    useAsTitle: 'titolo',
    group: 'Cucina',
    defaultColumns: ['titolo', 'stato', 'durata', 'updatedAt'],
    description:
      'Video ospitati su Bunny Stream. Carica il file su Bunny, poi incolla qui il suo Video ID: durata, formato e anteprima vengono letti in automatico.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [sincronizzaBunny],
  },
  fields: [
    {
      name: 'titolo',
      type: 'text',
      admin: { description: 'Se vuoto si usa il titolo che il video ha su Bunny.' },
    },
    {
      name: 'bunnyId',
      label: 'Video ID Bunny',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Il GUID del video (Bunny → Stream → libreria → video → Video ID).',
        placeholder: '00000000-0000-0000-0000-000000000000',
      },
    },
    {
      name: 'stato',
      type: 'select',
      options: statoOptions,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'risincronizza',
      label: 'Rileggi i dati da Bunny al salvataggio',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sincronizzatoIl',
      label: 'Ultima lettura da Bunny',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'durata',
          label: 'Durata (secondi)',
          type: 'number',
          admin: { readOnly: true },
        },
        { name: 'larghezza', type: 'number', admin: { readOnly: true } },
        { name: 'altezza', type: 'number', admin: { readOnly: true } },
      ],
    },
    {
      name: 'anteprima',
      label: 'URL anteprima',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
}
