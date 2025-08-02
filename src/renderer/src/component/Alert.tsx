import React from 'react';
import { AlertCircle, CircleCheckBig } from 'lucide-react';

interface AlertMessageProps {
  type: 'warning' | 'success';
  children: React.ReactNode;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, children }) => {
  const className = type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-green-50 border border-green-200 text-green-800';
  const icon = type === 'warning' ? <AlertCircle className="h-5 w-5" /> : <CircleCheckBig className="h-5 w-5" />;

  return (
    <div className={`flex items-center space-x-2 rounded-lg p-4 ${className}`}>
      {icon}
      <p className="text-sm">{children}</p>
    </div>
  );
};

export default AlertMessage;