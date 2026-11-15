> **Nota:** documento importato dal repository `a-casolino/micimetto` (sito WordPress + Bricks, ora archiviato) il 15 Novembre 2026. Descrive il sito WordPress e le specifiche scritte per quella piattaforma: vale come riferimento per prodotto, modello dati, design e lezioni dall'audit. Le scelte di stack sono superate dall'[ADR-002](../adr/002-migrazione-payload-nextjs.md).

# 01 — Audit dello Stato Attuale (`micimetto.acasolino.com`)

**Data Audit:** 14 Novembre 2026  
**URL analizzato:** `https://micimetto.acasolino.com`  
**Stack rilevato:** WordPress + Bricks Builder (`bricks` + `bricks-child`) su hosting xCloud

---

## 1. Punti di Forza Attuali
- **Proposta di valore chiara:** Niente pubblicità invasiva, focus sull'esperienza reale ai fornelli.
- **Ingredienti contestuali per singolo step:** Mostrare le dosi necessarie direttamente a fianco di ogni passaggio della preparazione è un'ottima intuizione UX.
- **Cassetto rapido ingredienti (`.ingredientiButton`):** Permette di consultare gli ingredienti senza dover scorrere fino a inizio pagina.
- **Identità cromatica riconoscibile:** Accostamento tra Bordeaux intenso (`#77002e`), Rosa chiaro (`#fce8ef` / `#f4c2d7`) e tipografia `Sora` + `Noto Sans`.

---

## 2. Bug Tecnici Rilevati

### 2.1 Errore JavaScript bloccante su tutte le pagine non-ricetta
- **File:** `wp-content/themes/bricks-child/js/custom.js` (riga 8)
- **Errore:** `Uncaught TypeError: Cannot read properties of null (reading 'getBoundingClientRect')`
- **Causa:** Lo script cerca immediatamente `.ingredientiButton` e `.mainIngredienti` e registra un listener su `scroll` senza verificare che gli elementi esistano nel DOM della pagina corrente.

### 2.2 Funzione "Schermo sempre attivo" (Screen Wake Lock) non funzionante
- **File:** `wp-content/themes/bricks-child/js/custom.js` (riga 66)
- **Errore:** `Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')`
- **Causa:** Lo script tenta di agganciare gli eventi a `document.querySelector(".off")` e `.on`, ma i pulsanti generati dal template Bricks non espongono quelle classi CSS. Di conseguenza il Wake Lock non si attiva mai.
- **Limiti aggiuntivi:** Quando una scheda va in background o il browser rilascia il lock (`visibilitychange`), il Wake Lock va richiesto nuovamente; manca inoltre un feedback chiaro qualora il browser/dispositivo non supporti `navigator.wakeLock`.

### 2.3 Rotta `/ricette/` in errore 404
- Nelle pagine di dettaglio ricetta (`/ricetta/[slug]/`), i breadcrumb mostrano `Home > Ricette > [Titolo]`.
- Cliccando su `Ricette` (`/ricette/`) si ottiene una pagina **404 Not Found** perché manca un template di archivio associato all'archivio del Custom Post Type o una pagina dedicata.

### 2.4 Contatore animato in Homepage
- Il testo `"Abbiamo pubblicato [X] ricette!"` usa un contatore animato che passa per `1 ricette` (errore grammaticale singolare/plurale) e con poche ricette pubblicate risulta poco incisivo rispetto a una hero orientata alla ricerca o all'esplorazione.

---

## 3. Criticità UI/UX e Contenuti

1. **Assenza di una barra di ricerca nell'interfaccia:**
   - Il template di ricerca WordPress/Bricks (`/?s=...`) esiste e funziona, ma non c'è alcun input di ricerca nell'header, nel menu o nella homepage.
2. **Navigazione Desktop nascosta:**
   - Anche su schermi desktop ampi, la navigazione è relegata dentro un menu hamburger off-canvas ("Apri"), nascondendo le sezioni principali.
3. **Filtro "Svuotafrigo" a selezione singola:**
   - Attualmente i tag ingrediente in homepage portano semplicemente all'archivio del singolo ingrediente (`/ingrediente/farina/`). Chi cucina con ciò che ha in frigo ha bisogno di selezionare **più ingredienti contemporaneamente** (es. *uova + farina + tonno*) eventualmente filtrando anche per categoria o Indice Fit.
4. **Dosi statiche:**
   - Le porzioni sono indicate come testo statico (es. `40` o `2`). Se l'utente cucina per un numero diverso di persone, deve calcolare a mente sia la lista principale sia le frazioni nei singoli step.
5. **Glitch visivo nella pagina Contatti (`/contatti/`):**
   - Sopra il pulsante "Invia" viene renderizzato un rettangolo scuro vuoto.
6. **Refusi e incongruenze testuali:**
   - Homepage: *"Sei attentə **alle** linea?"* → *"alla linea"*.
   - Pagina About (`/about/`): *"...la **propa** cucina..."* → *"propria cucina"*; *"...**funzioanlità**..."* → *"funzionalità"*.
   - Pagina About: cita *"Attraverso il modulo in questa pagina puoi anche inviare la tua proposta"*, ma il modulo si trova su `/invia-la-tua-ricetta/`.

---

## 4. SEO, Structured Data e Compliance Legale

1. **Mancanza di `Schema.org/Recipe` (JSON-LD):**
   - Le pagine `/ricetta/[slug]/` non espongono il markup strutturato `Recipe` richiesto da Google per mostrare i Rich Snippet (foto, tempo di preparazione/cottura, porzioni, calorie/fit, ingredienti e passaggi `HowToStep`).
2. **Meta Tag Open Graph incompleti:**
   - Mancano `og:title`, `og:description`, `og:image` e `og:url` specifici per ogni ricetta (fondamentali quando si condivide una ricetta su WhatsApp, Telegram o social).
3. **Footer e GDPR:**
   - Il footer mostra solo `© 2026 | Mi ci metto`.
   - Mancano link a Privacy Policy / Cookie Policy e manca la checkbox di consenso privacy nei moduli "Contatti" e "Invia la tua ricetta".
