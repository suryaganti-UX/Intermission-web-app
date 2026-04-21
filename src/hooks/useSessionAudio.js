/**
 * useSessionAudio — procedural Web Audio API sound engine
 * All sounds are synthesised in-browser. No files. No copyright.
 *
 * Per-mode philosophy:
 *   quiet   → layered healing-frequency drone pad (174 Hz solfeggio family)
 *             + soft pink-noise texture, slow LFO tremolo
 *   eye     → precise tick-tock at 1 s intervals (high/low triangle clicks)
 *             synced to a 60-BPM clock via the Web Audio scheduler
 *   breath  → two-oscillator resonant pad that swells on inhale and
 *             fades on exhale, self-timed to the 4-4-4-4 phase cycle
 *   stretch → 92-BPM groove: sub-kick + snare + hi-hat + ascending
 *             pentatonic melody (G major pentatonic)
 */

import { useRef, useEffect, useState, useCallback } from 'react'

const MASTER_VOL = 0.45

// ─────────────────────────────────────────────────────────────────────────────
// QUIET PAUSE  ·  Healing ambient drone
// ─────────────────────────────────────────────────────────────────────────────
function startQuietEngine(ctx, out) {
  const allNodes = []

  // Four stacked sine pads — solfeggio: 174 Hz root, plus octave/5th/M3
  const layers = [
    { freq: 174, vol: 0.065, detune:  0, lfoHz: 0.040, delay: 0.0 },
    { freq: 261, vol: 0.045, detune: -5, lfoHz: 0.028, delay: 1.2 },
    { freq: 348, vol: 0.035, detune:  4, lfoHz: 0.052, delay: 2.4 },
    { freq: 522, vol: 0.022, detune:  2, lfoHz: 0.018, delay: 3.8 },
  ]

  layers.forEach(({ freq, vol, detune, lfoHz, delay }) => {
    const osc      = ctx.createOscillator()
    const oscGain  = ctx.createGain()
    const filter   = ctx.createBiquadFilter()

    osc.type           = 'sine'
    osc.frequency.value = freq
    osc.detune.value   = detune

    filter.type           = 'lowpass'
    filter.frequency.value = freq * 5
    filter.Q.value        = 0.6

    oscGain.gain.setValueAtTime(0, ctx.currentTime)
    oscGain.gain.setTargetAtTime(vol, ctx.currentTime + delay, 3.5)

    osc.connect(filter)
    filter.connect(oscGain)
    oscGain.connect(out)
    osc.start()

    // Slow tremolo LFO
    const lfo     = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = lfoHz
    lfoGain.gain.value  = vol * 0.32
    lfo.connect(lfoGain)
    lfoGain.connect(oscGain.gain)
    lfo.start()

    allNodes.push(osc, lfo)
  })

  // Pink noise texture (Voss–McCartney approximation)
  const bufferSize = Math.ceil(ctx.sampleRate * 4)
  const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data       = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.96900 * b2 + w * 0.1538520
    b3 = 0.86650 * b3 + w * 0.3104856
    b4 = 0.55000 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.0168980
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) / 7
    b6 = w * 0.115926
  }

  const noiseSrc    = ctx.createBufferSource()
  noiseSrc.buffer   = buffer
  noiseSrc.loop     = true

  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type           = 'lowpass'
  noiseFilter.frequency.value = 280
  noiseFilter.Q.value        = 0.4

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0, ctx.currentTime)
  noiseGain.gain.setTargetAtTime(0.016, ctx.currentTime + 5, 2)

  noiseSrc.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(out)
  noiseSrc.start()

  return {
    stop() {
      allNodes.forEach(n => { try { n.stop() } catch (_) {} })
      noiseGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
      setTimeout(() => { try { noiseSrc.stop() } catch (_) {} }, 2000)
    },
    onBreathPhase: null,
    onBeat: null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EYE RESET  ·  Tick-tock clock at 60 BPM
// ─────────────────────────────────────────────────────────────────────────────
function startEyeEngine(ctx, out) {
  let stopped  = false
  let nextTime = ctx.currentTime + 0.2
  let tick     = 0
  let timerId  = null

  function playClick(freq, when, vol) {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type           = 'triangle'
    osc.frequency.value = freq

    // Sharp transient then silence
    gain.gain.setValueAtTime(vol, when)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.07)

    osc.connect(gain)
    gain.connect(out)
    osc.start(when)
    osc.stop(when + 0.1)
  }

  function schedule() {
    if (stopped) return
    const LOOKAHEAD = 0.14
    const INTERVAL  = 1.0 // 60 BPM = 1 beat per second

    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      if (tick % 2 === 0) {
        playClick(1150, nextTime, 0.24) // tick — high, crisp
      } else {
        playClick(860,  nextTime, 0.19) // tock — lower, softer
      }
      tick++
      nextTime += INTERVAL
    }
    timerId = setTimeout(schedule, 50)
  }

  schedule()

  return {
    stop() { stopped = true; if (timerId) clearTimeout(timerId) },
    onBreathPhase: null,
    onBeat: null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BREATHING RESET  ·  Resonant pad synced to 4-4-4-4 breath cycle
// ─────────────────────────────────────────────────────────────────────────────
function startBreathEngine(ctx, out) {
  // Root (A3 = 220 Hz) + perfect fifth (E4 = 330 Hz)
  const osc1  = ctx.createOscillator()
  const osc2  = ctx.createOscillator()
  const gain1 = ctx.createGain()
  const gain2 = ctx.createGain()

  osc1.type           = 'sine'
  osc1.frequency.value = 220
  osc2.type           = 'sine'
  osc2.frequency.value = 330

  gain1.gain.value = 0
  gain2.gain.value = 0

  // Add a gentle reverb via delay network
  const delay1       = ctx.createDelay(0.6)
  const delay2       = ctx.createDelay(0.4)
  const feedGain1    = ctx.createGain()
  const feedGain2    = ctx.createGain()
  const reverbOut    = ctx.createGain()

  delay1.delayTime.value = 0.38
  delay2.delayTime.value = 0.27
  feedGain1.gain.value   = 0.18
  feedGain2.gain.value   = 0.14
  reverbOut.gain.value   = 0.28

  // osc → gain → dry out + delay → feedback → delay (looped, safe gain < 0.5)
  osc1.connect(gain1)
  osc2.connect(gain2)
  gain1.connect(out)           // dry
  gain2.connect(out)
  gain1.connect(delay1)
  gain2.connect(delay2)
  delay1.connect(feedGain1)
  delay2.connect(feedGain2)
  feedGain1.connect(delay1)    // feedback loop
  feedGain2.connect(delay2)
  delay1.connect(reverbOut)
  delay2.connect(reverbOut)
  reverbOut.connect(out)

  osc1.start()
  osc2.start()

  let phaseIdx = 0
  let stopped  = false
  let timerId  = null

  // Mirror the breathing phases in SessionScreen (4 s each)
  const PHASES = [
    { name: 'inhale',   dur: 4000 },
    { name: 'hold-in',  dur: 4000 },
    { name: 'exhale',   dur: 4000 },
    { name: 'hold-out', dur: 4000 },
  ]

  function runPhase() {
    if (stopped) return
    const phase = PHASES[phaseIdx % 4]
    const now   = ctx.currentTime

    switch (phase.name) {
      case 'inhale':
        // Swell up — pitch rises slightly as lungs fill
        osc1.frequency.setTargetAtTime(265, now, 1.4)
        osc2.frequency.setTargetAtTime(397, now, 1.4)
        gain1.gain.setTargetAtTime(0.17, now, 1.2)
        gain2.gain.setTargetAtTime(0.09, now, 1.2)
        break
      case 'hold-in':
        // Sustain the held note — slight shimmer via tiny detune
        osc1.detune.setTargetAtTime(8, now, 1.0)
        osc2.detune.setTargetAtTime(-6, now, 1.0)
        break
      case 'exhale':
        // Fade out — pitch drops back below baseline
        osc1.frequency.setTargetAtTime(196, now, 1.4)  // G3
        osc2.frequency.setTargetAtTime(294, now, 1.4)  // D4
        osc1.detune.setTargetAtTime(0, now, 0.8)
        osc2.detune.setTargetAtTime(0, now, 0.8)
        gain1.gain.setTargetAtTime(0, now, 1.5)
        gain2.gain.setTargetAtTime(0, now, 1.5)
        break
      case 'hold-out':
        // Silence — reset pitch ready for next inhale
        osc1.frequency.setTargetAtTime(220, now, 0.3)
        osc2.frequency.setTargetAtTime(330, now, 0.3)
        break
      default:
        break
    }

    timerId = setTimeout(runPhase, phase.dur)
    phaseIdx++
  }

  runPhase()

  return {
    stop() {
      stopped = true
      if (timerId) clearTimeout(timerId)
      gain1.gain.setTargetAtTime(0, ctx.currentTime, 0.4)
      gain2.gain.setTargetAtTime(0, ctx.currentTime, 0.4)
      setTimeout(() => { try { osc1.stop(); osc2.stop() } catch (_) {} }, 2000)
    },
    onBreathPhase: null, // self-timed
    onBeat: null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STAND & STRETCH  ·  92-BPM groove: kick + snare + hihat + melody
// ─────────────────────────────────────────────────────────────────────────────
function startStretchEngine(ctx, out, onBeat) {
  let stopped  = false
  let nextBeat = ctx.currentTime + 0.12
  let beat     = 0
  let timerId  = null

  const BPM  = 92
  const BEAT = 60 / BPM // ≈ 0.652 s

  // Sub kick — pitch-dropping sine
  function playKick(when) {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(165, when)
    osc.frequency.exponentialRampToValueAtTime(42, when + 0.38)
    gain.gain.setValueAtTime(0.42, when)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.5)
    osc.connect(gain)
    gain.connect(out)
    osc.start(when)
    osc.stop(when + 0.6)
  }

  // Snare — bandpass-filtered noise burst
  function playSnare(when) {
    const bufSz = Math.ceil(ctx.sampleRate * 0.22)
    const buf   = ctx.createBuffer(1, bufSz, ctx.sampleRate)
    const d     = buf.getChannelData(0)
    for (let i = 0; i < bufSz; i++) d[i] = Math.random() * 2 - 1

    const src    = ctx.createBufferSource()
    src.buffer   = buf
    const filter = ctx.createBiquadFilter()
    filter.type           = 'bandpass'
    filter.frequency.value = 2800
    filter.Q.value        = 0.7
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.16, when)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.2)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(out)
    src.start(when)
  }

  // Closed hi-hat — high-passed noise
  function playHihat(when, vol = 0.07) {
    const bufSz = Math.ceil(ctx.sampleRate * 0.045)
    const buf   = ctx.createBuffer(1, bufSz, ctx.sampleRate)
    const d     = buf.getChannelData(0)
    for (let i = 0; i < bufSz; i++) d[i] = Math.random() * 2 - 1
    const src    = ctx.createBufferSource()
    src.buffer   = buf
    const filter = ctx.createBiquadFilter()
    filter.type           = 'highpass'
    filter.frequency.value = 6800
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(vol, when)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.045)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(out)
    src.start(when)
  }

  // G-major pentatonic: G3 A3 B3 D4 E4 G4 — ascending motif
  const MELODY = [392, 440, 494, 587, 659, 784, 659, 587]
  let mStep = 0

  function playNote(freq, when, dur) {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type           = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(0.058, when + 0.025)
    gain.gain.setTargetAtTime(0, when + dur * 0.65, 0.09)
    osc.connect(gain)
    gain.connect(out)
    osc.start(when)
    osc.stop(when + dur + 0.25)
  }

  function schedule() {
    if (stopped) return
    const LOOKAHEAD = 0.15

    while (nextBeat < ctx.currentTime + LOOKAHEAD) {
      const beatInBar = beat % 4

      // Kick on 1 and 3
      if (beatInBar === 0 || beatInBar === 2) {
        playKick(nextBeat)
        // Notify React of kick for orb pulse
        if (beatInBar === 0 && onBeat) {
          const delay = Math.max(0, (nextBeat - ctx.currentTime) * 1000)
          setTimeout(onBeat, delay)
        }
      }
      // Snare on 2 and 4
      if (beatInBar === 1 || beatInBar === 3) playSnare(nextBeat)
      // Hihat — every beat + eighth-note subdivision
      playHihat(nextBeat, beatInBar % 2 === 0 ? 0.08 : 0.05)
      playHihat(nextBeat + BEAT * 0.5, 0.04)

      // Melody — one ascending note every bar on beat 1
      if (beatInBar === 0) {
        playNote(MELODY[mStep % MELODY.length], nextBeat, BEAT * 1.6)
        mStep++
      }

      beat++
      nextBeat += BEAT
    }

    timerId = setTimeout(schedule, 50)
  }

  schedule()

  return {
    stop() { stopped = true; if (timerId) clearTimeout(timerId) },
    onBreathPhase: null,
    onBeat,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export default function useSessionAudio(breakId, { paused, enabled = true, onBeat }) {
  const ctxRef    = useRef(null)
  const engineRef = useRef(null)
  const masterRef = useRef(null)
  const [isMuted, setIsMuted] = useState(false)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  // Start engine on mount / breakId change
  useEffect(() => {
    if (!enabled) return

    const ctx    = getCtx()
    const master = ctx.createGain()
    master.gain.value = MASTER_VOL
    master.connect(ctx.destination)
    masterRef.current = master

    // Resume if browser suspended it (autoplay policy)
    ctx.resume().catch(() => {})

    let engine
    switch (breakId) {
      case 'quiet':   engine = startQuietEngine(ctx, master);           break
      case 'eye':     engine = startEyeEngine(ctx, master);             break
      case 'breath':  engine = startBreathEngine(ctx, master);          break
      case 'stretch': engine = startStretchEngine(ctx, master, onBeat); break
      default: break
    }
    engineRef.current = engine

    return () => {
      engine?.stop()
      master.disconnect()
      masterRef.current = null
      engineRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakId, enabled])

  // Pause / resume the AudioContext
  useEffect(() => {
    const ctx = ctxRef.current
    if (!ctx) return
    if (paused) ctx.suspend().catch(() => {})
    else        ctx.resume().catch(() => {})
  }, [paused])

  // Mute toggle
  const toggleMute = useCallback(() => {
    setIsMuted(m => {
      const next = !m
      const master = masterRef.current
      const ctx    = ctxRef.current
      if (master && ctx) {
        master.gain.setTargetAtTime(next ? 0 : MASTER_VOL, ctx.currentTime, 0.3)
      }
      return next
    })
  }, [])

  return { isMuted, toggleMute }
}
