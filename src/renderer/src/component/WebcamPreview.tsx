<<<<<<< HEAD
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
=======
// src/component/WebcamPreview.tsx
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';
>>>>>>> 97f2c41 (update)

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
    const [cameraReady, setCameraReady] = useState(false);
    const startingRef = useRef(false);

<<<<<<< HEAD
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
=======
    useImperativeHandle(ref, () => ({
      video: videoRef.current,
      stop: stopCamera,
    }));

    useEffect(() => {
      if (isActive) startCamera();
      else stopCamera();
      return () => stopCamera();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    const startCamera = async () => {
      if (startingRef.current || stream) return;
      startingRef.current = true;
      setCameraReady(false);
>>>>>>> 97f2c41 (update)
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
<<<<<<< HEAD
          const videoElement = videoRef.current;
          const handleLoadedMetadata = () => {
            if (!isMountedRef.current || !isActiveRef.current) return;
=======
          (videoRef.current as any).srcObject = ms;
          videoRef.current.onloadedmetadata = () => {
>>>>>>> 97f2c41 (update)
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
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        startingRef.current = false;
      }
    }, [onStreamReady]);

<<<<<<< HEAD
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
=======
    const stopCamera = () => {
      try {
        const v = videoRef.current;
        const s1 = stream;
        const s2 = (v?.srcObject as MediaStream | null) ?? null;

        const allTracks = new Set<MediaStreamTrack>([
          ...(s1?.getTracks() ?? []),
          ...(s2?.getTracks() ?? []),
        ]);
        allTracks.forEach((t) => {
          try { t.stop(); } catch {}
        });

        if (v) {
          v.pause();
          (v as any).srcObject = null;
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
>>>>>>> 97f2c41 (update)

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
