import React, { useState, useEffect } from 'react'
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
  const [nickname,  setNickname]  = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [joined,    setJoined]    = useState(false)
  const [joinError, setJoinError] = useState('')
  const [showSwap,  setShowSwap]  = useState(false)

  const {
    connected, myId, players, hand, gameState,
    selected, notification, rankingData, swapData, gameAborted,
    isMyTurn, hasPassed,
    join, leaveRoom, startGame, playAgain, pass, confirmPlay, toggleCard,
    canCardPlay, getPlayType,
  } = useSocket()

  // เปิด SwapModal อัตโนมัติเมื่อได้รับข้อมูล
  useEffect(() => {
    if (swapData) setShowSwap(true)
  }, [swapData])

  function handleJoin() {
    if (!nickname.trim() || !roomInput.trim()) return
    setJoinError('')
    join(
      roomInput.trim(),
      nickname.trim(),
      () => setJoined(true),
      (msg) => setJoinError(msg)
    )
  }

  function handleLeave() {
    leaveRoom()
    setJoined(false)
    setNickname('')
    setRoomInput('')
    setJoinError('')
    setShowSwap(false)
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
            {joinError && (
              <div className="banner--warn">{joinError}</div>
            )}
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

      {notification && <div className="toast">{notification}</div>}

      {/* aborted banner + ปุ่มกลับ */}
      {gameAborted && (
        <div className="banner banner--warn">
          {gameAborted}
          <button
            className="btn btn--pass"
            onClick={handleLeave}
            style={{ marginLeft: '12px', fontSize: '12px', padding: '4px 10px' }}
          >
            กลับหน้าหลัก
          </button>
        </div>
      )}

      {/* header + ปุ่มออก */}
      <header className="game__header">
        <span className="game__logo">🃏 Slave</span>
        <span className="game__room">ห้อง: {roomInput}</span>
        <button
          className="btn btn--pass"
          onClick={handleLeave}
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          ออก
        </button>
        <span className={`game__conn ${connected ? 'game__conn--ok' : ''}`}>
          {connected ? '●' : '○'}
        </span>
      </header>

      <PlayerBar players={players} gameState={gameState} myId={myId} />

      <div className="turn-status">{turnStatus}</div>

      <TimerBar
        timeoutMs={gameState?.timeoutMs}
        isMyTurn={isMyTurn}
        hasPassed={hasPassed}
        gameState={gameState}
      />

      <Table table={table} getPlayType={getPlayType} />

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

      <ActionBar
        selected={selected}
        isMyTurn={isMyTurn}
        hasPassed={hasPassed}
        firstTurn={firstTurn}
        table={table}
        onConfirm={confirmPlay}
        onPass={pass}
      />

      {!gameState && !gameAborted && players.length > 0 && (
        <div className="pregame">
          <p className="pregame__count">ผู้เล่น {players.length}/4 คน</p>
          {players.length === 4
            ? <button className="btn btn--confirm btn--lg" onClick={startGame}>🃏 เริ่มเกม</button>
            : <p className="pregame__waiting">รอผู้เล่นอีก {4 - players.length} คน...</p>
          }
        </div>
      )}

      <RankingModal
        ranking={rankingData}
        onPlayAgain={playAgain}
        onClose={() => setJoined(false)}
      />
      <SwapModal
        swapData={showSwap ? swapData : null}
        onClose={() => setShowSwap(false)}
      />
    </div>
  )
}