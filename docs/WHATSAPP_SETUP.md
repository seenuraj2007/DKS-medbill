# WhatsApp Business API Setup Guide

Complete guide to enable WhatsApp alerts for your DKS StockAlert application.

## Prerequisites

- Meta Business Account (Facebook)
- WhatsApp Business Account
- Credit card for verification (won't be charged for sandbox)

---

## Step 1: Create Meta Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **"Get Started"** and create an account
3. Complete your profile

---

## Step 2: Create a WhatsApp App

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Click **"Create App"**
3. Select app type: **"Business"**
4. Fill in app details:
   - **App Name**: `DKS StockAlert WhatsApp`
   - **App Contact Email**: Your email
   - **Business Account**: Select or create one
5. Click **"Create App"**

---

## Step 3: Add WhatsApp Product

1. In your app dashboard, scroll to **"Add Products"**
2. Find **"WhatsApp"** and click **"Set Up"**

---

## Step 4: Configure WhatsApp

1. **Select or Create Business Account**
   - If you have one, select it
   - Otherwise, click **"Create Business Account"**

2. **Add Phone Number**
   - Click **"Add Phone Number"**
   - Enter your business phone number
   - Select **"Verify via Text Message"**
   - Enter the verification code sent to your phone

3. **Get Your Credentials**

After adding the phone number, you'll see:

### Required Credentials:

| Credential | Location | Example |
|------------|----------|---------|
| **Phone Number ID** | API Setup > Phone Number ID | `123456789012345` |
| **Access Token** | API Setup > Access Token | `EAAxxxxxxxx...` |
| **Business Account ID** | Business Manager > Account Settings | `987654321098765` |

---

## Step 5: Configure DKS StockAlert

Add these environment variables to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id-here"
WHATSAPP_ACCESS_TOKEN="your-access-token-here"
WHATSAPP_BUSINESS_ACCOUNT_ID="your-business-account-id-here"
```

### Example:
```env
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
WHATSAPP_BUSINESS_ACCOUNT_ID="987654321098765"
```

---

## Step 6: Test in Sandbox (Free)

The WhatsApp Business API provides a **sandbox mode** for testing:

1. In the Meta Developer Console, go to **"WhatsApp"** > **"API Setup"**
2. Add test phone numbers (up to 5 numbers for free)
3. Send test messages to verify integration

---

## Step 7: Configure in DKS StockAlert

1. Start your application:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/settings`

3. Click **"WhatsApp"** tab

4. **Enable WhatsApp Alerts**:
   - Toggle the switch to ON

5. **Enter Your Phone Number**:
   - Format: `+91 98765 43210` (with country code)

6. **Select Notification Types**:
   - ✅ Low Stock Alerts
   - ✅ Out of Stock Alerts
   - ✅ Purchase Order Updates
   - ✅ Daily Summary (optional)

7. **Choose Language**:
   - English or Hindi

8. **Send Test Message**:
   - Click **"Send Test Message"** button
   - You should receive a welcome message on WhatsApp

---

## Step 8: Production Setup (Optional)

To send messages to any phone number (not just test numbers):

### 1. Business Verification
1. Go to Business Manager: [business.facebook.com](https://business.facebook.com)
2. Complete **Business Verification**:
   - Upload business documents
   - Verify domain
   - Wait for approval (1-3 business days)

### 2. Add Payment Method
1. In Business Manager, go to **"Billing"**
2. Add a credit card
3. Set up billing threshold

### 3. Pricing
- **First 1,000 conversations/month**: FREE
- **Additional conversations**: ~₹0.50 - ₹3.00 per message (varies by country)

---

## Troubleshooting

### Issue: "WhatsApp service not configured"
**Solution**: Check that all three environment variables are set correctly in `.env`

### Issue: "Failed to send message"
**Solution**: 
- Verify your access token hasn't expired
- Check that the phone number is in international format (+91...)
- Ensure the phone number is added to test numbers (sandbox mode)

### Issue: "Phone number not found"
**Solution**: 
- Make sure the phone number is registered with WhatsApp
- Verify the number in Meta Business Manager
- Wait 5-10 minutes after verification

### Issue: "Access token expired"
**Solution**: 
- Go to Meta Developer Console
- Generate a new access token
- Update your `.env` file
- Restart the application

---

## Message Templates

DKS StockAlert uses the following message types:

### 1. Low Stock Alert (English)
```
🚨 Low Stock Alert

📦 Product: {productName}
📊 Current Stock: {currentStock} units
⚠️ Reorder Point: {reorderPoint} units

Please restock soon to avoid stockouts!

DKS StockAlert
```

### 2. Out of Stock Alert (Hindi)
```
🚨 स्टॉक खत्म होने की चेतावनी

📦 उत्पाद: {productName}
📊 वर्तमान स्टॉक: 0 यूनिट

⚠️ यह उत्पाद पूरी तरह से खत्म हो गया है! 
कृपया तुरंत स्टॉक भरें।

DKS StockAlert
```

### 3. Daily Summary
```
📊 Daily Inventory Summary

📦 Total Products: {totalProducts}
💰 Stock Value: ₹{totalStockValue}

⚠️ Alerts:
• {lowStockCount} products low on stock
• {outOfStockCount} products out of stock

DKS StockAlert
```

---

## Security Best Practices

1. **Never commit your access token to Git**
   - Always use `.env` file
   - Add `.env` to `.gitignore`

2. **Rotate access tokens regularly**
   - Generate new tokens every 90 days
   - Revoke old tokens immediately

3. **Use environment-specific tokens**
   - Development: Sandbox token
   - Production: Live token

4. **Monitor usage**
   - Check Meta Business Manager for usage stats
   - Set up billing alerts

---

## Next Steps

Once WhatsApp is configured:

1. ✅ Import your data from Tally (Settings > Import)
2. ✅ Switch to Hindi language (Settings > Language)
3. ✅ Add your team members
4. ✅ Start managing inventory with WhatsApp alerts!

---

## Support

Need help? Contact us:
- 📧 Email: support@dksstockalert.com
- 💬 WhatsApp: +91-XXXXXXXXXX
- 📚 Docs: https://docs.dksstockalert.com

---

**🎉 You're now ready to receive WhatsApp alerts for your inventory!**
