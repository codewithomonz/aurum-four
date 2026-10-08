import { useState } from 'react'
import { PALETTE, useGame } from '../store'
import type { Pair } from '../store'

export default function Setup() {
  const { names, colors, start } = useGame()
  const [n, setN] = useState<Pair<string>>(names)
  const [c, setC] = useState<Pair<string>>(colors)

  const pickColor = (i: 0 | 1, color: string) =>
    setC((prev) => {
      const next: Pair<string> = [...prev]
      const other = (1 - i) as 0 | 1
      if (next[other] === color) next[other] = prev[i] // swap so colors stay distinct
      next[i] = color
      return next
    })

  const setName = (i: 0 | 1, v: string) =>
    setN((prev) => {
      const next: Pair<string> = [...prev]
      next[i] = v
      return next
    })

  return (
    <form
      className="glass mx-auto flex w-[min(92vw,520px)] flex-col gap-6 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault()
        start([n[0].trim() || 'Player 1', n[1].trim() || 'Player 2'], c)
      }}
    >
      <div>
        <h1 className="font-display text-5xl sm:text-6xl">Drop Duel</h1>
        <p className="mt-2" style={{ color: 'var(--muted)' }}>
          Two players, one screen. Connect four discs in a row to win.
        </p>
      </div>

      {([0, 1] as const).map((i) => (
        <fieldset key={i} className="flex flex-col gap-3 border-0 p-0">
          <label htmlFor={`name-${i}`} className="font-bold">Player {i + 1} name</label>
          <input
            id={`name-${i}`}
            value={n[i]}
            maxLength={14}
            onChange={(e) => setName(i, e.target.value)}
            className="min-h-11 rounded-2xl border px-4 text-lg"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <div role="radiogroup" aria-label={`Player ${i + 1} color`} className="flex gap-3">
            {PALETTE.map((color, idx) => (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={c[i] === color}
                aria-label={`Color ${idx + 1}`}
                onClick={() => pickColor(i, color)}
                className="size-11 cursor-pointer rounded-full border-0 transition-transform hover:scale-110"
                style={{
                  background: color,
                  boxShadow: c[i] === color ? `0 0 0 3px var(--bg), 0 0 0 6px ${color}` : 'none',
                }}
              />
            ))}
          </div>
        </fieldset>
      ))}

      <button type="submit" className="btn btn-primary text-lg">Start game</button>
    </form>
  )
}