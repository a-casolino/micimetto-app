/**
 * Allarme dei timer generato con la Web Audio API: nessun file audio da scaricare.
 * Il contesto audio va creato durante un gesto dell'utente (avvio del timer),
 * altrimenti i browser lo tengono sospeso.
 */

let ctx: AudioContext | null = null
let intervallo: number | null = null
let fermaDopo: number | null = null

export function preparaAudio(): void {
  if (typeof window === 'undefined') return
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
}

function bip(inizio: number, frequenza: number): void {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequenza
  gain.gain.setValueAtTime(0.0001, inizio)
  gain.gain.exponentialRampToValueAtTime(0.4, inizio + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, inizio + 0.25)
  osc.connect(gain).connect(ctx.destination)
  osc.start(inizio)
  osc.stop(inizio + 0.3)
}

function suona(): void {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume()
    const t = ctx.currentTime
    bip(t, 880)
    bip(t + 0.3, 880)
    bip(t + 0.6, 1175)
  }
  if ('vibrate' in navigator) navigator.vibrate?.([200, 100, 200])
}

/** Suona ogni 2 secondi per un minuto al massimo, o finché non si chiude il timer. */
export function avviaAllarme(): void {
  if (typeof window === 'undefined' || intervallo !== null) return
  suona()
  intervallo = window.setInterval(suona, 2000)
  fermaDopo = window.setTimeout(fermaAllarme, 60_000)
}

export function fermaAllarme(): void {
  if (intervallo !== null) window.clearInterval(intervallo)
  if (fermaDopo !== null) window.clearTimeout(fermaDopo)
  intervallo = null
  fermaDopo = null
}
