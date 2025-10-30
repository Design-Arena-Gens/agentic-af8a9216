'use client'

interface CalibrationPanelProps {
  referenceLevel: number
  referenceDistance: number
  onReferenceLevelChange: (value: number) => void
  onReferenceDistanceChange: (value: number) => void
  onCalibrate: (level: number) => void
  calibrationMode: boolean
  onCalibrationModeChange: (mode: boolean) => void
}

export default function CalibrationPanel({
  referenceLevel,
  referenceDistance,
  onReferenceLevelChange,
  onReferenceDistanceChange,
  onCalibrate,
  calibrationMode,
  onCalibrationModeChange,
}: CalibrationPanelProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Calibration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reference Distance (m)
          </label>
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={referenceDistance}
            onChange={(e) => onReferenceDistanceChange(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Set distance for calibration
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reference Level (dB SPL)
          </label>
          <input
            type="number"
            min="0"
            max="120"
            step="1"
            value={referenceLevel}
            onChange={(e) => onReferenceLevelChange(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Expected sound level at reference distance
          </p>
        </div>

        <button
          onClick={() => onCalibrate(referenceLevel)}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all transform hover:scale-105"
        >
          Apply Calibration
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Tips</h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• Place sound source at known distance</li>
            <li>• Use consistent sound (white noise, tone)</li>
            <li>• Adjust reference level to match</li>
            <li>• Works best in quiet environments</li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Accuracy depends on environmental factors like room acoustics,
            background noise, and sound source characteristics.
          </p>
        </div>
      </div>
    </div>
  )
}
