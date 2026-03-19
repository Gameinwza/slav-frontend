import { io } from 'socket.io-client'

// เปลี่ยน URL ตรงนี้จุดเดียวถ้า deploy
export const socket = io('http://129.150.48.168:3001', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})

export default socket