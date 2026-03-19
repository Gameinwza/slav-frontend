import React from 'react'
import Card from './Card'

const TYPE_LABEL = { single:'เดี่ยว', pair:'คู่', tong:'ตอง ✨', quad:'4 ใบ 💥' }

export default function Table({ table, getPlayType }) {
  const lastPlay = table?.length ? table[table.length - 1] : null
  const playType = lastPlay ? getPlayType(lastPlay) : null

  return (
    <div className="table-area">
      <div className="table-area__label">
        {playType ? TYPE_LABEL[playType] || '' : 'โต๊ะว่าง'}
      </div>

      <div className="table-area__cards">
        {lastPlay
          ? lastPlay.map(card => (
              <Card
                key={card.value + card.suit}
                card={card}
                disabled
              />
            ))
          : <span className="table-area__empty">—</span>
        }
      </div>
    </div>
  )
}