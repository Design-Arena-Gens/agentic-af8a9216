'use client'

import { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  audioData: Float32Array | null
  isListening: boolean
}

export default function WaveformVisualizer({ audioData, isListening }: WaveformVisualizerProps) {
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

    if (!audioData || !isListening) {
      // Draw flat line when not listening
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      ctx.fillStyle = '#64748b'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Waiting for audio...', width / 2, height / 2 - 20)
      return
    }

    // Draw waveform
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 2
    ctx.beginPath()

    const sliceWidth = width / audioData.length
    let x = 0

    for (let i = 0; i < audioData.length; i++) {
      const v = audioData[i]
      const y = (v + 1) * height / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.stroke()

    // Draw zero line
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }, [audioData, isListening])

  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <h3 className="text-lg font-bold mb-2 text-gray-800">Time Domain - Waveform</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-lg"
        style={{ width: '100%', height: '192px' }}
      />
    </div>
  )
}
