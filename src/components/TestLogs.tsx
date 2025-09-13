import React, { useRef, useEffect } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface TestLogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export default function TestLogs({ logs, onClearLogs }: TestLogsProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📊 Test Logs</h3>
        <button
          onClick={onClearLogs}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
        >
          Clear Logs
        </button>
      </div>
      
      <div 
        ref={logRef}
        className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto"
      >
        {logs.length === 0 ? (
          <div className="text-gray-400">Ready to test...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              <span className={getLogColor(log.type)}>{getLogIcon(log.type)}</span>{' '}
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
