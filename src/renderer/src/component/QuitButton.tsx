/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useRef } from 'react'
import { Brain } from 'lucide-react'

export default function QuitButton() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseDown = () => {
    console.log('Mulai tahan tombol...')
    timeoutRef.current = setTimeout(() => {
      console.log('Keluar dari aplikasi...')
      window.electron.quitApp?.()
    }, 5000) // 5 detik
  }

  const handleMouseUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      console.log('Tombol dilepas sebelum 5 detik.')
    }
  }

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      title="Tahan 5 detik untuk keluar"
    >
      <Brain className="h-8 w-8 text-blue-600" />
    </button>
  )
}
