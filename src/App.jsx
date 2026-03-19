import React, { useState } from 'react'
import useSocket from './hooks/useSocket'
import Hand from './components/Hand'
import Table from './components/Table'
import PlayerBar from './components/PlayerBar'
import TimerBar from './components/TimerBar'
import ActionBar from './components/ActionBar'
import RankingModal from './components/modals/RankingModal'
import SwapModal from './components/modals/SwapModal'
import './App.css'

export default function App() {
  const [nickname, setNickname] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [joined, setJoined] = useState(false)

  const {
    connected, myId, players, hand, gameState,
    selected, notification, rankingData, swapData, gameAborted,
    isMyTurn, hasPassed,
    join, startGame, playAgain, pass, confirmPlay, toggleCard,
    canCardPlay, getPlayType,
  } = useSocket()

  function handleJoin() {
    if (!nickname.trim() || !roomInput.trim()) return
    join(roomInput.trim(), nickname.trim())
    setJoined(true)
  }

  // ── Lobby ──────────────────────────────────────────────
  if (!joined) {
    return (
      <div className="lobby">
        <div className="lobby__card">
          <div className="lobby__logo">🃏</div>
          <h1 className="lobby__title">Slave</h1>
          <p className="lobby__subtitle">Card Game</p>

          <div className="lobby__form">
            <input
              className="input"
              placeholder="ชื่อของคุณ"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={16}
            />
            <input
              className="input"
              placeholder="Room ID"
              value={roomInput}
              onChange={e => setRoomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={20}
            />
            <button className="btn btn--confirm btn--full" onClick={handleJoin}>
              เข้าร่วม
            </button>
          </div>

          <div className={`lobby__status ${connected ? 'lobby__status--ok' : ''}`}>
            {connected ? '🟢 เชื่อมต่อแล้ว' : '🔴 กำลังเชื่อมต่อ...'}
          </div>
        </div>
      </div>
    )
  }

  // ── Game ──────────────────────────────────────────────
  const firstTurn = gameState?.firstTurn || false
  const table     = gameState?.table || []

  const turnStatus = hasPassed
    ? '🚫 คุณ pass แล้ว'
    : isMyTurn
      ? firstTurn ? '🟢 ต้องลง 3♣ ก่อน!' : '🟢 ถึงเทิร์นของคุณ!'
      : '⏳ เทิร์นของ ' + (gameState?.turnName || '...')

  return (
    <div className={`game ${isMyTurn && !hasPassed ? 'game--my-turn' : ''}`}>

      {/* notification toast */}
      {notification && (
        <div className="toast">{notification}</div>
      )}

      {/* aborted banner */}
      {gameAborted && (
        <div className="banner banner--warn">{gameAborted}</div>
      )}

      {/* header */}
      <header className="game__header">
        <span className="game__logo">🃏 Slave</span>
        <span className="game__room">ห้อง: {roomInput}</span>
        <span className={`game__conn ${connected ? 'game__conn--ok' : ''}`}>
          {connected ? '●' : '○'}
        </span>
      </header>

      {/* players */}
      <PlayerBar players={players} gameState={gameState} myId={myId} />

      {/* turn status */}
      <div className="turn-status">{turnStatus}</div>

      {/* timer */}
      <TimerBar
        timeoutMs={gameState?.timeoutMs}
        isMyTurn={isMyTurn}
        hasPassed={hasPassed}
        gameState={gameState}
      />

      {/* table */}
      <Table table={table} getPlayType={getPlayType} />

      {/* hand */}
      <section className="game__hand-section">
        <div className="game__hand-label">
          ไพ่ในมือ <span className="game__hand-count">{hand.length} ใบ</span>
        </div>
        <Hand
          hand={hand}
          selected={selected}
          canCardPlay={canCardPlay}
          onToggle={toggleCard}
          disabled={!isMyTurn || hasPassed}
        />
      </section>

      {/* actions */}
      <ActionBar
        selected={selected}
        isMyTurn={isMyTurn}
        hasPassed={hasPassed}
        firstTurn={firstTurn}
        table={table}
        onConfirm={confirmPlay}
        onPass={pass}
      />

      {/* start button (ก่อนเกมเริ่ม) */}
      {!gameState && !gameAborted && players.length > 0 && (
        <div className="pregame">
          <p className="pregame__count">
            ผู้เล่น {players.length}/4 คน
          </p>
          {players.length === 4 && (
            <button className="btn btn--confirm btn--lg" onClick={startGame}>
              🃏 เริ่มเกม
            </button>
          )}
          {players.length < 4 && (
            <p className="pregame__waiting">รอผู้เล่นอีก {4 - players.length} คน...</p>
          )}
        </div>
      )}

      {/* modals */}
      <RankingModal
        ranking={rankingData}
        onPlayAgain={playAgain}
        onClose={() => {}}
      />
      <SwapModal
        swapData={swapData}
        onClose={() => {}}
      />
    </div>
  )
}