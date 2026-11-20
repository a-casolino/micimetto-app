import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

/** Home provvisoria: elenco delle ultime ricette finché non arrivano le pagine d'archivio. */
export default async function HomePage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'ricette',
    where: { _status: { equals: 'published' } },
    select: { titolo: true, slug: true },
    limit: 24,
    depth: 0,
  })

  return (
    <div className="mcm-home">
      <h1>Ricette</h1>
      {docs.length === 0 ? (
        <p>Ancora nessuna ricetta pubblicata.</p>
      ) : (
        <ul>
          {docs.map((r) => (
            <li key={r.id}>
              <Link href={`/ricetta/${r.slug}`}>{r.titolo}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
