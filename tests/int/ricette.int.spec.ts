import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { toSlug } from '@/lib/slugify'

let payload: Payload
const creati: { collection: 'ricette' | 'ingredienti' | 'categorie' | 'video'; id: number }[] = []

// Lo slug è obbligatorio nei tipi ma viene generato dal nome: qui verifichiamo proprio quello.
const senzaSlug = <T>(data: T) => data as T & { slug: string }

const testo = (t: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [{ type: 'text', text: t, version: 1 }],
      },
    ],
  },
})

describe('toSlug', () => {
  it('semplifica accenti e apostrofi', () => {
    expect(toSlug("Crème brûlée all'arancia")).toBe('creme-brulee-allarancia')
    expect(toSlug('  Più   Pomodori! ')).toBe('piu-pomodori')
  })
})

describe('Ricette', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const { collection, id } of creati.reverse()) {
      await payload.delete({ collection, id })
    }
  })

  it('calcola slug, indice ingredienti e tempo totale', async () => {
    const [uova, farina, zucchero] = await Promise.all(
      ['Uovo', 'Farina', 'Zucchero'].map((nome) =>
        payload.create({ collection: 'ingredienti', data: senzaSlug({ nome: `${nome} test` }) }),
      ),
    )
    creati.push(
      ...[uova, farina, zucchero].map((d) => ({ collection: 'ingredienti' as const, id: d.id })),
    )
    expect(uova.slug).toBe('uovo-test')

    const dolci = await payload.create({
      collection: 'categorie',
      data: senzaSlug({ nome: 'Dolci test' }),
    })
    creati.push({ collection: 'categorie', id: dolci.id })

    const ricetta = await payload.create({
      collection: 'ricette',
      draft: false,
      data: senzaSlug({
        titolo: 'Ciambelline al vino è test',
        _status: 'published',
        tempo: 20,
        cottura: 15,
        dosiPer: 4,
        categorie: [dolci.id],
        gruppiIngredienti: [
          {
            righe: [
              { ingrediente: uova.id, quantita: 2 },
              { ingrediente: farina.id, quantita: 250, unita: 'g' },
              { ingrediente: farina.id, nota: 'q.b. per la spianatoia' },
            ],
          },
        ],
        step: [
          {
            procedimento: testo('Cuoci per 15 minuti.'),
            ingredienti: [{ ingrediente: zucchero.id, quantita: 1, unita: 'cucchiaio' }],
            timer: [{ durata: 15, unita: 'minuti' }],
          },
        ],
      }),
    })
    creati.unshift({ collection: 'ricette', id: ricetta.id })

    expect(ricetta.slug).toBe('ciambelline-al-vino-e-test')
    expect(ricetta.tempoTotale).toBe(35)
    expect(ricetta.dataPubblicazione).toBeTruthy()
    const ids = (ricetta.ingredientiIndice ?? []).map((i) => (typeof i === 'object' ? i.id : i))
    expect(ids.sort()).toEqual([uova.id, farina.id, zucchero.id].sort())

    // Svuotafrigo: le ricette che contengono almeno uno degli ingredienti scelti.
    const trovate = await payload.find({
      collection: 'ricette',
      where: { ingredientiIndice: { in: [uova.id] } },
      depth: 0,
    })
    expect(trovate.docs.map((d) => d.id)).toContain(ricetta.id)

    // Una modifica parziale ricalcola i campi derivati partendo dal documento salvato.
    const aggiornata = await payload.update({
      collection: 'ricette',
      id: ricetta.id,
      data: { cottura: 25 },
    })
    expect(aggiornata.tempoTotale).toBe(45)
    expect(aggiornata.ingredientiIndice).toHaveLength(3)
  })
})

describe('Video Bunny', () => {
  const env = { ...process.env }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterEach(async () => {
    process.env = { ...env }
    vi.unstubAllGlobals()
    await payload.delete({ collection: 'video', where: { bunnyId: { like: 'test-' } } })
  })

  it('si salva anche senza configurazione Bunny', async () => {
    delete process.env.BUNNY_STREAM_LIBRARY_ID
    const video = await payload.create({
      collection: 'video',
      data: { bunnyId: 'test-senza-config', titolo: 'Impasto' },
    })
    expect(video.stato).toBeFalsy()
  })

  it('legge durata, stato e anteprima da Bunny Stream', async () => {
    process.env.BUNNY_STREAM_LIBRARY_ID = '123'
    process.env.BUNNY_STREAM_API_KEY = 'chiave'
    process.env.BUNNY_STREAM_CDN_HOSTNAME = 'vz-test.b-cdn.net'
    const fetchMock = vi.fn(async () =>
      Response.json({
        guid: 'test-guid',
        title: 'Stendere la sfoglia',
        length: 42,
        status: 4,
        width: 1080,
        height: 1920,
        thumbnailFileName: 'thumbnail.jpg',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const video = await payload.create({ collection: 'video', data: { bunnyId: 'test-guid' } })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://video.bunnycdn.com/library/123/videos/test-guid',
      expect.objectContaining({ headers: expect.objectContaining({ AccessKey: 'chiave' }) }),
    )
    expect(video).toMatchObject({
      titolo: 'Stendere la sfoglia',
      durata: 42,
      stato: 'pronto',
      altezza: 1920,
      anteprima: 'https://vz-test.b-cdn.net/test-guid/thumbnail.jpg',
    })
  })

  it('rifiuta un ID che non esiste nella libreria', async () => {
    process.env.BUNNY_STREAM_LIBRARY_ID = '123'
    process.env.BUNNY_STREAM_API_KEY = 'chiave'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 })),
    )

    await expect(
      payload.create({ collection: 'video', data: { bunnyId: 'test-inesistente' } }),
    ).rejects.toThrow()
  })
})
