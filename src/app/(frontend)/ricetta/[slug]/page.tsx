import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import React from 'react'

import { CucinaProvider } from '@/components/ricetta/CucinaProvider'
import { IngredientiStep, ListaIngredienti } from '@/components/ricetta/Dosi'
import { Porzioni } from '@/components/ricetta/Porzioni'
import { Procedimento } from '@/components/ricetta/Procedimento'
import { SchermoAttivo } from '@/components/ricetta/SchermoAttivo'
import { TimerDock } from '@/components/ricetta/TimerDock'
import { TimerPill } from '@/components/ricetta/TimerPill'
import { VideoBunny } from '@/components/ricetta/VideoBunny'
import { bunnyConfig, bunnyEmbedUrl } from '@/lib/bunny'
import { recipeJsonLd, serializzaJsonLd } from '@/lib/ricette/jsonld'
import {
  caricaRicetta,
  immagine,
  popolati,
  popolato,
  righeDose,
  videoPronti,
} from '@/lib/ricette/pagina'
import { formattaIntervallo, formattaMinuti, secondiTimer } from '@/lib/ricette/tempi'
import { NOME_SITO, urlSito } from '@/lib/sito'
import type { Categorie, IndiciFit, Occasioni } from '@/payload-types'

// Sempre fresca: le modifiche dall'admin si vedono subito e chi è loggato vede le bozze.
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { ricetta } = await caricaRicetta(slug)
  if (!ricetta) return { title: 'Ricetta non trovata' }

  const sito = await urlSito()
  const titolo = ricetta.seo?.titolo || ricetta.titolo
  const descrizione = ricetta.seo?.descrizione || ricetta.descrizione || undefined
  const og = immagine(ricetta.seo?.immagine, 'og') ?? immagine(ricetta.immagine, 'og')
  const url = `${sito}/ricetta/${ricetta.slug}`

  return {
    title: titolo,
    description: descrizione,
    alternates: { canonical: url },
    robots: ricetta.seo?.noindex || ricetta._status === 'draft' ? { index: false } : undefined,
    openGraph: {
      type: 'article',
      url,
      title: titolo,
      description: descrizione,
      siteName: NOME_SITO,
      locale: 'it_IT',
      publishedTime: ricetta.dataPubblicazione ?? undefined,
      images: og ? [{ url: new URL(og.url, sito).toString(), width: og.width, height: og.height, alt: og.alt }] : undefined,
    },
  }
}

