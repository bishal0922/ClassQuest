import React from 'react';
import { CircleDot, RefreshCw, Circle } from 'lucide-react';

const ImportOptions = ({ stats, activeMode, onModeChange }) => {
  const modes = [
    { id: 'all', label: 'All Events' },
    { id: 'new', label: 'New Only' },
    { id: 'updates', label: 'Updates Only' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="font-medium text-gray-900">Import Options</h4>
          <div className="flex space-x-4 text-sm mt-1">
            <span className="text-green-600 flex items-center">
              <CircleDot className="h-3 w-3 mr-1" /> New: {stats.new}
            </span>
            <span className="text-amber-600 flex items-center">
              <RefreshCw className="h-3 w-3 mr-1" /> Updates: {stats.updates}
            </span>
            <span className="text-gray-600 flex items-center">
              <Circle className="h-3 w-3 mr-1" /> Unchanged: {stats.unchanged}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {modes.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${activeMode === id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImportOptions;