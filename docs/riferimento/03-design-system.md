> **Nota:** documento importato dal repository `a-casolino/micimetto` (sito WordPress + Bricks, ora archiviato) il 15 Novembre 2026. Descrive il sito WordPress e le specifiche scritte per quella piattaforma: vale come riferimento per prodotto, modello dati, design e lezioni dall'audit. Le scelte di stack sono superate dall'[ADR-002](../adr/002-migrazione-payload-nextjs.md).

# 03 — Design System ed Evoluzione Visiva

## 1. Filosofia Estetica
Manteniamo l'identità calda e familiare di **Mi ci metto**, evolvendola verso uno stile **editoriale contemporaneo**: più respiro tra le sezioni, gerarchia tipografica netta, contrasti accessibili (WCAG AA) e controlli interattivi progettati per essere usati in cucina (anche con una mano sola o a distanza dal piano di lavoro).

---

## 2. Palette Colori (CSS Custom Properties)

```css
:root {
  /* Brand Primary — Bordeaux / Vino */
  --mcm-primary: #77002e;
  --mcm-primary-hover: #5c0023;
  --mcm-primary-light: #9e1b4e;

  /* Brand Secondary & Accents — Rosa Caldo */
  --mcm-surface-rose: #fce8ef;
  --mcm-surface-rose-strong: #f4c2d7;
  --mcm-surface-cream: #fffbfc;

  /* Neutrals */
  --mcm-text-main: #1e1e20;
  --mcm-text-muted: #5a5558;
  --mcm-border: #eadce1;
  --mcm-bg: #ffffff;

  /* Semantic Status (Timer, Wake Lock, Fit Index) */
  --mcm-success: #1f7a4c;
  --mcm-success-bg: #e6f5ed;
  --mcm-warning: #b45309;
  --mcm-warning-bg: #fef3c7;

  /* Elevations & Radius */
  --mcm-radius-sm: 8px;
  --mcm-radius-md: 16px;
  --mcm-radius-lg: 24px;
  --mcm-radius-pill: 9999px;
  --mcm-shadow-card: 0 8px 24px -4px rgba(119, 0, 46, 0.08);
  --mcm-shadow-floating: 0 12px 32px -4px rgba(30, 30, 32, 0.18);
}
```

---

## 3. Tipografia
- **Heading Font:** `Sora` (pesi `600`, `700`) — geometrico, moderno, ad alta leggibilità anche a distanza.
- **Body Font:** `Noto Sans` (pesi `400`, `500`, `600`) — nitido per liste di ingredienti, frazioni numeriche e istruzioni lunghe.
- **Numeri Tabulari (`font-variant-numeric: tabular-nums`):** applicato a tutte le quantità degli ingredienti, al selettore porzioni e ai countdown dei timer, per evitare oscillazioni del layout durante l'aggiornamento dei numeri.

---

## 4. Evoluzione dei Componenti Principali

### 4.1 Header & Navigazione Responsive
- **Desktop (`>= 992px`):** Logo a sinistra, link principali visibili in orizzontale (`Ricette`, `Svuotafrigo`, `Invia ricetta`, `Chi sono`), barra di ricerca rapida espandibile a destra.
- **Mobile (`< 992px`):** Logo, pulsante ricerca rapida e menu drawer fluido.

### 4.2 Scheda Ricetta (Recipe Card)
- Immagine con aspect ratio costante (`4:3` o `16:10`), zoom delicato in hover.
- Badge sovrapposti: Categoria + Tempo totale (`Prep + Cottura`) + Indice Fit.
- Titolo in `Sora` + anteprima rapida della difficoltà/golosità.

### 4.3 Barra Strumenti Cucina (Sticky Action Bar sulla Ricetta)
Una barra compatta ed elegante che raggruppa gli strumenti operativi della ricetta:
1. **Toggle "Schermo attivo" (Wake Lock):** switch stile iOS con pallino luminoso verde quando attivo.
2. **Selettore Porzioni (`-` `4 porzioni` `+`):** sempre a portata di mano, con pulsante "Reset" se modificato rispetto alla dose originale.
3. **Pulsante "Avvia Modalità Cucina":** apre la vista full-screen step-by-step.
4. **Pulsante "Ingredienti" (Mobile Bottom Sheet / Drawer):** invece di una linguetta laterale che può coprire il testo, su mobile può essere richiamato dalla sticky bar inferiore o laterale aprendo un pannello chiaro e leggibile con checkbox per spuntare gli ingredienti già pesati (`mise en place`).
