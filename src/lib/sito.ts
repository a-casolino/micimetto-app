import { headers as getHeaders } from 'next/headers'

export const NOME_SITO = 'Mi ci metto'

/**
 * URL pubblico del sito, per JSON-LD e Open Graph.
 * NEXT_PUBLIC_SERVER_URL se impostata (es. https://micimetto.it), altrimenti dall'host della richiesta.
 */
export async function urlSito(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SERVER_URL
  if (env) return env.replace(/\/$/, '')
  const h = await getHeaders()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto.split(',')[0]}://${host}`
}
