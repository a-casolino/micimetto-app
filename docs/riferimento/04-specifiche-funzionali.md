> **Nota:** documento importato dal repository `a-casolino/micimetto` (sito WordPress + Bricks, ora archiviato) il 15 Novembre 2026. Descrive il sito WordPress e le specifiche scritte per quella piattaforma: vale come riferimento per prodotto, modello dati, design e lezioni dall'audit. Le scelte di stack sono superate dall'[ADR-002](../adr/002-migrazione-payload-nextjs.md).

# 04 — Specifiche Funzionali (Nuovi Moduli e Refactoring)

Questo documento definisce il comportamento dettagliato delle funzionalità richieste per il refactoring di **Mi ci metto**.

---

## 1. Ricalcolo Dinamico delle Dosi (Portion Scaler)

### Obiettivo
Permettere a chi cucina di aumentare o diminuire il numero di porzioni (`+` / `-`) aggiornando istantaneamente le quantità:
- Nella **lista ingredienti principale** (`.mainIngredienti`)
- Nel **drawer/pannello ingredienti fluttuante**
- Nei **badge ingredienti di ogni singolo step** della preparazione

### Comportamento Tecnico
1. Ogni quantità numerica viene renderizzata nel DOM con attributi data:
   ```html
   <span class="mcm-qty" data-base-qty="250" data-unit="g">250</span>
   ```
   *(In alternativa, se il campo nel backend è una stringa unica come `"250g di farina"`, un parser intelligente separa il numero iniziale `250` dal resto del testo all'avvio della pagina).*
2. Quando l'utente cambia le porzioni da $P_{\text{base}}$ a $P_{\text{target}}$, ogni quantità viene ricalcolata secondo:
   $$Q_{\text{target}} = Q_{\text{base}} \times \frac{P_{\text{target}}}{P_{\text{base}}}$$
3. **Arrotondamento intelligente da cucina:**
   - Quantità in grammi/ml `> 10`: arrotondamento all'intero (o multiplo di 5 sopra i 100g).
   - Quantità piccole (`< 10`, es. cucchiaini, uova, bustine): fino a 1 decimale o frazione leggibile (`0.5` → `½`, `0.25` → `¼`).
   - Dosi non numeriche (*"q.b."*, *"un pizzico"*) restano invariate.

---

## 2. Ricerca Istantanea & Filtro "Svuotafrigo" Multi-Ingrediente

### Obiettivo
Trasformare la sezione di scoperta ricette in un vero strumento interattivo:
1. **Ricerca testuale live:** digitando *"ciambelline"* o *"tonno"* compaiono subito i risultati senza ricaricare la pagina.
2. **Modalità "Svuotafrigo" (Multi-select ingredienti):**
   - L'utente può cliccare su più pillole ingrediente contemporaneamente (es. `uova` + `farina`).
   - Le ricette vengono filtrate mostrando in cima quelle che contengono **tutti** gli ingredienti selezionati (o il maggior numero di match, indicando chiaramente *"Hai 3 ingredienti su 4"*).
3. **Filtri combinabili:**
   - Categoria (*Primi*, *Secondi*, *Dessert*...)
   - Indice Fit (*Leggero*, *Equilibrato*, *Sostanzioso*)
   - Tempo massimo di preparazione.

---

## 3. Timer Cliccabili negli Step + Screen Wake Lock Affidabile

### 3.1 Timer Integrati nei Passaggi
- **Rilevamento automatico:** Il modulo JS analizza il testo degli step alla ricerca di pattern temporali italiani (es. `10 minuti`, `15 min`, `2 ore`, `30-35 minuti`, `45 secondi`) oppure legge un campo dedicato dello step.
- **Trasformazione UI:** L'espressione temporale diventa un pulsante pillola interattivo: `⏱️ 10 min (Avvia timer)`.
- **Esecuzione:**
  - Cliccando sulla pillola parte un conto alla rovescia visibile sia dentro lo step sia in un mini-widget fluttuante in basso (così resta visibile anche scorrendo agli step successivi).
  - Supporta **Pausa / Riprendi / +1 min / Reset** e più timer simultanei.
  - Allo scadere: notifica visiva lampeggiante + allarme sonoro generato via **Web Audio API** (nessun file MP3 esterno da caricare, funziona anche offline).

### 3.2 Screen Wake Lock API (Fix + Miglioramento)
- Usa `navigator.wakeLock.request('screen')` con gestione stato pulita.
- Ri-attiva automaticamente il lock quando l'utente torna sulla tab (`document.addEventListener('visibilitychange', ...)`).
- Mostra un messaggio informativo discreto se il browser (es. vecchi webview o risparmio energetico estremo) blocca il Wake Lock.

---

## 4. Modalità "Cucina" (Full-Screen Cooking Mode)

### Obiettivo
Un'interfaccia dedicata a schermo intero pensata per quando si hanno le mani impegnate o sporche di farina:
- **Layout focalizzato:** mostra **un solo step alla volta** (es. *Step 2 di 6*) con caratteri grandi e ad alto contrasto.
- **Ingredienti dello step sempre in vista:** mostra subito le dosi (già ricalcolate per le porzioni scelte) necessarie per quello specifico passaggio, più un pulsante per aprire la lista completa.
- **Comandi giganti in basso:** pulsanti `← Precedente` e `Successivo →` alti almeno `64px` (facili da toccare anche con il nocca del dito), più supporto alle frecce della tastiera e allo swipe orizzontale su mobile.
- **Wake Lock automatico:** entrando in Modalità Cucina, lo schermo sempre attivo viene abilitato automaticamente.
- **Barra di progresso superiore:** indica chiaramente a che punto della ricetta ci si trova.

---

## 5. SEO & Dati Strutturati `Schema.org/Recipe`

Ogni pagina `/ricetta/[slug]/` genererà automaticamente nel `<head>` uno script `<script type="application/ld+json">` conforme alle linee guida Google Search Central per le ricette:
- `name`, `description`, `image`, `author`, `datePublished`
- `prepTime`, `cookTime`, `totalTime` in formato ISO 8601 (`PT30M`)
- `recipeYield` (porzioni)
- `recipeCategory` e `keywords`
- `recipeIngredient` (array completo di stringhe dose + ingrediente)
- `recipeInstructions` (array di oggetti `HowToStep` con `name`, `text`, `image`)
