import React from 'react';
import {
  User,
  Ruler,
  Scale,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  IdCard,
  VenusAndMars,
  SquareActivity,
  HeartPulse,
  SaladIcon,
  ActivityIcon,
  HashIcon,
} from 'lucide-react';
import SaveButtons from './SaveButtons';

type NutritionStatus = 'severely_stunted' | 'stunted' | 'normal' | 'tall';

interface AnalysisResult {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  hazScore: number;
  gender: 'male' | 'female';
  nutritionStatus: NutritionStatus;
}

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  onNewAnalysis: () => void;
  onSave: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onNewAnalysis, onSave }) => {
  const [isSaving, setIsSaving] = React.useState(false);
  if (!result) {
    return null;
  }

  const getStatusInfo = (status: NutritionStatus) => {
    switch (status) {
      case 'severely_stunted':
        return {
          label: 'Severely Stunted',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: XCircle,
        };
      case 'stunted':
        return {
          label: 'Stunted',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: AlertTriangle,
        };
      case 'normal':
        return {
          label: 'Normal',
          color: 'text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
        };
      case 'tall':
        return {
          label: 'Tall',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: CheckCircle,
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: AlertTriangle,
        };
    }
  };

  const statusInfo = getStatusInfo(result.nutritionStatus);
  const StatusIcon = statusInfo.icon;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSaving(false);
    onSave();
  };

  const handleCancel = () => {
    setIsSaving(false);
    onNewAnalysis();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 sm:text-base">Analysis Result</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full justify-between">
        
        <div className="grid grid-rows-5 grid-cols-2 md:grid-cols-2 w-full">
          <div className="row-start-2 col-span-2">
            <InfoItem icon={User} label="Name" value={result.name} />
          </div>

          <div className="row-start-1">
            <InfoItem icon={IdCard} label="ID" value={result.id} />
          </div>

          <div className="row-start-3 col-start-2">
            <InfoItem icon={VenusAndMars} label="Gender" value={result.gender} />
          </div>


          <div className="row-start-3 col-start-1">
            <InfoItem icon={HashIcon} label="Age" value={result.age} /> 
            {/* <InfoItem icon={BarChart3} label="Skor HAZ" value={result.hazScore.toFixed(2)} /> */}
          </div>

          <div className="row-start-4">
            <InfoItem icon={Ruler} label="Height" value={`${result.height} cm`} />
          </div>

          <div className="row-start-4 col-start-2">
            <InfoItem icon={Scale} label="Weight" value={`${result.weight} kg`} />
          </div>

          <div className="row-start-5 col-span-2">
            <InfoItem icon={ActivityIcon} label={"Skor HAZ"} value={result.hazScore.toFixed(2)} />
          </div>

        </div>

        <div className={`pl-5 h-full flex items-center rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <div className="flex items-center space-x-5">
            <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
            <div>
              <p className="text-sm font-medium text-gray-600">Status Gizi</p>
              <p className={`text-lg font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
}) => (
  <div className="flex w-full items-center space-x-3 pb-3">
    <Icon className="h-5 w-5 text-gray-400" />
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-md font-semibold text-gray-700">{value}</p>
    </div>
  </div>
);

export default ResultsDisplay;
