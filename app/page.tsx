'use client'

import { useState, useEffect, useRef } from 'react'
import AudioProcessor from './components/AudioProcessor'
import WaveformVisualizer from './components/WaveformVisualizer'
import SpectrumVisualizer from './components/SpectrumVisualizer'
import DistanceDisplay from './components/DistanceDisplay'
import CalibrationPanel from './components/CalibrationPanel'

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [audioData, setAudioData] = useState<Float32Array | null>(null)
  const [frequencyData, setFrequencyData] = useState<Float32Array | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [referenceLevel, setReferenceLevel] = useState<number>(90)
  const [referenceDistance, setReferenceDistance] = useState<number>(1)
  const [calibrationMode, setCalibrationMode] = useState(false)
  const audioProcessorRef = useRef<AudioProcessor | null>(null)

  useEffect(() => {
    audioProcessorRef.current = new AudioProcessor()

    return () => {
      if (audioProcessorRef.current) {
        audioProcessorRef.current.stop()
      }
    }
  }, [])

  const toggleListening = async () => {
    if (!audioProcessorRef.current) return

    if (isListening) {
      audioProcessorRef.current.stop()
      setIsListening(false)
    } else {
      try {
        await audioProcessorRef.current.start((data, spectrum, estimatedDistance) => {
          setAudioData(data)
          setFrequencyData(spectrum)
          setDistance(estimatedDistance)
        }, referenceLevel, referenceDistance)
        setIsListening(true)
      } catch (error) {
        console.error('Error starting audio:', error)
        alert('Could not access microphone. Please grant permission.')
      }
    }
  }

  const handleCalibrate = (level: number) => {
    setReferenceLevel(level)
    if (audioProcessorRef.current) {
      audioProcessorRef.current.updateCalibration(level, referenceDistance)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Acoustic Ranging System
          </h1>
          <p className="text-xl text-white/90">
            Passive Distance Measurement via Sound Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <DistanceDisplay distance={distance} isListening={isListening} />
          </div>
          <div>
            <CalibrationPanel
              referenceLevel={referenceLevel}
              referenceDistance={referenceDistance}
              onReferenceLevelChange={setReferenceLevel}
              onReferenceDistanceChange={setReferenceDistance}
              onCalibrate={handleCalibrate}
              calibrationMode={calibrationMode}
              onCalibrationModeChange={setCalibrationMode}
            />
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex justify-center mb-6">
            <button
              onClick={toggleListening}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isListening ? '⏸ Stop Listening' : '🎤 Start Listening'}
            </button>
          </div>

          <div className="space-y-6">
            <WaveformVisualizer audioData={audioData} isListening={isListening} />
            <SpectrumVisualizer frequencyData={frequencyData} isListening={isListening} />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-purple-900">📊 Signal Processing</h3>
              <p>Real-time FFT analysis extracts frequency components and sound intensity from audio input.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-blue-900">📐 Distance Estimation</h3>
              <p>Uses inverse square law: sound intensity decreases with distance. Analyzes amplitude decay patterns.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-green-900">🎯 Calibration</h3>
              <p>Set reference measurements at known distances to improve accuracy for your environment.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
