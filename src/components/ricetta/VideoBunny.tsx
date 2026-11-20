'use client'

import { useState } from 'react'

type Props = {
  src: string
  titolo: string
  anteprima?: string | null
  larghezza?: number | null
  altezza?: number | null
}

/**
 * Video di Bunny Stream. Con un'anteprima mostra prima l'immagine e carica
 * il player solo al clic (il player pesa: una ricetta può avere molti video).
 */
export function VideoBunny({ src, titolo, anteprima, larghezza, altezza }: Props) {
  const [avviato, setAvviato] = useState(!anteprima)
  const rapporto = larghezza && altezza ? `${larghezza} / ${altezza}` : '16 / 9'
  const verticale = Boolean(larghezza && altezza && altezza > larghezza)

  return (
    <figure
      className={`mcm-video${verticale ? ' is-verticale' : ''}`}
      style={{ aspectRatio: rapporto }}
    >
      {avviato ? (
        <iframe
          src={anteprima ? src.replace('autoplay=false', 'autoplay=true') : src}
          title={titolo}
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className="mcm-video__facciata" onClick={() => setAvviato(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- anteprima sul CDN Bunny */}
          <img src={anteprima!} alt="" loading="lazy" />
          <span className="mcm-video__play" aria-hidden="true">
            ▶
          </span>
          <span className="mcm-visually-hidden">Guarda il video: {titolo}</span>
        </button>
      )}
    </figure>
  )
}
