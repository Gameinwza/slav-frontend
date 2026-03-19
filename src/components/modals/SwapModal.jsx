import React from 'react'

export default function SwapModal({ swapData, onClose }) {
  if (!swapData) return null

  return (
    <div className="modal-overlay">
      <div className="modal modal--swap">
        <h2 className="modal__title">🔀 การแลกไพ่</h2>
        <div className="swap-list">
          {swapData.map((s, i) => (
            <div key={i} className="swap-row">
              <span className="swap-row__from">{s.from}</span>
              <span className="swap-row__arrow">→</span>
              <span className="swap-row__to">{s.to}</span>
              <span className="swap-row__detail">{s.count} ใบ{s.type}</span>
            </div>
          ))}
        </div>
        <div className="modal__actions">
          <button className="btn btn--confirm" onClick={onClose}>รับทราบ</button>
        </div>
      </div>
    </div>
  )
}