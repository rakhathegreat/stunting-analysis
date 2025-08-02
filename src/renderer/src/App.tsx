import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CheckCircle, CircleAlertIcon, FileWarningIcon } from 'lucide-react';
import WebcamPreview from './component/WebcamPreview';
import DataForm from './component/DataForm';
import ControlButtons from './component/ControlButtons';
import ResultDisplay from './component/ResultDisplay';
import CapturedImage from './component/CapturedImage';
import SaveButtons from './component/SaveButtons';

type AppState = 'preview' | 'captured' | 'analyzing' | 'results' | 'saving';
type Calibrated = 'true' | 'false' | 'failed';

interface FormData {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
}

interface AnalysisResult {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  hazScore: number;
  gender: 'male' | 'female';
  nutritionStatus: 'severely_stunted' | 'stunted' | 'normal' | 'tall';
}

function App() {
  const [appState, setAppState] = useState<AppState>('preview');
  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    age: NaN,
    gender: 'male',
  });
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState<Calibrated>('false');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [calibratedHeight, setCalibratedHeight] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStreamReady = useCallback((mediaStream: MediaStream) => {
    setStream(mediaStream);
  }, []);

  const handleCalibrate = async () => {
    setIsCalibrating(true);
    const video = document.querySelector('video') as HTMLVideoElement;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/png');

    const byteString = atob(imageDataUrl.split(',')[1]);
    const mimeString = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    URL.createObjectURL(blob);

    // Prepare form data
    const formData = new FormData();
    formData.append('image', blob, 'capture.png');

    try {
      const response = await fetch('http://127.0.0.1:8000/calibrate/aruco', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        setIsCalibrated('failed');
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload success:', result);
      setCalibratedHeight(Number(result.result).toFixed(4));
      setIsCalibrating(false);
      setIsCalibrated('true');
    } catch (error) {
      console.error('Upload error:', error);
      setIsCalibrated('failed');
      setIsCalibrating(false);
    }
  };

const handleCapture = async () => {
  const video = document.querySelector('video') as HTMLVideoElement;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  const imageDataUrl = canvas.toDataURL('image/png');
  setCapturedImage(imageDataUrl);
  setAppState('captured');

  // Convert base64 to Blob
  const byteString = atob(imageDataUrl.split(',')[1]);
  const mimeString = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });

  // Prepare form data
  const formData = new FormData();
  formData.append('image', blob, 'capture.png');

  try {
    const response = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    console.log('Upload success:', result);
  } catch (error) {
    console.error('Upload error:', error);
  }
};


  const handleAnalyze = async () => {
    setAppState('analyzing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const hazScore = parseFloat((-2 + Math.random() * 4).toFixed(2));
    let nutritionStatus: AnalysisResult['nutritionStatus'] = 'normal';
    if (hazScore < -3) nutritionStatus = 'severely_stunted';
    else if (hazScore < -2) nutritionStatus = 'stunted';
    else if (hazScore > 2) nutritionStatus = 'tall';

    setAnalysisResult({
      id: formData.id,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      height: Math.round(65 + Math.random() * 25),
      weight: Math.round(8 + Math.random() * 7),
      hazScore,
      nutritionStatus,
    });
    setAppState('results');
  };

  const handleNewAnalysis = () => {
    setFormData({ id: '', name: '', age: NaN, gender: 'male' });
    setCapturedImage('');
    setAnalysisResult(null);
    setAppState('preview');
  };

  const handleCancel = () => {
    setCapturedImage('');
    setAppState('preview');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setAppState('saving');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
    handleNewAnalysis();
  };

  const isFormValid = formData.id.trim() && formData.name.trim() && formData.age > 0;

  return (
    <>
      <div className="h-screen p-6 flex flex-col">
        <canvas ref={canvasRef} className="hidden" />
        <main className="flex-1 min-h-0 overflow-auto bg-gray-50">
          <div className="grid grid-cols-5 grid-rows-3 h-full gap-6">
            {/* Left: Camera / Image */}
            <div className="col-span-3 row-span-2 flex flex-col space-y-4">
              <div className={`bg-white rounded-xl flex flex-col ${appState === 'analyzing' ? 'h-full' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      {appState === 'preview' && 'Camera Preview'}
                      {appState === 'captured' && 'Image Captured'}
                      {appState === 'analyzing' && 'Analyzing Image'}
                      {appState === 'results' && 'Image Analyzed'}
                      {appState === 'saving' && 'Image Result'}
                    </span>
                  </div>
                  {isCalibrated === 'true' && (
                    <div className="flex items-center space-x-1 text-xs">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">Calibrated: {calibratedHeight} cm</span>
                    </div>
                  )}
                  {isCalibrated === 'failed' && (
                    <div className="flex items-center space-x-1 text-xs">
                      <CircleAlertIcon className="w-4 h-4 text-red-600" />
                      <span className="text-red-700">Calibration failed!</span>
                    </div>
                  )}
                </div>

                {appState === 'preview' && (
                  <WebcamPreview isActive onStreamReady={handleStreamReady} />
                )}

                {(appState === 'captured' || appState === 'analyzing' || appState === 'results') && (
                  <div className="flex flex-col items-center">
                    {appState === 'analyzing' ? (
                      <div className="flex items-center justify-center w-full aspect-[16/9] rounded-lg">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2" />
                          <p className="text-gray-600">Processing...</p>
                        </div>
                      </div>
                    ) : (
                      <CapturedImage
                        imageData={capturedImage}
                        isAnalyzing={false} 
                        onCancel={handleCancel}
                        onAnalyze={handleAnalyze}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Form or Results */}
            <div className="col-span-2 row-span-3 flex flex-col space-y-4">
              <div className="bg-white rounded-xl flex-1">
                {appState !== 'results' && appState !== 'saving' && (
                  <DataForm appState={appState} formData={formData} onFormDataChange={setFormData} />
                )}
                {(appState === 'results' || appState === 'saving') && analysisResult && (
                  <ResultDisplay
                    result={analysisResult}
                    onNewAnalysis={handleNewAnalysis}
                    onSave={handleSave}
                  />
                )}
              </div>
            </div>

            {/* Bottom: Controls */}
            <div className="col-span-3 flex items-end">
              <div className="bg-white rounded-xl w-full h-full">
                {appState !== 'results' && appState !== 'saving' && (
                  <ControlButtons
                    appState={appState}
                    onCalibrate={handleCalibrate}
                    onCapture={handleCapture}
                    onAnalyze={handleAnalyze}
                    onCancel={handleCancel}
                    isCalibrating={isCalibrating}
                    isFormValid={!isFormValid}
                    isAnalyzing={appState === 'analyzing'}
                  />
                )}
                {(appState === 'results' || appState === 'saving') && (
                  <SaveButtons
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSaving={isSaving}
                    appState={appState}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;