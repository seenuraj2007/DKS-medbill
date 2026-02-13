# WhatsApp & Tally Import Setup Guide

## Overview
DKS StockAlert includes two killer features that our competitors don't have:
1. **WhatsApp Alerts** - Get instant inventory alerts on your phone
2. **1-Click Tally Import** - Migrate from Tally in seconds

## Quick Setup Checklist

### 1. Database Setup (One-time)

Run the database migration script:

```bash
./scripts/setup-db.sh
```

Or manually with psql:

```bash
psql $DATABASE_URL < prisma/migrations/20250205_add_whatsapp_settings/migration.sql
```

### 2. WhatsApp Setup

#### Get Credentials from Meta

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create an app → Add WhatsApp product
3. Add your phone number and verify it
4. Get these credentials:
   - **Phone Number ID**
   - **Access Token** (Temporary or Permanent)
   - **Business Account ID**

#### Add to Environment

Create/Update `.env.local`:

```env
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_ACCESS_TOKEN="your-access-token"
WHATSAPP_BUSINESS_ACCOUNT_ID="your-business-account-id"
```

#### Configure in App

1. Visit: http://localhost:3000/settings
2. Click **WhatsApp** tab
3. Enable toggle
4. Enter your phone number (with country code: +91...)
5. Select notification types
6. Choose language (English/Hindi)
7. Click **Save Settings**
8. Click **Send Test Message** to verify

## Notification Options

### In-App Notifications - ALWAYS FREE ✅

**Features:**
- Real-time alerts in the dashboard
- No setup required
- Works immediately
- Free forever

**Alert Types:**
- Low stock alerts
- Out of stock alerts
- Purchase order updates
- Stock transfer notifications

**Setup:** No configuration needed - works out of the box!
| 500,000 products | ~167,000 | ~₹750/month |

#### Export from Tally

1. Open Tally
2. Gateway → Display → List of Accounts → Stock Items
3. Click **Export**
4. Choose **CSV** or **XML** format
5. Save the file

#### Import to DKS StockAlert

1. Visit: http://localhost:3000/settings
2. Click **Import** tab
3. Upload your Tally file
4. Select location (optional)
5. Enable **Preview Only** to check data
6. Click **Preview**
7. Review the products
8. Disable Preview Only and click **Import**

## Features

### WhatsApp Alerts
- **Low Stock Alerts**: Get notified when stock is below reorder point
- **Out of Stock Alerts**: Critical alerts when stock runs out
- **Purchase Order Updates**: Track PO status
- **Daily Summary**: End-of-day inventory report
- **Bilingual Messages**: Send alerts in English or Hindi

### Tally Import
- **CSV Support**: Import from Tally Excel exports
- **XML Support**: Import from Tally XML files
- **Auto Column Detection**: Automatically finds columns in CSV
- **Data Validation**: Validates product data before import
- **Dry Run Mode**: Preview before importing
- **Merge Mode**: Updates existing products, creates new ones

## Troubleshooting

### WhatsApp Issues

**"WhatsApp service not configured"**
- Check that all three environment variables are set
- Restart the dev server: `npm run dev`
- Verify credentials are from Meta Developer Console

**"Failed to send message"**
- Verify access token hasn't expired
- Check phone number format (+91 98765 43210)
- Ensure recipient is in sandbox (first 1,000 messages free)

**Phone number not found**
- Verify number is registered with WhatsApp
- Wait 5-10 minutes after verification
- Check Meta Business Manager settings

### Tally Import Issues

**"No valid products found"**
- Check CSV format (UTF-8 recommended)
- Verify column headers match Tally export format
- Use provided sample: `scripts/sample-tally.csv`

**"Invalid XML format"**
- Export Tally data in XML format
- Try CSV export instead (simpler)
- Check file encoding

**Migration fails**
- Run: `./scripts/setup-db.sh`
- If that fails, manually run SQL:
  ```bash
  psql $DATABASE_URL < prisma/migrations/20250205_add_whatsapp_settings/migration.sql
  ```

## Detailed Documentation

- **WhatsApp Full Guide**: [`docs/WHATSAPP_SETUP.md`](docs/WHATSAPP_SETUP.md)
- **Sample CSV**: [`scripts/sample-tally.csv`](scripts/sample-tally.csv)

## Next Steps

After setup:

1. ✅ Test WhatsApp with sample alert
2. ✅ Import sample products from Tally
3. ✅ Switch to Hindi if needed
4. ✅ Invite team members
5. ✅ Start managing inventory!

---

**Need Help?**
- Check the WhatsApp setup guide in `docs/WHATSAPP_SETUP.md`
- Review the sample Tally CSV in `scripts/sample-tally.csv`
- Contact support for database migration issues
