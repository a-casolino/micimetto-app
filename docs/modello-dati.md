# Modello dati

Collection Payload definite in `src/collections/`. Le tabelle Postgres si creano con le migrazioni in `src/migrations/` (in produzione partono da sole all'avvio, `prodMigrations`).

## Ricette (`ricette`)

Bozze e versioni attive: il pubblico vede solo le ricette pubblicate.

| Campo | Tipo | Note |
| :--- | :--- | :--- |
| `titolo`, `slug` | testo | Lo slug si genera dal titolo senza accenti: «Crème brûlée» → `creme-brulee`. URL: `/ricetta/[slug]/` |
| `immagine`, `descrizione`, `introduzione` | upload, textarea, rich text | `descrizione` (max 300) serve per schede, ricerca e JSON-LD |
| `tempo`, `cottura`, `riposo` | minuti | |
| `tempoTotale` | minuti, **calcolato** | `tempo + cottura`, per il filtro «tempo massimo» |
| `difficolta` (1-100), `valutazione` (0-100) | numero | |
| `dosiPer`, `dosiUnita` | numero, testo | Porzioni base a cui si riferiscono tutte le quantità (es. 4 «persone», 40 «biscotti») |
| `categorie`, `occasioni` | relazioni multiple | |
| `indiceFit` | relazione singola | |
| `gruppiIngredienti[]` | array | `titolo` facoltativo (sotto-ricette) e `righe[]` |
| `step[]` | array | `titolo`, `ingredienti[]`, `procedimento`, `timer[]`, `consiglio`, `immagine`, `galleria`, `video` |
| `ingredientiIndice` | relazione multipla, **calcolata** | Tutti gli ingredienti della lista e degli step, per lo Svuotafrigo |
| `seo`, `paroleChiave` | gruppo, testi | Meta title/description, immagine OG, noindex. Vuoti → si usano titolo, descrizione, immagine |
| `dataPubblicazione` | data | Impostata alla prima pubblicazione se vuota (JSON-LD `datePublished`) |

### Dosi (righe della lista e degli step)

`ingrediente` (relazione) + `quantita` (numero) + `unita` (elenco fisso in `src/fields/unita.ts`) + `nota` (testo libero). Le righe della lista hanno anche `facoltativo`.

- **Ricalcolo porzioni:** `quantita × porzioni scelte / dosiPer`. L'arrotondamento dipende dal tipo di unità (`tipoUnita()`): `peso`/`volume` interi (multipli di 5 sopra 100), `cucchiaio`/`conteggio` un decimale o ½ ¼. Senza unità è un conteggio («2 uova»: per il plurale si usa `ingredienti.plurale`).
- **Dosi senza numero** («q.b.», «un pizzico») si lasciano senza `quantita` e si scrivono in `nota`: non vengono ricalcolate.

### Timer degli step

Di regola il frontend riconosce i tempi nel testo del procedimento («10 minuti», «30-35 min», «2 ore», «45 secondi»). `step.timer[]` (`etichetta`, `durata`, `durataMax`, `unita`: secondi/minuti/ore) serve solo quando il testo è ambiguo e, se presente, ha la precedenza.

### Svuotafrigo

```ts
payload.find({ collection: 'ricette', where: { ingredientiIndice: { in: idScelti } }, depth: 0 })
```

Poi si ordina per numero di ingredienti in comune (`ingredientiIndice ∩ idScelti`) per mostrare «Hai 3 ingredienti su 4». Si combina con `categorie`, `indiceFit` e `tempoTotale: { less_than_equal: N }`.

## Tassonomie

`ingredienti`, `categorie`, `indici-fit`, `occasioni`: `nome`, `slug`, `descrizione` (testo e meta description dell'archivio). Categorie, indici fit e occasioni hanno un `parent` (gerarchia). Gli ingredienti hanno `plurale`.

## Video (`video`) — Bunny Stream

I video degli step sono solo su Bunny Stream. Si carica il file su Bunny, si crea un documento Video incollando il **Video ID** (GUID) e al salvataggio Payload legge da Bunny titolo, durata, larghezza/altezza, stato di codifica e URL dell'anteprima. Se il video non era ancora `pronto`, i dati si rileggono a ogni salvataggio; la casella «Rileggi i dati da Bunny» forza una nuova lettura. Un ID che non esiste nella libreria blocca il salvataggio.

Variabili d'ambiente (vedi `.env.example`):

- `BUNNY_STREAM_LIBRARY_ID`: ID della libreria
- `BUNNY_STREAM_API_KEY`: chiave API della libreria (solo server)
- `BUNNY_STREAM_CDN_HOSTNAME`: hostname CDN della libreria, per le anteprime

Senza queste variabili i video si salvano lo stesso, senza metadati. Nel frontend il player si incorpora con `bunnyEmbedUrl(libraryId, videoId)` da `src/lib/bunny.ts` (iframe `iframe.mediadelivery.net`).

## Media (`media`)

Solo immagini, con `alt` obbligatorio, `didascalia`, punto focale e formati `card` (640×480), `step` (1024), `hero` (1600), `og` (1200×630).

## Pagina ricetta (`/ricetta/[slug]`)

`src/app/(frontend)/ricetta/[slug]/page.tsx`, componenti in `src/components/ricetta/`, logica pura (testata) in `src/lib/ricette/`.

- **Porzioni:** il selettore ricalcola lista e dosi degli step con `calcolaDose()` (`dosi.ts`); unità e nomi si accordano al plurale («2 cucchiai», «3 uova»).
- **Timer:** `trovaTempi()` (`tempi.ts`) trasforma i tempi del procedimento in pulsanti; se lo step ha `timer[]` si usano solo quelli. Più timer insieme, riquadro fluttuante con Pausa / +1 min / Reset, allarme Web Audio e titolo della scheda che avvisa.
- **Schermo acceso:** Screen Wake Lock, richiesto di nuovo al ritorno sulla scheda.
- **Video:** solo i Video `pronti` (o senza stato), player Bunny caricato al clic sull'anteprima.
- **SEO:** metadati e Open Graph da `seo` con ripiego su titolo/descrizione/immagine, JSON-LD `Recipe`. Impostare `NEXT_PUBLIC_SERVER_URL` in produzione.
- **Bozze:** chi è entrato nell'admin vede l'anteprima delle bozze (marcata e `noindex`).
- La pagina è renderizzata a ogni richiesta (`force-dynamic`): le modifiche si vedono subito.
