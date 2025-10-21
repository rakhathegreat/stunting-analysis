import React, { useRef, useState } from 'react';
import WebcamPreview, { WebcamPreviewRef } from '@renderer/component/WebcamPreview';
import { Camera, Loader, Check } from 'lucide-react';
import supabase from '../services/supabase';

type AppState = 'main' | 'preview' | 'results';

type Props = {
  nik: string;
  onCaptureSuccess: (data: any) => void;
  setAppState: (s: AppState) => void;
};

const PreviewPage: React.FC<Props> = ({ nik, onCaptureSuccess, setAppState }) => {
  const webcamRef = useRef<WebcamPreviewRef>(null);
  const [capturing, setCapturing] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrateSuccess, setCalibrateSuccess] = useState(false);
  const [activeCam, setActiveCam] = useState(true);
  const cancelledRef = useRef(false);

  const handleCapture = async () => {
    if (cancelledRef.current) return;
    const video = webcamRef.current?.video;
    if (!video || !video.videoWidth) return alert('Kamera belum aktif!');
    if (!nik) return alert('NIK belum dipilih');

    setCapturing(true);

    const { data: user, error } = await supabase
      .from('DataAnak')
      .select('umur, gender')
      .eq('nik', nik)
      .single();

    if (error || !user) {
      setCapturing(false);
      return alert('Data anak tidak ditemukan');
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setCapturing(false);
        return alert('Gagal membuat blob');
      }

      const fd = new FormData();
      fd.append('file', blob, 'capture.jpg');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const age = String(user.umur);
        const gender = user.gender;

        const res = await fetch(
          `http://127.0.0.1:8000/capture?gender=${gender}&age=${age}`,
          {
            method: 'POST',
            body: fd,
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        onCaptureSuccess(data);
      } catch (err: any) {
        alert(
          err?.name === 'AbortError'
            ? 'Analisis gagal (timeout 5 detik)'
            : 'Analisis gagal',
        );
      } finally {
        setCapturing(false);
      }
    }, 'image/jpeg');
  };

  const handleCalibrate = async () => {
    if (cancelledRef.current) return;
    const video = webcamRef.current?.video;
    if (!video || !video.videoWidth) return alert('Kamera belum aktif!');

    setCalibrating(true);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setCalibrating(false);
        return alert('Gagal membuat blob');
      }

      const fd = new FormData();
      fd.append('file', blob, 'aruco.jpg');

      try {
        const res = await fetch('http://127.0.0.1:8000/calibrate/aruco', {
          method: 'POST',
          body: fd,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await res.json();

        setCalibrateSuccess(true);
        setTimeout(() => setCalibrateSuccess(false), 2000);
      } catch {
        alert('Kalibrasi gagal ❌');
      } finally {
        setCalibrating(false);
      }
    }, 'image/jpeg');
  };

  const handleCancel = async () => {
    cancelledRef.current = true;
    setCapturing(false);
    setCalibrating(false);
    setCalibrateSuccess(false);

    // 1) Matikan kamera via imperative handle
    webcamRef.current?.stop?.();

    // 2) Fallback: stop semua track yang mungkin masih nempel di elemen
    const videoEl = webcamRef.current?.video ?? null;
    const vStream = (videoEl?.srcObject as MediaStream | null) ?? null;
    vStream?.getTracks().forEach((t) => {
      try { t.stop(); } catch {}
    });

    // 3) Bersihkan elemen video
    if (videoEl) {
      videoEl.pause();
      (videoEl as any).srcObject = null;
      videoEl.onloadedmetadata = null;
      videoEl.removeAttribute('src');
      videoEl.load?.();
    }

    // 4) Nonaktifkan kamera di UI
    setActiveCam(false);

    // 5) Tunggu satu frame agar browser melepas device
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    // 6) Kembali ke halaman utama
    setAppState('main');
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-screen bg-gray-200">
      {activeCam && (
        <WebcamPreview
          ref={webcamRef}
          isActive={activeCam}
          onStreamReady={(s) => console.log('Stream ready', s)}
        />
      )}

      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 px-4 py-1 bg-white/80 rounded-lg shadow-md font-bold text-sm">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          Camera
        </div>
      </div>

      <div className="absolute top-4 right-4">
        <button
          className="flex items-center gap-2 px-4 py-1 bg-white/80 rounded-lg shadow-md font-bold text-sm"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>

      <div className="absolute bottom-8 flex gap-4">
        <button
          onClick={handleCalibrate}
          disabled={calibrating}
          className="flex items-center gap-2 px-6 py-4 text-sm bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 shadow transition disabled:cursor-not-allowed"
        >
          {calibrating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Kalibrasi...
            </>
          ) : calibrateSuccess ? (
            <>
              <Check className="w-5 h-5 text-green-600" />
              Berhasil
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Kalibrasi
            </>
          )}
        </button>

        <button
          onClick={handleCapture}
          disabled={capturing}
          className={`
            flex items-center gap-2 px-6 py-4 text-sm
            bg-brand-700 text-white font-semibold rounded-lg
            hover:bg-brand-800 shadow transition
            disabled:cursor-not-allowed
          `}
        >
          {capturing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Menganalisis...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Ambil Gambar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;