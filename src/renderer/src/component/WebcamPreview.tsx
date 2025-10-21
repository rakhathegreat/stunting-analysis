// WebcamPreview.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { CameraOff, Loader2 } from 'lucide-react';   // <-- Loader2 ditambah

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
    const streamRef = useRef<MediaStream | null>(null);
    const isMountedRef = useRef(true);
    const isActiveRef = useRef(isActive);
    const [error, setError] = useState('');
    const [cameraReady, setCameraReady] = useState(false); // <-- baru

    const stopCamera = useCallback(() => {
      const currentStream = streamRef.current ?? (videoRef.current?.srcObject as MediaStream | null);
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onloadedmetadata = null;
      }
      if (isMountedRef.current) {
        setCameraReady(false);
      }
    }, []);

    const startCamera = useCallback(async () => {
      setCameraReady(false);        // <-- reset
      setError('');
      try {
        const ms = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        if (!isMountedRef.current || !isActiveRef.current) {
          ms.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = ms;
        if (videoRef.current) {
          const videoElement = videoRef.current;
          const handleLoadedMetadata = () => {
            if (!isMountedRef.current || !isActiveRef.current) return;
            setCameraReady(true);
            onStreamReady(ms);
          };

          videoElement.srcObject = ms;
          videoElement.onloadedmetadata = handleLoadedMetadata;

          if (videoElement.readyState >= 1) {
            handleLoadedMetadata();
          }
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError('Camera access denied or not available');
        console.error(err);
      }
    }, [onStreamReady]);

    useImperativeHandle(ref, () => ({
      video: videoRef.current,
      stop: () => stopCamera(),
    }));

    useEffect(() => {
      isActiveRef.current = isActive;
    }, [isActive]);

    useEffect(() => {
      if (isActive) startCamera();
      else stopCamera();
    }, [isActive, startCamera, stopCamera]);

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
        stopCamera();
      };
    }, [stopCamera]);

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