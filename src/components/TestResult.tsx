import React from 'react';

interface TestResultProps {
  result: {
    success: boolean;
    message: string;
    data?: any;
  } | null;
  className?: string;
}

export default function TestResult({ result, className = '' }: TestResultProps) {
  if (!result) return null;

  const resultClass = result.success 
    ? 'bg-green-50 text-green-800 border-green-200' 
    : 'bg-red-50 text-red-800 border-red-200';

  return (
    <div className={`p-4 rounded-lg border ${resultClass} ${className}`}>
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${
          result.success ? 'bg-green-400' : 'bg-red-400'
        }`}></div>
        <p className="text-sm font-medium">{result.message}</p>
      </div>
      {result.data && (
        <details className="mt-2">
          <summary className="text-xs cursor-pointer opacity-75">View Details</summary>
          <pre className="text-xs mt-1 p-2 bg-black bg-opacity-10 rounded overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
