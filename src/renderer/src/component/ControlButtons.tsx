import React from 'react';
import { Camera, Settings, Loader2, Zap, RotateCcw } from 'lucide-react';

interface ControlButtonsProps {
  appState: string;
  onCalibrate: () => void;
  onCapture: () => void;
  onCancel: () => void;
  onAnalyze: () => void;
  isCalibrating: boolean;
  isAnalyzing: boolean;
  isFormValid: boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  appState,
  onCalibrate,
  onCapture,
  onCancel,
  onAnalyze,
  isCalibrating,
  isAnalyzing,
  isFormValid
}) => {
  const disabled = appState === 'analyzing';
  return (
    <div className="flex w-full h-full justify-between space-x-4 pt-6">
      {appState === 'preview' && (
        <>
          <button
            onClick={onCalibrate}
            disabled={isCalibrating}
            className="flex w-full  justify-center items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm: text-sm"
          >
            <span>{isCalibrating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Kalibrasi Kamera'}</span>
          </button>

          <button
            onClick={onCapture}
            disabled={isFormValid}
            className="flex w-full items-center justify-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Ambil Gambar</span>
          </button>
        </>
      )}

      {(appState === 'captured' || appState === 'analyzing') && (
        <>
          <button
            onClick={onCancel}
            disabled={disabled}
            className="flex w-full justify-center items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Ulangi</span>
          </button>
          
          <button
            onClick={onAnalyze}
            disabled={disabled}
            className="flex w-full justify-center items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="h-5 w-5" />
            <span>{isAnalyzing ? 'Menganalisis...' : 'Analisis'}</span>
          </button>
        </>
      )}
    </div>
  );
};

export default ControlButtons; 