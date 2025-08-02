import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamPreviewProps {
  isActive: boolean;
  onStreamReady: (stream: MediaStream) => void;
}

const WebcamPreview: React.FC<WebcamPreviewProps> = ({ isActive, onStreamReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      onStreamReady(mediaStream);
      setError('');
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  if (!isActive) return null;

  return (
    <div className="flex w-full relative bg-gray-900 rounded-lg overflow-hidden aspect-[16/9]">
      {error ? (
        <div className="flex items-center justify-center h-96 bg-gray-800 text-white">
          <div className="text-center">
            <CameraOff className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-red-400">{error}</p>
            <button 
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Retry Camera Access
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto object-cover"
          />
          <div className="absolute z-20 top-1/2 left-1/2 w-140 h-64 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {/* Top Left */}
            <div className="absolute top-0 left-0 w-6 h-0.5 bg-yellow-400" />
            <div className="absolute top-0 left-0 w-0.5 h-6 bg-yellow-400" />

            {/* Top Right */}
            <div className="absolute top-0 right-0 w-6 h-0.5 bg-yellow-400" />
            <div className="absolute top-0 right-0 w-0.5 h-6 bg-yellow-400" />

            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 w-6 h-0.5 bg-yellow-400" />
            <div className="absolute bottom-0 left-0 w-0.5 h-6 bg-yellow-400" />

            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-6 h-0.5 bg-yellow-400" />
            <div className="absolute bottom-0 right-0 w-0.5 h-6 bg-yellow-400" />
          </div>
        </>
      )}
    </div>
  );
};

export default WebcamPreview;