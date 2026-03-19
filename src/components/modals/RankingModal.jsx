import React from 'react'

export default function RankingModal({ ranking, onPlayAgain, onClose }) {
  if (!ranking) return null

  return (
    <div className="modal-overlay">
      <div className="modal modal--ranking">
        <h2 className="modal__title">🏆 จบรอบ!</h2>

        <div className="ranking-list">
          {ranking.map((r) => (
            <div key={r.id} className={`ranking-row ranking-row--${r.rank}`}>
              <span className="ranking-row__label">{r.label}</span>
              <span className="ranking-row__name">{r.name}</span>
            </div>
          ))}
        </div>

        {ranking.length >= 4 && (
          <div className="ranking-swap-preview">
            รอบหน้า: <strong>{ranking[3].name}</strong> ให้ไพ่ดีสุด 2 ใบแก่ <strong>{ranking[0].name}</strong>
          </div>
        )}

        <div className="modal__actions">
          <button className="btn btn--confirm" onClick={onPlayAgain}>🔄 เล่นอีกรอบ</button>
          <button className="btn btn--pass" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  )
}