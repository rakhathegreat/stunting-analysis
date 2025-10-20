// WebcamPreview.tsx
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';   // <-- Loader2 ditambah

export interface WebcamPreviewRef {
  video: HTMLVideoElement | null;
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
    const [cameraReady, setCameraReady] = useState(false); // <-- baru

    useImperativeHandle(ref, () => ({ video: videoRef.current }));

    useEffect(() => {
      if (isActive) startCamera();
      else stopCamera();
      return () => stopCamera();
    }, [isActive]);

    const startCamera = async () => {
      setCameraReady(false);        // <-- reset
      setError('');
      try {
        const ms = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        setStream(ms);
        if (videoRef.current) {
          videoRef.current.srcObject = ms;
          // tunggu frame pertama sebelum anggap siap
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
            onStreamReady(ms);
          };
        }
      } catch (err) {
        setError('Camera access denied or not available');
        console.error(err);
      }
    };

    const stopCamera = () => {
      stream?.getTracks().forEach((t) => t.stop());
      setStream(null);
      setCameraReady(false);
    };

    if (!isActive) return null;

    return (
      <div className="relative w-full h-full bg-gray-900 overflow-hidden">
        {/* Overlay loading */}
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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }
);

export default WebcamPreview;