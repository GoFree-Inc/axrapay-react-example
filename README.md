# AxraPay SDK (Multi‑Processor)

<p align="center">
  <img src="https://gopremium.africa/logo.png" alt="GoPremium / AxraPay Logo" height="56" />
</p>

[![npm version](https://badge.fury.io/js/%40gopremium%2Faxrapay-sdk.svg)](https://badge.fury.io/js/%40gopremium%2Faxrapay-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A modern, TypeScript-first SDK for seamless payment integration with AxraPay, built for GoPremium's payment infrastructure. This npm package provides a multi‑processor client (Stripe, Adyen, CyberSource) and processor‑agnostic React components.

## ✨ Features

- 🚀 **React Components** - Pre-built, customizable payment forms (CardForm, PaymentButton, TokenForm)
- 🔁 **Multi‑Processor Orchestration** — Intelligent routing, fallback, cost/regional scaffolding
- 🧩 **Processor‑Agnostic UI** — Universal components call adapter UI hooks
- 🔒 **Enterprise Security** - PCI DSS compliant with end-to-end encryption
- 🌍 **Global Payments** - Support for 50+ currencies and local payment methods
- 📱 **Mobile Responsive** - Optimized for all devices and screen sizes
- 🎨 **Customizable UI** - Business branding with custom colors, logos, and fonts
- ⚡ **TypeScript First** - Full type safety and excellent developer experience
- 🔄 **Tokenized Payments** - Save cards for one-click payments and recurring billing
- 💳 **Card Tokenization** - Secure card saving with TokenForm component
- 📊 **Real-time Analytics** - Comprehensive payment performance metrics

## 🚀 Quick Start

### Installation

```bash
npm install @gopremium/axrapay-sdk
# or
yarn add @gopremium/axrapay-sdk
# or
bun add @gopremium/axrapay-sdk
```

### Basic Setup (Single‑Processor client)

```typescript
import { AxraPay } from '@gopremium/axrapay-sdk';

const axraPay = new AxraPay({
  publishableKey: 'pk_live_your_gopremium_key', // Your GoPremium publishable key
  businessId: 'your-business-id',
  // Provide either a short-lived sdkToken or a function to fetch it
  getSdkToken: async () => {
    const response = await fetch('/api/axrapay/token', { method: 'POST' });
    const { token } = await response.json();
    return token;
  },
  environment: 'development' // or 'production' - determines API base URL
});

// Initialize the SDK
await axraPay.initialize();
```

### Multi‑Processor Client

Use `MultiProcessorAxraPay` to enable processor selection and orchestration. Adapters are auto‑initialized from business config; you can also pass an explicit `processor` per operation.

```ts
import { MultiProcessorAxraPay } from '@gopremium/axrapay-sdk';

const mp = new MultiProcessorAxraPay({
  publishableKey: 'pk_live_your_gopremium_key',
  businessId: 'your-business-id',
  environment: 'production',
  getSdkToken: async () => fetch('/api/axrapay/token', { method: 'POST' }).then(r => r.json()).then(r => r.token)
});

await mp.initialize();

// Optional explicit processor selection (otherwise routing engine picks)
const result = await mp.createPaymentIntent({ amount: 2999, currency: 'USD', businessId: 'your-business-id', processor: 'stripe' });
```

### Authentication Flow

The SDK uses a secure authentication flow:

1. **Developer provides GoPremium publishable key** - This is your business's GoPremium publishable key
2. **SDK authenticates with GoPremium API** - Uses your publishable key + SDK token for authentication (Authorization header is required)
3. **GoPremium API returns SDK configuration** - Including the SDK publishable key from GoPremium backend
4. **SDK initializes** - Uses the returned SDK publishable key for payment processing

```typescript
// Your GoPremium publishable key
const axraPay = new AxraPay({
  publishableKey: 'pk_live_your_gopremium_key',
  businessId: 'your-business-id',
  getSdkToken: async () => fetch('/api/axrapay/token', { method: 'POST' }).then(r => r.json()).then(r => r.token)
});
```

### Environment Configuration

The SDK supports different environments that determine which API base URL to use:

- **`development`**: Uses `https://dev.gopremium.africa` for API calls
- **`production`**: Uses `https://gopremium.africa` for API calls (default)

```typescript
// Development environment
const axraPay = new AxraPay({
  publishableKey: 'pk_test_your_gopremium_key',
  businessId: 'your-business-id',
  environment: 'development'
});

// Production environment (default)
const axraPay = new AxraPay({
  publishableKey: 'pk_live_your_gopremium_key',
  businessId: 'your-business-id',
  environment: 'production'
});
```

> Browser bundle also supports an optional `baseUrl` override via `window.AxraPayConfig.baseUrl`.

### Universal, Processor‑Agnostic Components

These components call adapter UI hooks through the multi‑processor client and work across supported processors.

```tsx
import { useState } from 'react';
import { MultiProcessorAxraPay } from '@gopremium/axrapay-sdk';
import { ProcessorSelector } from '@gopremium/axrapay-sdk';
import { UniversalCardForm } from '@gopremium/axrapay-sdk';

const client = new MultiProcessorAxraPay({ publishableKey: 'pk_...', businessId: 'biz_123' });

export default function Checkout() {
  const [processor, setProcessor] = useState<'stripe' | 'adyen' | 'cybersource'>();
  return (
    <div>
      <ProcessorSelector client={client} value={processor} onChange={setProcessor} />
      <UniversalCardForm
        client={client}
        selector="#pay-form"
        amount={1999}
        currency="USD"
        businessId="biz_123"
        processor={processor}
        onSuccess={(r) => console.log('success', r)}
        onError={(e) => console.error(e)}
      />
    </div>
  );
}
```

### PaymentIntent Response (Compatibility)

`createPaymentIntent()` returns both keys for compatibility:

```ts
const intent = await axraPay.createPaymentIntent({ /* ... */ });
console.log(intent.clientSecret); // camelCase
console.log((intent as any).client_secret); // snake_case alias
```

### Resetting the SDK

```ts
axraPay.reset();
await axraPay.initialize();
```

### Analytics

The SDK emits minimal analytics events to `/api/sdk/analytics/event` (e.g., initialization and payment events). You can handle or filter these on your backend. Future versions will add an opt-out flag.

## React Components (Legacy, single‑processor)

#### Card Form Component

```tsx
import { CardForm } from '@gopremium/axrapay-sdk';

function PaymentPage() {
  const businessConfig = {
    id: 'your-business-id',
    name: 'Your Business',
    logo: '/your-logo.png',
    primaryColor: '#3b82f6',
    allowedPaymentMethods: ['card', 'bank', 'crypto']
  };

  return (
    <CardForm
      amount={29.99}
      currency="USD"
      businessConfig={businessConfig}
      customerData={{ name: 'John Doe', email: 'john@example.com' }}
      description="Payment for services"
      environment="production"
      publishableKey="pk_live_your_gopremium_key"
      onSuccess={(result) => console.log('Payment successful:', result)}
      onError={(error) => console.error('Payment failed:', error)}
    />
  );
}
```

#### Payment Button Component

```tsx
import { PaymentButton } from '@gopremium/axrapay-sdk';

function QuickPayment() {
  return (
    <PaymentButton
      amount={49.99}
      currency="USD"
      businessConfig={businessConfig}
      customerData={customerData}
      description="One-time payment"
      environment="production"
      publishableKey="pk_live_your_gopremium_key"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

#### Token Form Component

```tsx
import { TokenForm } from '@gopremium/axrapay-sdk';

function SaveCardForm() {
  const businessConfig = {
    id: 'your-business-id',
    name: 'Your Business',
    logo: '/your-logo.png',
    primaryColor: '#3b82f6',
    allowedPaymentMethods: ['card']
  };

  const customerData = {
    name: 'John Doe',
    email: 'john@example.com',
    metadata: { userId: 'user_123', plan: 'premium' }
  };

  return (
    <TokenForm
      businessConfig={businessConfig}
      customerData={customerData}
      environment="production"
      publishableKey="pk_live_your_gopremium_key"
      onSuccess={(r) => console.log('Token created:', r.token.id)}
      onError={(e) => console.error('Token creation failed:', e)}
      style={{ backgroundColor: '#10b981', borderRadius: '12px', padding: '24px' }}
    />
  );
}
```

## 💳 Tokenized Payments

The SDK supports secure card tokenization for saving payment methods and processing future payments without handling sensitive card data.

### Using Tokens for Payments

```typescript
import { AxraPay } from '@gopremium/axrapay-sdk';

const axraPay = new AxraPay({
  publishableKey: 'pk_live_your_gopremium_key',
  businessId: 'your-business-id',
  environment: 'production',
  getSdkToken: async () => fetch('/api/axrapay/token', { method: 'POST' }).then(r => r.json()).then(r => r.token)
});

await axraPay.initialize();

const result = await axraPay.tokenizedCardPayment({
  amount: 29.99,
  currency: 'USD',
  businessId: 'your-business-id',
  paymentId: 'payment_123',
  customerId: 'customer_456',
  tokenId: 'tok_1234567890',
  description: 'Subscription payment',
  metadata: { orderId: 'order_789' }
});
```

### Programmatic Token Creation

```typescript
const { token } = await axraPay.createToken(cardElement, { name: 'John Doe', email: 'john@example.com' });
console.log('Token created:', token.id);
```

### Mount Token Form (Vanilla JS)

```typescript
await axraPay.mountTokenForm({
  selector: '#token-form-container',
  customerData: { name: 'John Doe', email: 'john@example.com', metadata: { userId: 'user_123' } },
  onSuccess: (result) => console.log('Token created:', result.token.id),
  onError: (error) => console.error('Token creation failed:', error),
  style: { backgroundColor: '#10b981', borderRadius: '8px' }
});
```

## 📚 Documentation

For comprehensive documentation, visit:
- [API Reference](https://gopremium.africa/docs)
- [Integration Examples](https://gopremium.africa/docs)
- [Quick Start Guide](https://gopremium.africa/docs)

## 🔧 Configuration

### Business Configuration

```typescript
interface BusinessConfig {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  fontFamily?: string;
  allowedPaymentMethods?: string[];
}
```

### SDK Configuration

```typescript
interface SDKConfig {
  publishableKey: string;
  businessId: string;
  sdkToken?: string; // optional if getSdkToken is provided
  getSdkToken?: () => Promise<string>;
  environment?: 'development' | 'production';
}

// Multi‑processor config
interface MultiProcessorSDKConfig extends SDKConfig {
  routing?: {
    strategy?: 'explicit' | 'automatic' | 'cost_optimized' | 'performance_based' | 'regional' | 'ab_test';
  };
}
```

## 📦 Package Structure

```
@gopremium/axrapay-sdk/
├── dist/
│   ├── index.js
│   ├── index.esm.js
│   ├── index.d.ts
│   ├── components/
│   ├── core/
│   └── examples/
├── components/
├── core/
└── examples/
```

## 🔌 API Reference

- `AxraPay` - Main SDK class
- `MultiProcessorAxraPay` - Multi‑processor client (orchestrator + adapters)
- `processDirectPayment()` - Process payments with encrypted card data
- `savePaymentMethod()` - Save payment methods for future use
- `getSavedPaymentMethods()` - List saved payment methods
- `deleteSavedPaymentMethod()` - Remove saved payment methods
- `createPaymentIntent()` - Returns `{ id, status, amount, currency, clientSecret }` plus `client_secret` alias
- `createToken()` - Create a token from a Card Element
- `tokenizedCardPayment()` - Process using tokenized card
- `mountCardForm()` - Mounts a complete card form and processes payment
- `mountTokenForm()` - Mounts a form that creates a token
- `reset()` - Reset the instance for re-initialization

### Universal Components
- `ProcessorSelector`
- `UniversalCardForm`
- `UniversalPaymentButton`
- `UniversalTokenForm`

## 🚨 Error Handling

Standardized error types: `validation_error`, `payment_error`, `network_error`, `configuration_error`, `initialization_error`.

```typescript
try {
  const result = await axraPay.processDirectPayment(params);
} catch (error) {
  // Handle according to error.type
}
```

## 📊 Analytics & Monitoring

Minimal analytics are sent to the GoPremium endpoint for operational visibility. No PII is transmitted. Future versions will add an opt-out config flag.

## 🤝 Support

- **Documentation**: [gopremium.africa/docs](https://gopremium.africa/docs)
- **GitHub Issues**: [github.com/gopremium/gopremium-website/issues](https://github.com/gopremium/gopremium-website/issues)
- **Email Support**: [support@gopremium.africa](mailto:support@gopremium.africa)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Changelog

### v1.2.0
- Multi‑processor orchestrator (Stripe, Adyen, CyberSource)
- Universal components (processor‑agnostic UI)
- Production build: no sourcemaps copied to public

### v1.1.0
- Unified config endpoint and strict Authorization header (mandatory token)
- Implemented full card form flow with Card Elements in core client
- Added `client_secret` alias in PaymentIntent responses
- Added `reset()` method on SDK instance
- Synced SDK version across browser and npm bundles
- Environment-aware base URL in browser bundle

---

Built with ❤️ by the GoPremium team
