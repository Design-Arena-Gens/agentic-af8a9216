'use client'

interface DistanceDisplayProps {
  distance: number | null
  isListening: boolean
}

export default function DistanceDisplay({ distance, isListening }: DistanceDisplayProps) {
  const getDistanceColor = (dist: number | null) => {
    if (!dist) return 'text-gray-400'
    if (dist < 1) return 'text-green-600'
    if (dist < 3) return 'text-blue-600'
    if (dist < 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDistanceQuality = (dist: number | null) => {
    if (!dist) return 'No Signal'
    if (dist < 1) return 'Very Close'
    if (dist < 3) return 'Close'
    if (dist < 10) return 'Medium Range'
    return 'Far'
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Estimated Distance
      </h2>

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`text-8xl font-bold ${getDistanceColor(distance)}`}>
          {distance !== null && isListening ? distance.toFixed(2) : '--'}
        </div>

        <div className="text-3xl text-gray-600 font-semibold">
          meters
        </div>

        {isListening && (
          <div className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
            <span className="text-white font-bold text-lg">
              {getDistanceQuality(distance)}
            </span>
          </div>
        )}

        {!isListening && (
          <div className="mt-4 px-6 py-3 bg-gray-200 rounded-full">
            <span className="text-gray-600 font-bold text-lg">
              Not Listening
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-center">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-semibold mb-1">Method</div>
          <div className="text-xs text-purple-800">Intensity + Frequency Analysis</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-semibold mb-1">Algorithm</div>
          <div className="text-xs text-blue-800">Inverse Square Law + FFT</div>
        </div>
      </div>
    </div>
  )
}
