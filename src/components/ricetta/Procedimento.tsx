import type { SerializedTextNode } from '@payloadcms/richtext-lexical'
import { RichText, type JSXConverterArgs } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import { trovaTempi } from '@/lib/ricette/tempi'

import { TimerPill } from './TimerPill'

type Data = React.ComponentProps<typeof RichText>['data']

type Props = {
  data: Data
  /** Prefisso degli id dei timer: un timer per ogni tempo di ogni step. */
  idStep: string
  nomeStep: string
  /** Se lo step ha timer espliciti, il testo resta testo. */
  riconosciTempi: boolean
}

/**
 * Testo del procedimento: i tempi scritti («10 minuti», «30-35 min»)
 * diventano pulsanti che avviano un timer.
 */
export function Procedimento({ data, idStep, nomeStep, riconosciTempi }: Props) {
  let contatore = 0
  return (
    <RichText
      className="mcm-testo"
      data={data}
      converters={({ defaultConverters }) => {
        if (!riconosciTempi) return defaultConverters
        const testoBase = defaultConverters.text as (
          args: JSXConverterArgs<SerializedTextNode>,
        ) => React.ReactNode
        return {
          ...defaultConverters,
          text: (args: JSXConverterArgs<SerializedTextNode>) => {
            const node = args.node
            const tempi = trovaTempi(node.text)
            if (tempi.length === 0) return testoBase(args)
            const parti: React.ReactNode[] = []
            let cursore = 0
            tempi.forEach((t, i) => {
              if (t.inizio > cursore) {
                parti.push(
                  <React.Fragment key={`t${i}`}>
                    {testoBase({ ...args, node: { ...node, text: node.text.slice(cursore, t.inizio) } })}
                  </React.Fragment>,
                )
              }
              const id = `${idStep}-${contatore++}`
              parti.push(
                <TimerPill
                  key={id}
                  id={id}
                  testo={t.testo}
                  etichetta={`${nomeStep} · ${t.testo}`}
                  secondi={t.secondi}
                />,
              )
              cursore = t.fine
            })
            if (cursore < node.text.length) {
              parti.push(
                <React.Fragment key="coda">
                  {testoBase({ ...args, node: { ...node, text: node.text.slice(cursore) } })}
                </React.Fragment>,
              )
            }
            return <>{parti}</>
          },
        }
      }}
    />
  )
}
