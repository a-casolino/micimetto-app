> **Nota:** documento importato dal repository `a-casolino/micimetto` (sito WordPress + Bricks, ora archiviato) il 15 Novembre 2026. Descrive il sito WordPress e le specifiche scritte per quella piattaforma: vale come riferimento per prodotto, modello dati, design e lezioni dall'audit. Le scelte di stack sono superate dall'[ADR-002](../adr/002-migrazione-payload-nextjs.md).

# 02 — Architettura e Stack Tecnologico

## 1. Panoramica dell'Infrastruttura (Verificata via xCloud MCP & SSH)
- **Hosting Provider:** xCloud su server **Hetzner** (`188.245.124.117`, location `fsn1`, Ubuntu 22.04.5)
- **Web Server & Caching:** OpenLiteSpeed + LiteSpeed Cache + Redis Object Cache (`object-cache.php`)
- **Database & Runtime:** MySQL 8.0.46 + PHP 8.3 / 8.5 (`lsphp`) + WP-CLI 2.11.0
- **Sito WordPress:** `micimetto.acasolino.com` (UUID xCloud: `a1bd29b7-ce8e-47fc-868c-2785e8932c8c`, System User: `micimetto`, Web Root: `/var/www/micimetto.acasolino.com`)
- **Visual Builder & Theme Engine:** Bricks Builder (`bricks` parent theme) + `bricks-child`
- **Data Modeling Plugin:** **Advanced Custom Fields PRO (v6.8.11)**
- **SEO & Utility Plugins:** Rank Math SEO, HappyFiles Pro, Admin Columns Pro, TinyPNG, WP Mail SMTP Pro.

---

## 2. Modello Dati ACF PRO (Esportato in `exports/acf-schema-export.json`)

### 2.1 Custom Post Type: `ricetta` (`post_type_64206f3074822`, ID: `20`)
- **Slug singolo:** `/ricetta/[post-name]/`
- **Archivio:** `has_archive: true`, `has_archive_slug: "ricette"` *(Nota: il template Bricks `Archivi` ID `82` va associato anche all'archivio del post type `ricetta` per risolvere il 404 su `/ricette/`)*.

### 2.2 Tassonomie Associate a `ricetta`
1. **Categorie (`categoria-ricetta` — `taxonomy_64226eae841a5`, ID: `66`):** gerarchica (es. *Primo*, *Dessert*).
2. **Ingredienti (`ingrediente` — `taxonomy_6420775dcc153`, ID: `37`):** non gerarchica, collegata anche al selettore ingrediente nelle sub-ricette.
3. **Indici Fit (`indice-fit` — `taxonomy_65e5c2bb4a2d9`, ID: `742`):** gerarchica (es. *Leggero*, *Equilibrato*, *Sostanzioso*).
4. **Occasioni (`occasione` — `taxonomy_642ac6625fd30`, ID: `223`):** gerarchica (es. *Carnevale*).

### 2.3 Gruppi di Campi ACF (`acf-field-group`)

#### A. Gruppo 1: `Dettagli ricetta` (`group_6423d664c12c1`, ID: `108`)
| Nome Campo (`name`) | Key ACF | Tipo | Append / Range | Descrizione |
| :--- | :--- | :--- | :--- | :--- |
| `tempo` | `field_6423d7643d02f` | `number` | `minuti` | Tempo di preparazione |
| `cottura` | `field_6428985556b1a` | `number` | `minuti` | Tempo di cottura |
| `difficolta` | `field_6423d665ace69` | `number` | `1-100` (`/100`) | Difficoltà della ricetta |
| `valutazione` | `field_642897e7676ca` | `number` | `0-100` (`/100`) | Indice di golosità / valutazione |

#### B. Gruppo 2: `Lista ingredienti generale` (`group_642070167f83a`, ID: `22`)
- **`dosi_per`** (`field_642899e638326`, `text`): numero/testo delle porzioni base (es. `"40"` o `"2 persone"`).
- **`ingredienti_main`** (`field_642070163b041`, `repeater` — gruppi/subricette):
  - `subricetta` (`field_643d8b2bb7908`, `true_false`): indica se il gruppo ha un sottotitolo dedicato.
  - `titolo_subricetta` (`field_643d8a5cb7907`, `text`): titolo del gruppo (es. *"Per l'impasto"*).
  - `ingredienti_sub` (`field_643d8bdac2e51`, `repeater`):
    - `dose_ingrediente_sub` (`field_643d8c07c2e52`, `text`): es. `"500 g"`, `"2 cucchiai"`, `"q.b."`.
    - `nome_ingrediente_sub` (`field_643d8c18c2e53`, `taxonomy` → `ingrediente`, return `id`): ID del termine tassonomia ingrediente.

#### C. Gruppo 3: `Procedimento` (`group_64312a2d732ad`, ID: `254`)
- **`introduzione`** (`field_6437c0a8c200a`, `wysiwyg`): testo introduttivo della ricetta.
- **`step`** (`field_64312a2d9490b`, `repeater`):
  - `ingredienti-step` (`field_64312a849490c`, `repeater`):
    - `ingrediente-step` (`field_64312b009490d`, `text`): nome ingrediente usato nello step.
    - `quantita-ingrediente-step` (`field_64312b129490e`, `text`): quantità usata nello step (es. `"500 g"`).
  - `procedimento` (`field_64312b7cb28b2`, `wysiwyg`): testo descrittivo del passaggio.
  - `tip` (`field_643aafbc5b00f`, `wysiwyg`): consiglio facoltativo per lo step.
  - `step_single_image` (`field_67c5e3dcb7eac`, `image` array): immagine singola dello step.
  - `step_gallery` (`field_65e2f1ecd9a2a`, `gallery` array): galleria immagini dello step.
  - `step_videos` (`field_67baee997d50c`, `repeater`):
    - `step_video_id` (`field_67bb3a7e76d73`, `text`): YouTube Video ID.

---

## 3. Template Bricks Builder (Esportati in `exports/bricks-templates-export.json`)

| ID Post | Titolo | Slug | Tipo |
| :--- | :--- | :--- | :--- |
| `15` | Header | `header` | `bricks_template` (`header`) |
| `190` | Footer | `footer` | `bricks_template` (`footer`) |
| `46` | Singola ricetta | `singola-ricetta` | `bricks_template` (`single`) |
| `82` | Archivi | `archivi` | `bricks_template` (`archive`) |
| `1023` | Pagina | `pagina` | `bricks_template` (`single`) |
| `202` | Home | `home` | `page` |
| `980` | About | `about` | `page` |
| `982` | Contatti | `contatti` | `page` |
| `984` | Invia la tua ricetta | `invia-la-tua-ricetta` | `page` |
