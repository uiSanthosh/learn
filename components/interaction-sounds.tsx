"use client"

import * as React from "react"

/**
 * Interaction sounds, ported from the Beautiful UI site: five tiny synthesized
 * sounds played on click, picked by what was clicked. Pure Web Audio, no files.
 *
 * - Only fires inside an element with class `bui` (the dashboard).
 * - Add `data-sound-silent` to a container to mute everything inside it.
 * - Override per element with `data-sound="press|tick|release|page|pulse"`.
 * - The on/off choice persists in localStorage under `bui-sounds`.
 */

type Layer = {
  source:
    | { type: "noise" }
    | { type: OscillatorType; frequency: number | [number, number] }
  filter?: { type: BiquadFilterType; frequency: number; q?: number }
  attack: number
  decay: number
  release?: number
  gain: number
}

const MASTER = 0.32

const SOUNDS: Record<string, Layer[]> = {
  press: [
    {
      source: { type: "noise" },
      filter: { type: "highpass", frequency: 2400 },
      attack: 0.0003,
      decay: 0.009,
      gain: 0.13,
    },
    {
      source: { type: "sine", frequency: 680 },
      attack: 0.0006,
      decay: 0.022,
      release: 0.008,
      gain: 0.24,
    },
  ],
  tick: [
    {
      source: { type: "square", frequency: 2100 },
      filter: { type: "bandpass", frequency: 2600, q: 1.6 },
      attack: 0.0004,
      decay: 0.028,
      gain: 0.24,
    },
  ],
  release: [
    {
      source: { type: "noise" },
      filter: { type: "lowpass", frequency: 1600, q: 0.9 },
      attack: 0.001,
      decay: 0.055,
      gain: 0.32,
    },
  ],
  page: [
    {
      source: { type: "sine", frequency: [430, 640] },
      attack: 0.002,
      decay: 0.11,
      release: 0.03,
      gain: 0.4,
    },
  ],
  pulse: [
    {
      source: { type: "sine", frequency: 330 },
      filter: { type: "lowpass", frequency: 2200 },
      attack: 0.002,
      decay: 0.13,
      release: 0.04,
      gain: 0.5,
    },
  ],
}

const CLOSE = /close|dismiss|remove|delete|collapse|cancel|clear/i
const CONFIRM = /send|save|submit|calculate|create|add|upgrade|replay/i
const INTERACTIVE =
  "button,a[href],input:not([type='hidden']),select,textarea,summary,[role='button'],[role='checkbox'],[role='menuitem'],[role='menuitemcheckbox'],[role='menuitemradio'],[role='option'],[role='radio'],[role='switch'],[role='tab']"

function pickSound(el: Element): keyof typeof SOUNDS {
  const forced = el.getAttribute("data-sound")
  if (forced && forced in SOUNDS) return forced
  const text =
    `${el.getAttribute("aria-label") ?? ""} ${el.textContent ?? ""}`.trim()
  if (CLOSE.test(text)) return "release"
  if (
    el.matches(
      "input[type='checkbox'], input[type='radio'], select, [role='checkbox'], [role='radio'], [role='switch'], [role='tab'], [aria-pressed]"
    )
  )
    return "tick"
  if (el.matches("a[href]")) return "page"
  if (CONFIRM.test(text)) return "pulse"
  if (el.matches("input, textarea")) return "tick"
  return "press"
}

export const SOUND_KEY = "bui-sounds"
export const readSoundsEnabled = () => {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off"
  } catch {
    return true
  }
}

let ctx: AudioContext | null = null
let noise: AudioBuffer | null = null

function play(name: string) {
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  if (!AC) return
  ctx ??= new AC()
  if (ctx.state === "suspended") void ctx.resume()
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const t0 = ctx.currentTime
  for (const l of SOUNDS[name]) {
    const total = l.attack + l.decay + (l.release ?? 0)
    let node: AudioScheduledSourceNode
    if (l.source.type === "noise") {
      const s = ctx.createBufferSource()
      s.buffer = noise
      s.loop = true
      node = s
    } else {
      const o = ctx.createOscillator()
      o.type = l.source.type
      const f = l.source.frequency
      if (Array.isArray(f)) {
        o.frequency.setValueAtTime(f[0], t0)
        o.frequency.exponentialRampToValueAtTime(f[1], t0 + total)
      } else o.frequency.value = f
      node = o
    }
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t0)
    env.gain.linearRampToValueAtTime(l.gain * MASTER, t0 + l.attack)
    env.gain.exponentialRampToValueAtTime(
      0.0001,
      t0 + l.attack + l.decay + (l.release ?? 0.01)
    )
    let last: AudioNode = node
    if (l.filter) {
      const bq = ctx.createBiquadFilter()
      bq.type = l.filter.type
      bq.frequency.value = l.filter.frequency
      bq.Q.value = l.filter.q ?? 1
      node.connect(bq)
      last = bq
    }
    last.connect(env)
    env.connect(ctx.destination)
    node.start(t0)
    node.stop(t0 + total + 0.05)
  }
}

export function InteractionSounds() {
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!readSoundsEnabled() || !(e.target instanceof Element)) return
      if (!e.target.closest(".bui")) return
      const el = e.target.closest(INTERACTIVE)
      if (!el || el.closest("[data-sound-silent]")) return
      if (el.matches(":disabled, [aria-disabled='true']")) return
      play(pickSound(el))
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])
  return null
}

/** Speaker button that turns interaction sounds on or off. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const [on, setOn] = React.useState(true)
  React.useEffect(() => {
    // localStorage is only readable on the client, so sync it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(readSoundsEnabled())
  }, [])
  return (
    <button
      type="button"
      data-sound-silent
      aria-pressed={on}
      aria-label={on ? "Mute interface sounds" : "Turn on interface sounds"}
      title={on ? "Sounds on" : "Sounds off"}
      onClick={() => {
        const next = !on
        setOn(next)
        try {
          localStorage.setItem(SOUND_KEY, next ? "on" : "off")
        } catch {}
        if (next) play("tick")
      }}
      className={`flex size-8 items-center justify-center rounded-full text-ink-2 shadow-btn transition-colors hover:bg-hover ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 5a10 10 0 0 1 0 14" />
          </>
        ) : (
          <>
            <path d="m22 9-6 6" />
            <path d="m16 9 6 6" />
          </>
        )}
      </svg>
    </button>
  )
}
