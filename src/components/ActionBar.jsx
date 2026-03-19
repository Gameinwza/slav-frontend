import React from 'react'
import { getPlayType, isValidMove } from '../hooks/useSocket'

const TYPE_LABEL = { single:'เดี่ยว', pair:'คู่', tong:'ตอง ✨', quad:'4 ใบ 💥' }

export default function ActionBar({ selected, isMyTurn, hasPassed, firstTurn, table, onConfirm, onPass }) {
  const count    = selected.length
  const playType = getPlayType(selected)
  const canPlay  = isMyTurn && !hasPassed && playType !== 'invalid' && isValidMove(selected, table)

  let info = null
  if (!isMyTurn)       info = null
  else if (hasPassed)  info = { type: 'muted', text: '🚫 คุณ pass แล้ว — รอรอบใหม่' }
  else if (firstTurn)  info = { type: 'hint',  text: '🃏 ต้องเปิดด้วย 3♣ ก่อน!' }
  else if (count === 0) info = null
  else if (playType === 'invalid') info = { type: 'warn', text: '⚠️ เลือก 1 / คู่ 2 / ตอง 3 / 4 ใบ ค่าเดียวกัน' }
  else if (!canPlay)   info = { type: 'warn', text: '❌ ' + (TYPE_LABEL[playType]||'') + ' — ค่าน้อยเกินไป' }
  else                 info = { type: 'ok',   text: '✅ ' + (TYPE_LABEL[playType]||'') + ' — พร้อมลง' }

  return (
    <div className="action-bar">
      {info && (
        <div className={`action-bar__info action-bar__info--${info.type}`}>
          {info.text}
        </div>
      )}
      <div className="action-bar__buttons">
        {canPlay && (
          <button className="btn btn--confirm" onClick={() => onConfirm(selected)}>
            ลงไพ่
          </button>
        )}
        <button
          className="btn btn--pass"
          onClick={onPass}
          disabled={!isMyTurn || hasPassed || firstTurn}
        >
          PASS
        </button>
      </div>
    </div>
  )
}