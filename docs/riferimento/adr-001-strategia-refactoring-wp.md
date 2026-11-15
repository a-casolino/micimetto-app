> **Nota:** copia storica dal repository `a-casolino/micimetto`. **Superato** dall'[ADR-002](../adr/002-migrazione-payload-nextjs.md).

# ADR 001 — Strategia di Refactoring su WordPress + Bricks (xCloud)

- **Stato:** Superato da ADR-002 (15 Novembre 2026)
- **Data:** 14 Novembre 2026
- **Decisori:** Antonio Casolino

---

## Contesto e Problema

Il sito **Mi ci metto** (`https://micimetto.acasolino.com`) è attualmente pubblicato su hosting **xCloud** ed è basato su **WordPress + Bricks Builder** con un tema child (`bricks-child`).
Dall'audit iniziale sono emersi bug JavaScript bloccanti (Screen Wake Lock non funzionante, errori in console sulle pagine non-ricetta), rotte mancanti (`/ricette/` in 404), assenza di ricerca UI, filtri limitati a un singolo ingrediente, assenza di markup `Schema.org/Recipe` e opportunità di miglioramento dell'esperienza in cucina.

Si sono valutate tre opzioni architetturali:
1. Migrazione completa a uno stack statico/SSR esterno (Astro / Next.js).
2. Architettura Headless WordPress (WP come backend API + frontend Astro/Next.js).
3. **Refactoring approfondito mantenendo WordPress + Bricks su xCloud**, versione controllata via Git.

---

## Decisione

Si è scelto di **mantenere l'infrastruttura WordPress + Bricks su xCloud** e la **bacheca WordPress classica** per l'inserimento dei contenuti, eseguendo un refactoring completo del codice custom (`bricks-child`), del Design System e dei template, con l'aggiunta di 4 moduli interattivi:
1. Ricalcolo dinamico delle porzioni (lista principale + singoli step).
2. Ricerca istantanea e filtro multi-ingrediente "Svuotafrigo" combinato con Categoria e Indice Fit.
3. Timer cliccabili dentro gli step di preparazione + Screen Wake Lock API funzionante.
4. Modalità "Cooking Mode" a schermo intero step-by-step.

---

## Motivazioni
- **Continuità operativa:** L'infrastruttura su xCloud è già attiva, performante e configurata; la bacheca WordPress permette di gestire ricette, media e tassonomie senza dover introdurre un secondo hosting o pipeline di build esterne.
- **Separazione delle responsabilità:** Spostando tutta la logica applicativa (JS, CSS, endpoint REST per i filtri, SEO JSON-LD) in file strutturati dentro il repository Git (`wp-content/themes/bricks-child/`), otteniamo la pulizia e la manutenibilità di una web app moderna pur restando dentro WordPress.
- **Zero costi aggiuntivi:** Nessun servizio esterno o database terzo necessario.
