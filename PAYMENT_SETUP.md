# IntaSend Payment Integration Setup Guide

## 🚀 Overview

This guide will help you integrate IntaSend payments into your AI Study Buddy app. The integration includes:

- **Frontend**: Pricing page with subscription plans
- **Backend**: Payment processing and webhook handling
- **Database**: Subscription tracking and user management

## 📋 Prerequisites

1. **IntaSend Account**: Sign up at [intasend.com](https://intasend.com)
2. **Firebase Project**: Already configured for your app
3. **Domain**: For webhook URLs (can use ngrok for development)

## 🔧 Step-by-Step Setup

### 1. IntaSend Account Setup

1. **Create Account**: Sign up at [intasend.com](https://intasend.com)
2. **Verify Account**: Complete KYC verification
3. **Get API Keys**:
   - Go to Dashboard → API Keys
   - Copy your **Secret Key** and **Publishable Key**

### 2. Environment Variables

Add these to your `.env` files:

**Frontend (.env)**

```env
VITE_INTASEND_PUBLISHABLE_KEY=your_publishable_key_here
```

**Backend (.env)**

```env
INTASEND_API_KEY=your_secret_key_here
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Install Dependencies

**Backend**

```bash
cd backend
pnpm add firebase
```

### 4. Webhook Configuration

1. **Get Webhook URL**: Your webhook endpoint will be:

   ```
   https://your-domain.com/api/v1/payment/webhook
   ```

2. **Configure in IntaSend**:

   - Go to Dashboard → Webhooks
   - Add webhook URL
   - Select events: `payment.completed`, `payment.failed`

3. **For Development**: Use ngrok to expose local server:
   ```bash
   npx ngrok http 3001
   ```
   Then use the ngrok URL as your webhook endpoint.

### 5. Database Schema

The integration creates these Firestore collections:

**Users Collection**

```typescript
{
  id: string,
  // ... existing user fields
  subscription: {
    planId: string,
    status: 'active' | 'cancelled' | 'expired' | 'trial',
    startDate: Timestamp,
    endDate: Timestamp,
    cancelledAt?: Timestamp
  }
}
```

**Subscriptions Collection**

```typescript
{
  id: string, // transaction_id
  userId: string,
  planId: string,
  status: 'active' | 'cancelled' | 'expired' | 'trial',
  startDate: Date,
  endDate: Date,
  autoRenew: boolean,
  transactionId: string,
  amount: number,
  currency: string
}
```

**Payment Events Collection**

```typescript
{
  id: string,
  eventType: string,
  transactionId: string,
  userId: string,
  amount: number,
  currency: string,
  timestamp: Timestamp
}
```

## 🎯 Subscription Plans

The app includes three subscription tiers:

### Basic (Free)

- 5 flashcards per day
- Basic study plans
- Standard AI responses
- Community support

### Premium ($9.99/month)

- Unlimited flashcards
- Advanced AI models
- Detailed analytics
- Export features
- Priority support
- Custom study plans

### Pro ($99.99/year)

- Everything in Premium
- API access
- White-label options
- Dedicated support
- Early access to features

## 🔒 Security Considerations

### 1. Webhook Verification

```typescript
// Add this to your webhook endpoint
const verifyWebhookSignature = (headers: any, body: string) => {
  const signature = headers["x-intasend-signature"];
  const expectedSignature = crypto
    .createHmac("sha256", process.env.INTASEND_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return signature === expectedSignature;
};
```

### 2. Rate Limiting

```typescript
// Add rate limiting to payment endpoints
import rateLimit from "express-rate-limit";

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
});

app.use("/api/v1/payment", paymentLimiter);
```

### 3. Input Validation

```typescript
// Validate payment data
const validatePaymentData = (data: any) => {
  const required = ["amount", "currency", "email", "metadata"];
  return required.every((field) => data[field] !== undefined);
};
```

## 🧪 Testing

### 1. Test Mode

IntaSend provides test credentials for development:

- Use test API keys
- Test webhook endpoints
- Verify payment flows

### 2. Test Cards

Use these test card numbers:

- **Visa**: 4000000000000002
- **Mastercard**: 5555555555554444
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### 3. Test Scenarios

1. **Successful Payment**: Complete checkout flow
2. **Failed Payment**: Use invalid card
3. **Webhook Processing**: Verify subscription activation
4. **Subscription Management**: Test cancellation

## 🚀 Deployment

### 1. Production Environment

```bash
# Set production environment variables
NODE_ENV=production
INTASEND_API_KEY=your_live_secret_key
INTASEND_PUBLISHABLE_KEY=your_live_publishable_key
```

### 2. Webhook URL

Update webhook URL to your production domain:

```
https://your-app.com/api/v1/payment/webhook
```

### 3. SSL Certificate

Ensure your domain has SSL certificate for secure payments.

## 📊 Monitoring

### 1. Payment Analytics

Track these metrics:

- Conversion rate
- Revenue per user
- Churn rate
- Payment success rate

### 2. Error Monitoring

Monitor for:

- Failed payments
- Webhook errors
- Subscription issues

### 3. Logs

```typescript
// Add comprehensive logging
console.log("Payment processed:", {
  userId: webhookData.metadata.userId,
  planId: webhookData.metadata.planId,
  amount: webhookData.amount,
  status: webhookData.status,
});
```

## 🔧 Customization

### 1. Custom Plans

Modify `getAvailablePlans()` in `payment.ts`:

```typescript
getAvailablePlans(): PaymentPlan[] {
  return [
    {
      id: 'custom',
      name: 'Custom Plan',
      price: 19.99,
      currency: 'USD',
      interval: 'monthly',
      features: ['Your custom features'],
      description: 'Your custom description'
    }
  ];
}
```

### 2. Payment Methods

IntaSend supports:

- Credit/Debit Cards
- Mobile Money (M-Pesa, Airtel Money)
- Bank Transfers
- USSD

### 3. Currency Support

Supported currencies:

- USD, EUR, GBP
- KES (Kenyan Shilling)
- Other local currencies

## 🆘 Troubleshooting

### Common Issues

1. **Webhook Not Receiving**

   - Check webhook URL is correct
   - Verify server is accessible
   - Check firewall settings

2. **Payment Fails**

   - Verify API keys are correct
   - Check card details
   - Verify account is verified

3. **Subscription Not Activated**
   - Check webhook processing
   - Verify database connection
   - Check error logs

### Support Resources

- **IntaSend Docs**: [docs.intasend.com](https://docs.intasend.com)
- **API Reference**: [api.intasend.com](https://api.intasend.com)
- **Support**: support@intasend.com

## 📈 Next Steps

1. **Analytics Dashboard**: Build payment analytics
2. **Subscription Management**: Add user subscription page
3. **Payment History**: Show transaction history
4. **Refunds**: Implement refund functionality
5. **Multi-currency**: Support multiple currencies

---

**Need Help?** Contact support@intasend.com or check their documentation for detailed API references.
