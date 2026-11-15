# Documentazione di riferimento (dal sito WordPress)

Questi documenti vengono dal repository [`a-casolino/micimetto`](https://github.com/a-casolino/micimetto), che descriveva il sito WordPress + Bricks su `micimetto.acasolino.com` ed è stato archiviato. Il progetto continua qui, in `micimetto-app` (vedi [ADR-002](../adr/002-migrazione-payload-nextjs.md)).

| Documento | Cosa resta valido |
| :--- | :--- |
| [01 — Audit dello stato attuale](./01-audit-stato-attuale.md) | Bug, limiti UX e lacune SEO/GDPR del sito WordPress da non ripetere |
| [02 — Architettura e stack](./02-architettura-e-stack.md) | Modello dati ACF (CPT `ricetta`, tassonomie, campi) da cui derivano le collection Payload; la parte su hosting e WordPress è storica |
| [03 — Design System](./03-design-system.md) | Palette, tipografia, token `--mcm-*` e componenti |
| [04 — Specifiche funzionali](./04-specifiche-funzionali.md) | Portion Scaler, ricerca e Svuotafrigo, timer, Wake Lock, Cooking Mode, JSON-LD |
| [ADR-001](./adr-001-strategia-refactoring-wp.md) | Decisione storica, superata dall'ADR-002 |

La cartella [`exports/`](./exports/) contiene gli export JSON dello schema ACF PRO e dei template Bricks del sito WordPress, utili per la migrazione dei contenuti.
