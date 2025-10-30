'use client'

import { useEffect, useRef } from 'react'

interface SpectrumVisualizerProps {
  frequencyData: Float32Array | null
  isListening: boolean
}

export default function SpectrumVisualizer({ frequencyData, isListening }: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, width, height)

    if (!frequencyData || !isListening) {
      ctx.fillStyle = '#64748b'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Waiting for audio...', width / 2, height / 2)
      return
    }

    // Draw frequency spectrum
    const barWidth = width / frequencyData.length * 2
    let x = 0

    for (let i = 0; i < frequencyData.length; i++) {
      // Convert dB to 0-1 range (assuming -100 to 0 dB range)
      const value = (frequencyData[i] + 100) / 100
      const barHeight = Math.max(0, value * height)

      // Color gradient based on frequency
      const hue = (i / frequencyData.length) * 280
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`

      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
      x += barWidth
    }

    // Draw frequency labels
    ctx.fillStyle = '#64748b'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('0 Hz', 5, height - 5)
    ctx.textAlign = 'right'
    ctx.fillText('22 kHz', width - 5, height - 5)
  }, [frequencyData, isListening])

  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <h3 className="text-lg font-bold mb-2 text-gray-800">Frequency Domain - Spectrum</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-lg"
        style={{ width: '100%', height: '192px' }}
      />
    </div>
  )
}