function Livello({ valore, etichetta }: { valore: number; etichetta: string }) {
  // 1-100 → 1-5 pallini
  const pieni = Math.max(1, Math.min(5, Math.round(valore / 20)))
  return (
    <span className="mcm-livello" aria-label={`${etichetta}: ${pieni} su 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < pieni ? 'is-pieno' : undefined} aria-hidden="true" />
      ))}
    </span>
  )
}

export default async function PaginaRicetta({ params }: Props) {
  const { slug } = await params
  const { ricetta, bozza } = await caricaRicetta(slug)
  if (!ricetta) notFound()

  const sito = await urlSito()
  const urlPagina = `${sito}/ricetta/${ricetta.slug}`
  const hero = immagine(ricetta.immagine, 'hero')
  const categorie = popolati<Categorie>(ricetta.categorie)
  const occasioni = popolati<Occasioni>(ricetta.occasioni)
  const fit = popolato<IndiciFit>(ricetta.indiceFit)
  const bunny = bunnyConfig()
  const gruppi = (ricetta.gruppiIngredienti ?? [])
    .map((g) => ({ titolo: g.titolo ?? null, righe: righeDose(g.righe) }))
    .filter((g) => g.righe.length > 0)
  const step = ricetta.step ?? []
  const dosiUnita = ricetta.dosiUnita || 'porzioni'

  const tempi = [
    { nome: 'Preparazione', minuti: ricetta.tempo },
    { nome: 'Cottura', minuti: ricetta.cottura },
    { nome: 'Riposo', minuti: ricetta.riposo },
    { nome: 'Totale', minuti: ricetta.tempoTotale },
  ].filter((t): t is { nome: string; minuti: number } => Boolean(t.minuti))

  return (
    <CucinaProvider porzioniBase={ricetta.dosiPer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializzaJsonLd(recipeJsonLd(ricetta, urlPagina, sito)) }}
      />
      <article className="mcm-ricetta">
        {bozza && (
          <p className="mcm-bozza" role="status">
            Anteprima della bozza: il pubblico non vede ancora questa versione.
          </p>
        )}

        <header className="mcm-ricetta__testa">
          <div className="mcm-ricetta__intro">
            {(categorie.length > 0 || occasioni.length > 0 || fit) && (
              <ul className="mcm-badge-lista" aria-label="Categorie">
                {categorie.map((c) => (
                  <li key={`c${c.id}`} className="mcm-badge">
                    {c.nome}
                  </li>
                ))}
                {occasioni.map((o) => (
                  <li key={`o${o.id}`} className="mcm-badge is-tenue">
                    {o.nome}
                  </li>
                ))}
                {fit && <li className="mcm-badge is-fit">{fit.nome}</li>}
              </ul>
            )}
            <h1>{ricetta.titolo}</h1>
            {ricetta.descrizione && <p className="mcm-ricetta__descrizione">{ricetta.descrizione}</p>}

            <dl className="mcm-scheda">
              {tempi.map((t) => (
                <div key={t.nome}>
                  <dt>{t.nome}</dt>
                  <dd className="mcm-num">{formattaMinuti(t.minuti)}</dd>
                </div>
              ))}
              {ricetta.difficolta != null && (
                <div>
                  <dt>Difficoltà</dt>
                  <dd>
                    <Livello valore={ricetta.difficolta} etichetta="Difficoltà" />
                  </dd>
                </div>
              )}
              {ricetta.valutazione != null && ricetta.valutazione > 0 && (
                <div>
                  <dt>Golosità</dt>
                  <dd>
                    <Livello valore={ricetta.valutazione} etichetta="Golosità" />
                  </dd>
                </div>
              )}
            </dl>
          </div>
          {hero && (
            <Image
              className="mcm-ricetta__foto"
              src={hero.url}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              sizes="(min-width: 992px) 50vw, 100vw"
              priority
            />
          )}
        </header>

        <div className="mcm-strumenti" role="region" aria-label="Strumenti di cucina">
          <Porzioni unita={dosiUnita} />
          <SchermoAttivo />
        </div>

        {ricetta.introduzione && (
          <section className="mcm-ricetta__introduzione">
            <RichText className="mcm-testo" data={ricetta.introduzione} />
          </section>
        )}

        <div className="mcm-ricetta__corpo">
          {gruppi.length > 0 && (
            <section className="mcm-ricetta__ingredienti" aria-labelledby="titolo-ingredienti">
              <div className="mcm-pannello">
                <h2 id="titolo-ingredienti">Ingredienti</h2>
                <ListaIngredienti gruppi={gruppi} />
              </div>
            </section>
          )}

          {step.length > 0 && (
            <section className="mcm-ricetta__procedimento" aria-labelledby="titolo-procedimento">
              <h2 id="titolo-procedimento">Procedimento</h2>
              <ol className="mcm-step-lista">
                {step.map((s, i) => {
                  const n = i + 1
                  const nomeStep = s.titolo || `Passaggio ${n}`
                  const righe = righeDose(s.ingredienti)
                  const timerEspliciti = s.timer ?? []
                  const img = immagine(s.immagine, 'step')
                  const galleria = popolati(s.galleria)
                    .map((m) => immagine(m, 'step'))
                    .filter((x) => x !== null)
                  const video = bunny ? videoPronti(s.video) : []

                  return (
                    <li key={s.id ?? i} id={`passaggio-${n}`} className="mcm-step">
                      <div className="mcm-step__numero" aria-hidden="true">
                        {n}
                      </div>
                      <div className="mcm-step__contenuto">
                        <h3 className={s.titolo ? undefined : 'mcm-visually-hidden'}>{nomeStep}</h3>
                        {righe.length > 0 && <IngredientiStep righe={righe} />}
                        <Procedimento
                          data={s.procedimento}
                          idStep={`s${n}`}
                          nomeStep={nomeStep}
                          riconosciTempi={timerEspliciti.length === 0}
                        />
                        {timerEspliciti.length > 0 && (
                          <p className="mcm-step__timer">
                            {timerEspliciti.map((t, j) => {
                              const { secondi, secondiMax } = secondiTimer(t)
                              const durata = formattaIntervallo(secondi, secondiMax)
                              const testo = t.etichetta ? `${t.etichetta} · ${durata}` : durata
                              return (
                                <TimerPill
                                  key={t.id ?? j}
                                  id={`s${n}-t${j}`}
                                  testo={testo}
                                  etichetta={`${nomeStep} · ${testo}`}
                                  secondi={secondi}
                                />
                              )
                            })}
                          </p>
                        )}
                        {s.consiglio && (
                          <aside className="mcm-consiglio">
                            <strong>Consiglio</strong>
                            <RichText className="mcm-testo" data={s.consiglio} />
                          </aside>
                        )}
                        {(img || galleria.length > 0) && (
                          <div className="mcm-step__foto">
                            {[img, ...galleria]
                              .filter((x) => x !== null)
                              .map((f, k) => (
                                <Image
                                  key={k}
                                  src={f.url}
                                  alt={f.alt}
                                  width={f.width}
                                  height={f.height}
                                  sizes="(min-width: 992px) 33vw, 100vw"
                                />
                              ))}
                          </div>
                        )}
                        {bunny &&
                          video.map((v) => (
                            <VideoBunny
                              key={v.id}
                              src={bunnyEmbedUrl(bunny.libraryId, v.bunnyId)}
                              titolo={v.titolo || `${ricetta.titolo} · ${nomeStep}`}
                              anteprima={v.anteprima}
                              larghezza={v.larghezza}
                              altezza={v.altezza}
                            />
                          ))}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}
        </div>
      </article>
      <TimerDock />
    </CucinaProvider>
  )
}
