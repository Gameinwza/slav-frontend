import React, { useEffect, useState } from 'react'

export default function TimerBar({ timeoutMs, isMyTurn, hasPassed, gameState }) {
  const [display, setDisplay] = useState({ remaining: 0, pct: 100 })

  useEffect(() => {
    if (!isMyTurn || hasPassed || !timeoutMs) return

    const total = Math.floor(timeoutMs / 1000)
    const startTime = Date.now()

    const iv = setInterval(() => {
      // Date.now() อยู่ใน callback ✅ ไม่ใช่ render body
      const elapsed   = Date.now() - startTime
      const remaining = Math.max(0, Math.floor((timeoutMs - elapsed) / 1000))
      const pct       = (remaining / total) * 100
      setDisplay({ remaining, pct }) // setState ใน callback ✅
      if (remaining <= 0) clearInterval(iv)
    }, 1000)

    return () => clearInterval(iv)
  }, [gameState?.turn, isMyTurn, hasPassed, timeoutMs])

  const { remaining, pct } = display
  if (!isMyTurn || hasPassed || remaining <= 0) return null

  const urgent  = remaining <= 30
  const warning = remaining <= 60

  return (
    <div className="timer-bar">
      <div className="timer-bar__track">
        <div
          className={[
            'timer-bar__fill',
            urgent  ? 'timer-bar__fill--urgent'  : '',
            warning ? 'timer-bar__fill--warning' : '',
          ].join(' ')}
          style={{ width: pct + '%' }}
        />
      </div>
      <span className={['timer-bar__text', urgent ? 'timer-bar__text--urgent' : ''].join(' ')}>
        ⏱ {remaining}s
      </span>
    </div>
  )
}