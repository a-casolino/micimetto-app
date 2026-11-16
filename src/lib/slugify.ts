import type { Slugify } from 'payload/shared'
import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Slug leggibili per gli URL italiani:
 * «Crème brûlée all'arancia» → «creme-brulee-allarancia».
 * Lo slugify predefinito di Payload elimina le lettere accentate invece di semplificarle.
 */
export function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const slugify: Slugify = ({ valueToSlugify }) =>
  typeof valueToSlugify === 'string' ? toSlug(valueToSlugify) : undefined

/**
 * Genera lo slug prima della validazione quando manca (creazione da API locale, script, seed).
 * Il campo `slugField` di Payload lo genera in un hook che gira in parallelo alla validazione
 * del campo obbligatorio, quindi fuori dal pannello admin la creazione fallirebbe.
 */
export const slugMancante =
  (campo: string): CollectionBeforeValidateHook =>
  ({ data }) => {
    if (data && !data.slug && typeof data[campo] === 'string') {
      return { ...data, slug: toSlug(data[campo]) }
    }
    return data
  }
