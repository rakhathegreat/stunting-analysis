import React from 'react';
import { User } from 'lucide-react';
import FloatingInput from './FloatingInput';
import Alert from './Alert';

interface FormData {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
}

interface DataFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  appState: string;
}

const DataForm: React.FC<DataFormProps> = ({ formData, onFormDataChange, appState }) => {
  const disabled = appState === 'captured' || appState === 'analyzing';
  const isFormValid = formData.id.trim() !== '' && formData.name.trim() !== '' && formData.age > 0;

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="bg-white rounded-lg flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4 sm:mb-4">
        <User className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 sm:text-base">Child Data</h2>
      </div>
      
      <div className="flex flex-col h-full justify-between">

        <FloatingInput
          id="id"
          label="ID"
          type="text"
          value={formData.id}
          onChange={(e) => handleInputChange('id', e.target.value)}
          disabled={disabled}
          required
        />

        <FloatingInput
          id="name"
          label="Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={disabled}
          required
        />

        <FloatingInput
          id="age"
          label="Age"
          type="number"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
          disabled={disabled}
          required
        />

        <div>
            <div className="flex flex-row space-x-2">
              {['male', 'female'].map((genderOption) => (
                <button
                  key={genderOption}
                  onClick={() => handleInputChange('gender', genderOption)}
                  disabled={disabled}
                  className={`flex w-full justify-center items-center space-x-2 px-6 py-2 rounded-md transition-colors md:py-3 sm:text-base ${
                    formData.gender === genderOption
                      ? disabled
                        ? 'bg-blue-300 text-white'
                        : 'bg-blue-600 text-white'
                      : disabled 
                        ? 'border border-blue-300 text-blue-300' 
                        : 'border border-blue-600 text-blue-600'
                    }
                  `}
                >
                  {genderOption.charAt(0).toUpperCase() + genderOption.slice(1)}
                </button>
              ))}
            </div>
        </div>

        <div>
          {isFormValid 
          ? (
            <Alert type="success">Data is valid</Alert>
          ) 
          : (
            <Alert type="warning">
              Please fill out all the fields.
            </Alert>
          )}
        </div>

      </div>
    </div>
  );
};

export default DataForm;