import React, { useState, useCallback } from 'react';
import { AxraPayTester, TestConfig, TestResult } from './lib/axrapay';
import TestSection from './components/TestSection';
import TestResultComponent from './components/TestResult';
import TestLogs from './components/TestLogs';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function App() {
  const [config, setConfig] = useState<TestConfig>({
    publishableKey: 'pk_test_demo_key',
    businessId: 'demo-business-123',
    sdkToken: ''
  });

  const [tester] = useState(() => new AxraPayTester());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<{
    init: TestResult | null;
    payment: TestResult | null;
    cardForm: TestResult | null;
    tokenForm: TestResult | null;
    cors: TestResult | null;
  }>({
    init: null,
    payment: null,
    cardForm: null,
    tokenForm: null,
    cors: null
  });

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toISOString().substr(11, 12);
    setLogs(prev => [...prev, { timestamp, message, type }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const testSDKInitialization = useCallback(async () => {
    addLog('Starting SDK initialization test...');
    setResults(prev => ({ ...prev, init: null }));

    try {
      const result = await tester.initializeSDK(config);
      setResults(prev => ({ ...prev, init: result }));
      
      if (result.success) {
        addLog('SDK initialized successfully!', 'success');
      } else {
        addLog(`SDK initialization failed: ${result.message}`, 'error');
      }
    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        message: `SDK initialization failed: ${error.message}`
      };
      setResults(prev => ({ ...prev, init: errorResult }));
      addLog(`SDK initialization failed: ${error.message}`, 'error');
    }
  }, [config, tester, addLog]);

  const testPaymentIntent = useCallback(async () => {
    if (!tester.isSDKInitialized()) {
      setResults(prev => ({ 
        ...prev, 
        payment: { success: false, message: 'Please initialize the SDK first' }
      }));
      return;
    }

    addLog('Testing payment intent creation...');
    setResults(prev => ({ ...prev, payment: null }));

    try {
      const result = await tester.testPaymentIntent(config);
      setResults(prev => ({ ...prev, payment: result }));
      
      if (result.success) {
        addLog(`Payment intent created: ${result.data?.id}`, 'success');
      } else {
        addLog(`Payment intent creation failed: ${result.message}`, 'error');
      }
    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        message: `Payment intent creation failed: ${error.message}`
      };
      setResults(prev => ({ ...prev, payment: errorResult }));
      addLog(`Payment intent creation failed: ${error.message}`, 'error');
    }
  }, [config, tester, addLog]);

  const testCardForm = useCallback(async () => {
    if (!tester.isSDKInitialized()) {
      setResults(prev => ({ 
        ...prev, 
        cardForm: { success: false, message: 'Please initialize the SDK first' }
      }));
      return;
    }

    addLog('Testing card form mounting...');
    setResults(prev => ({ ...prev, cardForm: null }));

    try {
      const result = await tester.testCardForm(config, 'cardFormContainer');
      setResults(prev => ({ ...prev, cardForm: result }));
      
      if (result.success) {
        addLog('Card form mounted successfully!', 'success');
      } else {
        addLog(`Card form mounting failed: ${result.message}`, 'error');
      }
    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        message: `Card form mounting failed: ${error.message}`
      };
      setResults(prev => ({ ...prev, cardForm: errorResult }));
      addLog(`Card form mounting failed: ${error.message}`, 'error');
    }
  }, [config, tester, addLog]);

  const testTokenForm = useCallback(async () => {
    if (!tester.isSDKInitialized()) {
      setResults(prev => ({ 
        ...prev, 
        tokenForm: { success: false, message: 'Please initialize the SDK first' }
      }));
      return;
    }

    addLog('Testing token form mounting...');
    setResults(prev => ({ ...prev, tokenForm: null }));

    try {
      const result = await tester.testTokenForm(config, 'tokenFormContainer');
      setResults(prev => ({ ...prev, tokenForm: result }));
      
      if (result.success) {
        addLog('Token form mounted successfully!', 'success');
      } else {
        addLog(`Token form mounting failed: ${result.message}`, 'error');
      }
    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        message: `Token form mounting failed: ${error.message}`
      };
      setResults(prev => ({ ...prev, tokenForm: errorResult }));
      addLog(`Token form mounting failed: ${error.message}`, 'error');
    }
  }, [config, tester, addLog]);

  const testCORS = useCallback(async () => {
    addLog('Testing CORS headers...');
    setResults(prev => ({ ...prev, cors: null }));

    try {
      const result = await tester.testCORS(config);
      setResults(prev => ({ ...prev, cors: result }));
      
      if (result.success) {
        addLog('CORS test passed - Cross-origin request successful!', 'success');
      } else {
        addLog(`CORS test failed: ${result.message}`, 'error');
      }
    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        message: `CORS test failed: ${error.message}`
      };
      setResults(prev => ({ ...prev, cors: errorResult }));
      addLog(`CORS test failed: ${error.message}`, 'error');
    }
  }, [config, tester, addLog]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 AxraPay SDK - External Developer Test</h1>
            <p className="text-gray-600">Test the AxraPay SDK integration from an external domain</p>
          </div>

          {/* Configuration Section */}
          <TestSection
            title="Configuration"
            description="Configure your AxraPay credentials for testing"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GoPremium Publishable Key:
                </label>
                <input
                  type="text"
                  value={config.publishableKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, publishableKey: e.target.value }))}
                  placeholder="pk_test_your_key_here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business ID:
                </label>
                <input
                  type="text"
                  value={config.businessId}
                  onChange={(e) => setConfig(prev => ({ ...prev, businessId: e.target.value }))}
                  placeholder="your-business-id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SDK Token (or leave empty for demo):
                </label>
                <input
                  type="text"
                  value={config.sdkToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, sdkToken: e.target.value }))}
                  placeholder="your-sdk-token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </TestSection>

          {/* SDK Initialization Test */}
          <TestSection
            title="🧪 SDK Initialization Test"
            description="Test if the SDK can initialize and load business configuration from an external domain"
          >
            <button
              onClick={testSDKInitialization}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Test SDK Initialization
            </button>
            <TestResultComponent result={results.init} className="mt-4" />
          </TestSection>

          {/* Payment Intent Test */}
          <TestSection
            title="💳 Payment Intent Test"
            description="Test creating a payment intent through the SDK"
          >
            <button
              onClick={testPaymentIntent}
              disabled={!tester.isSDKInitialized()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Payment Intent
            </button>
            <TestResultComponent result={results.payment} className="mt-4" />
          </TestSection>

          {/* Card Form Test */}
          <TestSection
            title="💳 Card Form Test"
            description="Test mounting a card form for direct payments"
          >
            <div className="space-x-4">
              <button
                onClick={testCardForm}
                disabled={!tester.isSDKInitialized()}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Mount Card Form
              </button>
              <button
                onClick={() => {
                  const container = document.getElementById('cardFormContainer');
                  if (container) container.innerHTML = '';
                  addLog('Card form cleared');
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Card Form
              </button>
            </div>
            <TestResultComponent result={results.cardForm} className="mt-4" />
            <div 
              id="cardFormContainer"
              className="mt-4 min-h-48 border border-gray-200 rounded-lg p-5 bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <p className="text-gray-500 text-center">Card form will appear here when mounted</p>
            </div>
          </TestSection>

          {/* Token Form Test */}
          <TestSection
            title="🔐 Token Form Test"
            description="Test mounting a token form for secure card tokenization"
          >
            <div className="space-x-4">
              <button
                onClick={testTokenForm}
                disabled={!tester.isSDKInitialized()}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Mount Token Form
              </button>
              <button
                onClick={() => {
                  const container = document.getElementById('tokenFormContainer');
                  if (container) container.innerHTML = '';
                  addLog('Token form cleared');
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Token Form
              </button>
            </div>
            <TestResultComponent result={results.tokenForm} className="mt-4" />
            <div 
              id="tokenFormContainer"
              className="mt-4 min-h-48 border border-gray-200 rounded-lg p-5 bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <p className="text-gray-500 text-center">Token form will appear here when mounted</p>
            </div>
          </TestSection>

          {/* CORS Test */}
          <TestSection
            title="🔧 CORS Test"
            description="Test if CORS headers are properly set for SDK endpoints"
          >
            <button
              onClick={testCORS}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Test CORS Headers
            </button>
            <TestResultComponent result={results.cors} className="mt-4" />
          </TestSection>

          {/* Test Logs */}
          <TestLogs logs={logs} onClearLogs={clearLogs} />
        </div>
      </div>
    </div>
  );
}

