import FFT from 'fft.js'

export default class AudioProcessor {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private scriptProcessor: ScriptProcessorNode | null = null
  private stream: MediaStream | null = null
  private isRunning: boolean = false
  private referenceLevel: number = 90 // dB SPL at reference distance
  private referenceDistance: number = 1 // meters
  private fftSize: number = 2048

  async start(
    callback: (audioData: Float32Array, spectrum: Float32Array, distance: number | null) => void,
    refLevel: number = 90,
    refDistance: number = 1
  ) {
    this.referenceLevel = refLevel
    this.referenceDistance = refDistance

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = this.fftSize
      this.analyser.smoothingTimeConstant = 0.8

      this.microphone = this.audioContext.createMediaStreamSource(this.stream)
      this.scriptProcessor = this.audioContext.createScriptProcessor(this.fftSize, 1, 1)

      this.microphone.connect(this.analyser)
      this.analyser.connect(this.scriptProcessor)
      this.scriptProcessor.connect(this.audioContext.destination)

      this.isRunning = true

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRunning || !this.analyser) return

        const audioData = event.inputBuffer.getChannelData(0)
        const dataArray = new Float32Array(audioData.length)
        dataArray.set(audioData)

        // Get frequency spectrum
        const frequencyData = new Float32Array(this.analyser.frequencyBinCount)
        this.analyser.getFloatFrequencyData(frequencyData)

        // Calculate RMS amplitude
        const rms = this.calculateRMS(dataArray)

        // Calculate dominant frequency
        const dominantFreq = this.getDominantFrequency(frequencyData)

        // Estimate distance based on intensity and frequency analysis
        const distance = this.estimateDistance(rms, dominantFreq, frequencyData)

        callback(dataArray, frequencyData, distance)
      }
    } catch (error) {
      console.error('Error accessing microphone:', error)
      throw error
    }
  }

  stop() {
    this.isRunning = false

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect()
      this.scriptProcessor = null
    }

    if (this.microphone) {
      this.microphone.disconnect()
      this.microphone = null
    }

    if (this.analyser) {
      this.analyser.disconnect()
      this.analyser = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  updateCalibration(refLevel: number, refDistance: number) {
    this.referenceLevel = refLevel
    this.referenceDistance = refDistance
  }

  private calculateRMS(data: Float32Array): number {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i]
    }
    return Math.sqrt(sum / data.length)
  }

  private getDominantFrequency(frequencyData: Float32Array): number {
    if (!this.audioContext) return 0

    let maxValue = -Infinity
    let maxIndex = 0

    // Focus on 100Hz - 8kHz range (most relevant for distance)
    const minBin = Math.floor(100 / (this.audioContext.sampleRate / this.fftSize))
    const maxBin = Math.floor(8000 / (this.audioContext.sampleRate / this.fftSize))

    for (let i = minBin; i < maxBin && i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i]
        maxIndex = i
      }
    }

    return (maxIndex * this.audioContext.sampleRate) / this.fftSize
  }

  private estimateDistance(
    rms: number,
    dominantFreq: number,
    frequencyData: Float32Array
  ): number | null {
    // Convert RMS to dB
    const currentDB = 20 * Math.log10(rms + 1e-10)

    // Calculate intensity-based distance using inverse square law
    // L2 = L1 - 20 * log10(d2/d1)
    // d2 = d1 * 10^((L1 - L2) / 20)

    const dbDifference = this.referenceLevel - currentDB
    const distanceIntensity = this.referenceDistance * Math.pow(10, dbDifference / 20)

    // Calculate high-frequency attenuation factor
    // High frequencies attenuate faster over distance
    const highFreqAttenuation = this.calculateHighFreqAttenuation(frequencyData)

    // Combine intensity and frequency-based estimates
    let estimatedDistance = distanceIntensity * (1 + highFreqAttenuation * 0.3)

    // Apply constraints and filtering
    if (rms < 0.001) return null // Too quiet
    if (estimatedDistance < 0.1) estimatedDistance = 0.1
    if (estimatedDistance > 50) estimatedDistance = 50

    return estimatedDistance
  }

  private calculateHighFreqAttenuation(frequencyData: Float32Array): number {
    if (!this.audioContext) return 0

    // Compare low frequency energy (100-1000Hz) vs high frequency energy (2000-8000Hz)
    const lowFreqStart = Math.floor(100 / (this.audioContext.sampleRate / this.fftSize))
    const lowFreqEnd = Math.floor(1000 / (this.audioContext.sampleRate / this.fftSize))
    const highFreqStart = Math.floor(2000 / (this.audioContext.sampleRate / this.fftSize))
    const highFreqEnd = Math.floor(8000 / (this.audioContext.sampleRate / this.fftSize))

    let lowFreqEnergy = 0
    let highFreqEnergy = 0

    for (let i = lowFreqStart; i < lowFreqEnd && i < frequencyData.length; i++) {
      lowFreqEnergy += Math.pow(10, frequencyData[i] / 10)
    }

    for (let i = highFreqStart; i < highFreqEnd && i < frequencyData.length; i++) {
      highFreqEnergy += Math.pow(10, frequencyData[i] / 10)
    }

    lowFreqEnergy /= (lowFreqEnd - lowFreqStart)
    highFreqEnergy /= (highFreqEnd - highFreqStart)

    // Higher ratio means more attenuation (greater distance)
    const ratio = lowFreqEnergy / (highFreqEnergy + 1e-10)

    // Normalize to 0-1 range
    return Math.min(1, Math.max(0, (ratio - 1) / 10))
  }
}
