// AxraPay SDK testing utilities

import AxraPay from '@gopremium/axrapay-sdk';

export interface TestConfig {
  publishableKey: string;
  businessId: string;
  sdkToken: string;
}

export interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export class AxraPayTester {
  private axraPay: AxraPay | null = null;
  private isInitialized = false;

  /**
   * Initialize the AxraPay SDK with test configuration
   */
  async initializeSDK(config: TestConfig): Promise<TestResult> {
    try {
      if (!config.publishableKey || !config.businessId) {
        throw new Error('Please provide both publishable key and business ID');
      }

      this.axraPay = new AxraPay({
        environment: 'development',
        publishableKey: config.publishableKey,
        sdkToken: config.sdkToken || 'demo-sdk-token-123',
        businessId: config.businessId,
      });

      this.isInitialized = true;
      
      return {
        success: true,
        message: 'SDK initialized successfully! Business config loaded.',
        data: { initialized: true }
      };
    } catch (error: any) {
      this.isInitialized = false;
      return {
        success: false,
        message: `SDK initialization failed: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test creating a payment intent
   */
  async testPaymentIntent(config: TestConfig): Promise<TestResult> {
    if (!this.isInitialized || !this.axraPay) {
      return {
        success: false,
        message: 'Please initialize the SDK first'
      };
    }

    try {
      const result = await this.axraPay.createPaymentIntent({
        amount: 29.99,
        currency: 'USD',
        businessId: config.businessId,
        description: 'SDK Test Payment'
      });

      return {
        success: true,
        message: `Payment intent created successfully! ID: ${result.id}`,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Payment intent creation failed: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test mounting a card form
   */
  async testCardForm(config: TestConfig, containerId: string): Promise<TestResult> {
    if (!this.isInitialized || !this.axraPay) {
      return {
        success: false,
        message: 'Please initialize the SDK first'
      };
    }

    try {
      // Check if the container exists
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id '${containerId}' not found`);
      }

      // Clear the container and add a placeholder
      container.innerHTML = `
        <div class="card-form-container">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">💳 AxraPay Card Form</h4>
          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div id="axrapay-card-form" class="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center bg-gray-50">
              <div class="text-center text-gray-500">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p class="text-sm">Loading AxraPay Card Form...</p>
                <p class="text-xs text-gray-400 mt-1">This will process your payment directly</p>
              </div>
            </div>
            <div id="cardFormResult" class="mt-4 hidden"></div>
          </div>
        </div>
      `;

      // Use the actual AxraPay SDK mountCardForm method
      await this.axraPay.mountCardForm({
        selector: `#${containerId} #axrapay-card-form`,
        amount: 29.99,
        currency: 'USD',
        businessId: config.businessId,
        customerData: {
          name: 'Test User',
          email: 'test@example.com'
        },
        description: 'Test Payment via AxraPay SDK',
        onSuccess: (result) => {
          this.showCardFormResult(
            container.querySelector('#cardFormResult') as HTMLElement,
            `✅ Payment successful! ID: ${result.id}`, 
            'success',
            result
          );
        },
        onError: (error) => {
          this.showCardFormResult(
            container.querySelector('#cardFormResult') as HTMLElement,
            `❌ Payment failed: ${error}`, 
            'error'
          );
        },
        onCancel: () => {
          this.showCardFormResult(
            container.querySelector('#cardFormResult') as HTMLElement,
            `⚠️ Payment cancelled by user`, 
            'error'
          );
        },
        style: {
          backgroundColor: '#ffffff',
          color: '#374151',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif'
        }
      });

      return {
        success: true,
        message: 'AxraPay card form mounted successfully! Try making a payment.',
        data: { mounted: true, containerId, sdkMethod: 'mountCardForm' }
      };
    } catch (error: any) {
      // Show error in the container if it exists
      const container = document.getElementById(containerId);
      if (container) {
        const formContainer = container.querySelector('#axrapay-card-form');
        if (formContainer) {
          formContainer.innerHTML = `
            <div class="text-center text-red-600 p-4">
              <div class="text-2xl mb-2">❌</div>
              <p class="font-medium">Card Form Mounting Failed</p>
              <p class="text-sm text-red-500 mt-1">${error.message}</p>
            </div>
          `;
        }
      }
      
      return {
        success: false,
        message: `Card form mounting failed: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Show card form result
   */
  private showCardFormResult(resultDiv: HTMLElement, message: string, type: 'success' | 'error', data?: any) {
    if (!resultDiv) return;

    resultDiv.className = `mt-4 p-4 rounded-lg border ${
      type === 'success' 
        ? 'bg-green-50 text-green-800 border-green-200' 
        : 'bg-red-50 text-red-800 border-red-200'
    }`;
    
    if (type === 'success' && data) {
      resultDiv.innerHTML = `
        <div class="mb-2">${message}</div>
        <details class="mt-2">
          <summary class="text-sm cursor-pointer opacity-75">View Payment Details</summary>
          <pre class="text-xs mt-1 p-2 bg-black bg-opacity-10 rounded overflow-auto">
${JSON.stringify(data, null, 2)}
          </pre>
        </details>
      `;
    } else {
      resultDiv.textContent = message;
    }
    
    resultDiv.classList.remove('hidden');
  }

  /**
   * Test mounting a token form
   */
  async testTokenForm(config: TestConfig, containerId: string): Promise<TestResult> {
    if (!this.isInitialized || !this.axraPay) {
      return {
        success: false,
        message: 'Please initialize the SDK first'
      };
    }

    try {
      // Check if the container exists
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id '${containerId}' not found`);
      }

      // Clear the container and add a minimal placeholder to avoid CSS conflicts
      container.innerHTML = `
        <div class="token-form-container">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">🔐 AxraPay Token Form</h4>
          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div id="axrapay-token-form" style="min-height: 400px; width: 100%; position: relative;">
              <div class="text-center text-gray-500" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p class="text-sm">Loading AxraPay Token Form...</p>
                <p class="text-xs text-gray-400 mt-1">This will create a secure token for your card details</p>
              </div>
            </div>
            <div id="tokenFormResult" class="mt-4 hidden"></div>
          </div>
        </div>
      `;

      // Add debugging information
      console.log('Mounting token form with selector:', `#${containerId} #axrapay-token-form`);
      console.log('Container element:', container.querySelector('#axrapay-token-form'));
      
      // Use the actual AxraPay SDK mountTokenForm method
      await this.axraPay.mountTokenForm({
        selector: `#${containerId} #axrapay-token-form`,
        customerData: {
          name: 'Test User',
          email: 'test@example.com',
          metadata: {
            test: true,
            source: 'sdk-test'
          }
        },
        onSuccess: (result) => {
          this.showTokenFormResult(
            container.querySelector('#tokenFormResult') as HTMLElement,
            `✅ Token created successfully! ID: ${result.token.id}`, 
            'success',
            result
          );
        },
        onError: (error) => {
          this.showTokenFormResult(
            container.querySelector('#tokenFormResult') as HTMLElement,
            `❌ Token creation failed: ${error}`, 
            'error'
          );
        },
        onCancel: () => {
          this.showTokenFormResult(
            container.querySelector('#tokenFormResult') as HTMLElement,
            `⚠️ Token creation cancelled by user`, 
            'error'
          );
        },
        // Remove custom styling to let SDK handle its own layout
        // style: {
        //   backgroundColor: '#ffffff',
        //   color: '#374151',
        //   borderRadius: '8px',
        //   padding: '20px',
        //   fontSize: '14px'
        // }
      });

      return {
        success: true,
        message: 'AxraPay token form mounted successfully! Try creating a token.',
        data: { mounted: true, containerId, sdkMethod: 'mountTokenForm' }
      };
    } catch (error: any) {
      // Show error in the container if it exists
      const container = document.getElementById(containerId);
      if (container) {
        const formContainer = container.querySelector('#axrapay-token-form');
        if (formContainer) {
          formContainer.innerHTML = `
            <div class="text-center text-red-600 p-4">
              <div class="text-2xl mb-2">❌</div>
              <p class="font-medium">Token Form Mounting Failed</p>
              <p class="text-sm text-red-500 mt-1">${error.message}</p>
            </div>
          `;
        }
      }
      
      return {
        success: false,
        message: `Token form mounting failed: ${error.message}`,
        data: { error: error.message }
      };
    }
  }


  /**
   * Show token form result
   */
  private showTokenFormResult(resultDiv: HTMLElement, message: string, type: 'success' | 'error', data?: any) {
    if (!resultDiv) return;

    resultDiv.className = `mt-4 p-4 rounded-lg border ${
      type === 'success' 
        ? 'bg-green-50 text-green-800 border-green-200' 
        : 'bg-red-50 text-red-800 border-red-200'
    }`;
    
    if (type === 'success' && data) {
      resultDiv.innerHTML = `
        <div class="mb-2">${message}</div>
        <details class="mt-2">
          <summary class="text-sm cursor-pointer opacity-75">View Token Details</summary>
          <pre class="text-xs mt-1 p-2 bg-black bg-opacity-10 rounded overflow-auto">
${JSON.stringify(data, null, 2)}
          </pre>
        </details>
      `;
    } else {
      resultDiv.textContent = message;
    }
    
    resultDiv.classList.remove('hidden');
  }


  /**
   * Test CORS headers
   */
  async testCORS(config: TestConfig): Promise<TestResult> {
    try {
      const response = await fetch(`https://dev.gopremium.africa/api/sdk/config?businessId=${config.businessId}`, {
        method: 'GET',
        headers: {
          'X-AxraPay-Publishable-Key': config.publishableKey,
          'Authorization': `Bearer ${config.sdkToken || 'demo-sdk-token-123'}`
        }
      });

      if (response.ok) {
        return {
          success: true,
          message: 'CORS test passed! Cross-origin requests are working correctly.',
          data: { status: response.status }
        };
      } else {
        return {
          success: false,
          message: `CORS test failed - HTTP error: ${response.status}`,
          data: { status: response.status }
        };
      }
    } catch (error: any) {
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        return {
          success: false,
          message: `CORS test failed - CORS error: ${error.message}`,
          data: { error: error.message }
        };
      } else {
        return {
          success: false,
          message: `CORS test failed: ${error.message}`,
          data: { error: error.message }
        };
      }
    }
  }

  /**
   * Get initialization status
   */
  isSDKInitialized(): boolean {
    return this.isInitialized;
  }

}
