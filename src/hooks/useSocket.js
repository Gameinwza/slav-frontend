import { useState, useEffect, useCallback, useRef } from 'react'
import socket from '../socket'

const VALUE_ORDER = ['3','4','5','6','7','8','9','10','J','Q','K','A','2']
const SUIT_ORDER  = ['♣','♦','♥','♠']

function compareCards(a, b) {
  const vd = VALUE_ORDER.indexOf(a.value) - VALUE_ORDER.indexOf(b.value)
  return vd !== 0 ? vd : SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit)
}
function getHighCard(cards) {
  return cards.reduce((best, c) => compareCards(c, best) > 0 ? c : best, cards[0])
}
export function getPlayType(cards) {
  if (!cards?.length) return 'invalid'
  if (cards.length === 1) return 'single'
  if (cards.length === 2 && cards[0].value === cards[1].value) return 'pair'
  if (cards.length === 3 && cards.every(c => c.value === cards[0].value)) return 'tong'
  if (cards.length === 4 && cards.every(c => c.value === cards[0].value)) return 'quad'
  return 'invalid'
}
export function isValidMove(cards, table) {
  if (!cards?.length) return false
  const pt = getPlayType(cards)
  if (pt === 'invalid') return false
  if (!table?.length) return true
  const lastPlay = table[table.length - 1]
  const tt = getPlayType(lastPlay)
  if (pt === 'tong' && tt === 'single') return true
  if (pt === 'quad' && tt === 'pair')   return true
  if (pt !== tt) return false
  return compareCards(getHighCard(cards), getHighCard(lastPlay)) > 0
}

export default function useSocket() {
  const [connected,    setConnected]    = useState(false)
  const [myId,         setMyId]         = useState('')
  const [players,      setPlayers]      = useState([])
  const [hand,         setHand]         = useState([])
  const [gameState,    setGameState]    = useState(null)
  const [selected,     setSelected]     = useState([])
  const [notification, setNotification] = useState('')
  const [rankingData,  setRankingData]  = useState(null)
  const [swapData,     setSwapData]     = useState(null)
  const [gameAborted,  setGameAborted]  = useState('')
  const roomRef = useRef('')

  // ── notify helper ──────────────────────────────────────
  const notify = useCallback((msg, ms = 3000) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), ms)
  }, [])

  // ── socket events ──────────────────────────────────────
  useEffect(() => {
    socket.on('connect',    () => { setConnected(true);  setMyId(socket.id) })
    socket.on('disconnect', () => { setConnected(false) })

    socket.on('error',       msg  => notify('⚠️ ' + msg))
    socket.on('players',     list => setPlayers(list))
    socket.on('yourHand',    h    => { setHand(h); setSelected([]) })
    socket.on('gameStarted', ()   => { setRankingData(null); setGameAborted('') })

    socket.on('gameState', state => {
      setGameState(state)
      setSelected([])
    })

    socket.on('tableClear', data => {
      if (data?.reversed) {
        notify('🔄 สลับทิศ! ' + data.directionLabel + ' — ' + data.nextPlayerName + ' เริ่ม')
      }
    })

    socket.on('playerFinished', ({ name, rank }) => {
      const labels = ['👑 คิง','👸 ควีน','รองสลาฟ','😓 สลาฟ']
      notify((name || '?') + ' หมดไพ่ → ' + (labels[rank-1] || ''), 4000)
    })

    socket.on('autoPass', ({ name }) => {
      notify('⏰ ' + name + ' หมดเวลา — Auto Pass', 3000)
    })

    socket.on('gameOver', ({ ranking }) => {
      setRankingData(ranking)
    })

    socket.on('cardSwapInfo', info => {
      setSwapData(info)
    })

    socket.on('gameAborted', ({ reason }) => {
      setGameAborted(reason)
      setGameState(null)
    })

    return () => socket.removeAllListeners()
  }, [notify])

  // ── actions ────────────────────────────────────────────
  const join = useCallback((roomId, nickname) => {
    roomRef.current = roomId
    socket.emit('joinRoom', { roomId, nickname })
  }, [])

  const startGame = useCallback(() => {
    socket.emit('startGame', roomRef.current)
  }, [])

  const playAgain = useCallback(() => {
    setRankingData(null)
    socket.emit('playAgain', roomRef.current)
  }, [])

  const pass = useCallback(() => {
    socket.emit('passTurn', roomRef.current)
  }, [])

  const confirmPlay = useCallback((cards) => {
    socket.emit('playCard', { roomId: roomRef.current, cards })
    setSelected([])
  }, [])

  // ── card selection ─────────────────────────────────────
  const toggleCard = useCallback((card) => {
    setSelected(prev => {
      const idx = prev.findIndex(c => c.suit === card.suit && c.value === card.value)
      if (idx !== -1) return prev.filter((_, i) => i !== idx)
      if (prev.length > 0 && prev[0].value !== card.value) return [card]
      if (prev.length >= 4) return prev
      return [...prev, card]
    })
  }, [])

  // ── derived ────────────────────────────────────────────
  const isMyTurn  = gameState?.turn === myId
  const hasPassed = gameState?.hasPassed || false

  const sortedHand = [...hand].sort((a, b) => {
    const vd = VALUE_ORDER.indexOf(a.value) - VALUE_ORDER.indexOf(b.value)
    return vd !== 0 ? vd : SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit)
  })

  function canCardPlay(card) {
    if (hasPassed || !isMyTurn) return false
    if (gameState?.firstTurn) return card.value === '3' && card.suit === '♣'
    const sv = hand.filter(c => c.value === card.value)
    if (isValidMove([card], gameState?.table)) return true
    if (sv.length >= 2 && isValidMove(sv.slice(0,2), gameState?.table)) return true
    if (sv.length >= 3 && isValidMove(sv.slice(0,3), gameState?.table)) return true
    if (sv.length >= 4 && isValidMove(sv.slice(0,4), gameState?.table)) return true
    return false
  }

  return {
    // state
    connected, myId, players, hand: sortedHand, gameState,
    selected, notification, rankingData, swapData, gameAborted,
    // derived
    isMyTurn, hasPassed,
    // actions
    join, startGame, playAgain, pass, confirmPlay, toggleCard,
    // helpers
    canCardPlay, isValidMove, getPlayType,
  }
}