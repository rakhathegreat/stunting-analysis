// src/component/WebcamPreview.tsx
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';

export interface WebcamPreviewRef {
  video: HTMLVideoElement | null;
  stop: () => void;
}

interface WebcamPreviewProps {
  isActive: boolean;
  onStreamReady: (stream: MediaStream) => void;
}

const WebcamPreview = forwardRef<WebcamPreviewRef, WebcamPreviewProps>(
  ({ isActive, onStreamReady }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState('');
    const [cameraReady, setCameraReady] = useState(false);

    // Prevent start re-entrancy & track all streams ever created
    const startingRef = useRef(false);
    const streamsRef = useRef<MediaStream[]>([]);

    useImperativeHandle(ref, () => ({
      video: videoRef.current,
      stop: stopCamera,
    }));

    useEffect(() => {
      if (isActive) startCamera();
      else stopCamera();
      return () => stopCamera(); // cleanup on unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    // Optional: auto-stop when tab hidden to ensure device fully released
    useEffect(() => {
      const onHide = () => {
        if (document.visibilityState !== 'visible') stopCamera();
      };
      document.addEventListener('visibilitychange', onHide);
      return () => document.removeEventListener('visibilitychange', onHide);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startCamera = async () => {
      if (startingRef.current || stream) return;
      startingRef.current = true;
      setCameraReady(false);
      setError('');
      try {
        const ms = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });

        streamsRef.current.push(ms); // catat semua stream yang pernah dibuat
        setStream(ms);

        if (videoRef.current) {
          videoRef.current.srcObject = ms;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
            onStreamReady(ms);
          };
          // play() bisa dipanggil eksplisit; beberapa browser butuh ini
          videoRef.current.play?.().catch(() => {});
        }
      } catch (err) {
        setError('Camera access denied or not available');
        console.error(err);
      } finally {
        startingRef.current = false;
      }
    };

    const stopCamera = () => {
      try {
        // hentikan semua stream yang pernah dibuat
        streamsRef.current.forEach((s) =>
          s.getTracks().forEach((t) => {
            try { t.stop(); } catch {}
          })
        );
        streamsRef.current = [];

        // hentikan stream di state
        stream?.getTracks().forEach((t) => {
          try { t.stop(); } catch {}
        });

        // hentikan stream yang terpasang di elemen
        const v = videoRef.current;
        const vStream = (v?.srcObject as MediaStream | null) ?? null;
        vStream?.getTracks().forEach((t) => {
          try { t.stop(); } catch {}
        });

        if (v) {
          v.pause();
          v.srcObject = null;
          v.onloadedmetadata = null;
          v.removeAttribute('src');
          v.load?.();
        }
      } finally {
        setStream(null);
        setCameraReady(false);
        startingRef.current = false;
      }
    };

    if (!isActive) return null;

    return (
      <div className="relative w-full h-full bg-gray-900 overflow-hidden">
        {!cameraReady && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <span className="text-sm">Menghidupkan kamera...</span>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white">
            <CameraOff className="h-16 w-16 mb-4 text-gray-400" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Retry Camera Access
            </button>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
      </div>
    );
  }
);

export default WebcamPreview;
