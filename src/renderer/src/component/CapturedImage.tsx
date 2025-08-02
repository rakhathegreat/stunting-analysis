import React from 'react';

interface CapturedImageProps {
  imageData: string;
  onCancel: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const CapturedImage: React.FC<CapturedImageProps> = ({ 
  imageData,
}) => {
  return (
    <>
        <div className="flex w-full relative bg-gray-900 rounded-lg overflow-hidden aspect-[16/9]">
          <img
            src={imageData}
            alt="Captured"
            className="w-full h-auto object-cover"
          />
          {/* <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            Gambar Tertangkap
          </div> */}
        </div>
    </>
  );
};

export default CapturedImage;