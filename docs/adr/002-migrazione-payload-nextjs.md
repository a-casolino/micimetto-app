# ADR 002 — Migrazione a Payload CMS + Next.js (`micimetto-app`)

- **Stato:** Approvato
- **Data:** 15 Novembre 2026
- **Decisori:** Antonio Casolino
- **Supera:** [ADR-001 — Strategia di Refactoring su WordPress + Bricks (xCloud)](https://github.com/a-casolino/micimetto/blob/main/docs/adr/001-strategia-refactoring-wp.md)

---

## Contesto

L'ADR-001 (14 Novembre 2026) aveva deciso di mantenere **WordPress + Bricks Builder + ACF PRO** su xCloud, rifattorizzando il tema `bricks-child`, e aveva scartato sia la migrazione completa a uno stack Next.js/Astro sia l'architettura headless.

L'audit, le specifiche funzionali, il Design System e il modello dati ACF restano documentati nel repository [`a-casolino/micimetto`](https://github.com/a-casolino/micimetto), che rimane il riferimento per il sito live `micimetto.acasolino.com`.

Le funzionalità previste per il refactoring (ricalcolo porzioni, ricerca live e filtro "Svuotafrigo" multi-ingrediente, timer negli step, Screen Wake Lock, Cooking Mode, JSON-LD `Schema.org/Recipe`) sono in gran parte logica applicativa interattiva lato client, più naturale da sviluppare, tipizzare e testare in un'applicazione React che in script aggiunti a template Bricks.

## Decisione

Il refactoring di **Mi ci metto** prosegue come nuova applicazione nel repository **`micimetto-app`**, basata su:

- **Payload CMS 3** come backend e pannello di amministrazione (al posto della bacheca WordPress + ACF PRO);
- **Next.js** (App Router) + **React** per il frontend pubblico;
- **PostgreSQL** come database (`@payloadcms/db-postgres`, con migrazioni versionate in `src/migrations/`).

Il repository `micimetto` (WordPress) non viene più evoluto con i moduli della Fase 3–5 della sua roadmap: resta come documentazione di contesto e come fonte dei contenuti da migrare.

## Cosa resta valido dei documenti precedenti

- **Obiettivo di prodotto:** ricettario pulito, senza pubblicità, pensato per l'uso in cucina da smartphone/tablet.
- **Modello dati:** la collection `ricette` e le tassonomie `ingredienti`, `categorie`, `indici-fit`, `occasioni` ricalcano il modello ACF (`tempo`, `cottura`, `difficolta`, `valutazione`, `dosi_per`, gruppi di ingredienti con sotto-ricette, step con ingredienti/quantità, tip, immagini, gallery e video).
- **Specifiche funzionali** (`micimetto/docs/04-specifiche-funzionali.md`) e **Design System** (`micimetto/docs/03-design-system.md`: Bordeaux `#77002e`, Rosa `#fce8ef`/`#f4c2d7`, `Sora` + `Noto Sans`, WCAG AA).
- **Lezioni dall'audit** (`micimetto/docs/01-audit-stato-attuale.md`): niente errori JS su pagine non-ricetta, archivio `/ricette/` funzionante, ricerca visibile, JSON-LD + Open Graph, link Privacy/Cookie e consenso GDPR nei form.

## Conseguenze

- **Positive:** codice interamente versionato in Git (niente template salvati nel database del builder), TypeScript end-to-end con tipi generati da Payload, test automatici (Vitest + Playwright), maggiore libertà nell'implementare i moduli interattivi e la SEO.
- **Negative / da gestire:**
  - Serve una **migrazione dei contenuti** (ricette, tassonomie, media) da WordPress/ACF a Payload/Postgres.
  - Va mantenuta la compatibilità degli URL (`/ricetta/[slug]/`, `/ricette/`, archivi delle tassonomie) o vanno previsti redirect 301 per non perdere il posizionamento.
  - Il nuovo stack richiede un runtime Node.js e un database PostgreSQL, quindi un deploy diverso da quello WordPress e un costo/impegno operativo che l'ADR-001 voleva evitare.
  - Rank Math SEO, LiteSpeed Cache e i plugin WordPress non sono più disponibili: le loro funzioni vanno coperte dall'applicazione.
