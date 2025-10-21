// App.tsx
import React, { useState } from 'react';
import MainPage from './pages/MainPage';
import PreviewPage from './pages/PreviewPage';
import ResultPage from './pages/ResultPage';

type AppState = 'main' | 'preview' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('main');
  const [nik, setNik] = useState('');
  const [resultData, setResultData] = useState<any>(null); // sesuaikan tipe Anda

  const gotoResults = (data: any) => {
    setResultData(data); // simpan hasil analisis
    setAppState('results');
  };

  const handleRetake = () => {
    setResultData(null);      // opsional: reset hasil
    setAppState('preview');
  };

  const handleCancelPreview = () => {
    setAppState('main');
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100">
      {appState === 'main' && <MainPage setAppState={setAppState} setNik={setNik} />}
      {appState === 'preview' && (
        <PreviewPage nik={nik} onCaptureSuccess={gotoResults} setAppState={setAppState}/>
      )}
      {appState === 'results' && <ResultPage data={resultData} nik={nik} onRetake={handleRetake}/>}
    </div>
  );
}

export default App;