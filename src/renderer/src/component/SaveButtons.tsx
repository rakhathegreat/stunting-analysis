import React from 'react';
import { Loader2 } from 'lucide-react';

interface SaveButtonsProps {
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    disabled?: boolean
    appState: string
}

const SaveButtons: React.FC<SaveButtonsProps> = ({ onSave, onCancel, isSaving, appState }) => {
    const disabled = appState === 'saving';
    return (
        <div className="flex w-full h-full justify-between space-x-4 pt-6">
        
            <button
                onClick={onCancel}
                disabled={disabled}
                className="flex w-full items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
                Cancel
            </button>
            <button
                onClick={onSave}
                disabled={disabled}
                className={`flex w-full items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px
                    -4 rounded ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
            </button>
        </div>
    );
}

export default SaveButtons;