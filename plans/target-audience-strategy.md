# DKS StockAlert Target Audience Strategy
## User Personas, Use Cases & Feature Roadmap

---

## Executive Summary

Based on analysis of DKS StockAlert's current features (WhatsApp alerts, Tally integration, GST invoicing, multi-location inventory), we identify **Indian Small and Medium Retailers/Distributors** as the primary target audience. This document defines user personas, their pain points, workflows, and a prioritized feature roadmap.

---

## Primary Target Audience

### **Indian SMB Retailers & Distributors**
**Businesses with ₹10L - ₹5Cr annual turnover**

#### Characteristics:
- 1-50 employees
- 1-5 business locations (shops, warehouses)
- Currently using Tally ERP or manual methods
- Need for GST-compliant invoicing
- Mobile-first operations
- Price-sensitive but value-conscious
- Non-technical business owners

#### Industry Verticals:
1. **Electronics & Mobile Accessories** - High-value items, serial numbers needed
2. **Pharmaceuticals & Healthcare** - Batch tracking, expiry dates critical
3. **FMCG Distribution** - High volume, low margin, fast-moving
4. **Auto Parts & Accessories** - SKU variety, supplier management
5. **Building Materials & Hardware** - Multi-location, bulk quantities

---

## User Personas

### Persona 1: Rajesh - The Retail Store Owner

```
┌─────────────────────────────────────────────────────────────┐
│  RAJESH SHARMA                                              │
│  42 years old | Delhi                                       │
│  Owner of Sharma Electronics                                │
│  2 locations | 8 employees | ₹80L annual turnover           │
└─────────────────────────────────────────────────────────────┘
```

**Background:**
- Started business 15 years ago with a small shop
- Now has a main store + warehouse
- Uses Tally ERP for accounting, manual registers for inventory
- Son helps with technology but Rajesh prefers simple solutions

**Goals:**
- Prevent stockouts of fast-moving items
- Track inventory across both locations
- Send GST invoices instantly to customers
- Get alerts when stock is low
- Reduce time spent on inventory management

**Pain Points:**
- ❌ Loses sales due to stockouts - doesn't know until customer asks
- ❌ Manual stock counting takes 2 days every month
- ❌ Difficult to track which items are at which location
- ❌ Customers call asking for stock availability
- ❌ Supplier payments get delayed due to poor tracking
- ❌ GST filing is stressful - needs accurate data

**Current Workaround:**
- Calls warehouse staff to check stock
- Uses WhatsApp to communicate with employees
- Maintains Excel sheets that are often outdated

**Technology Comfort:** Low-Medium
- Uses smartphone for calls, WhatsApp, basic apps
- Comfortable with Tally but finds it complex
- Prefers visual interfaces over text-heavy screens

---

### Persona 2: Priya - The Pharmacy Distributor

```
┌─────────────────────────────────────────────────────────────┐
│  PRIYA PATEL                                                │
│  35 years old | Ahmedabad                                   │
│  Director, MedPlus Distributors                             │
│  1 warehouse | 12 employees | ₹2Cr annual turnover          │
└─────────────────────────────────────────────────────────────┘
```

**Background:**
- MBA graduate, took over family business 5 years ago
- Supplies medicines to 50+ retail pharmacies
- Highly regulated industry - needs batch tracking
- Deals with 200+ SKUs from 30 suppliers

**Goals:**
- Track batch numbers and expiry dates
- Prevent expired stock losses
- Quick order processing for pharmacy clients
- Maintain compliance with drug regulations
- Optimize working capital - not too much stock

**Pain Points:**
- ❌ Expired medicines cause ₹50K+ losses annually
- ❌ Drug inspector requires batch-level records
- ❌ Cannot recall specific batches when needed
- ❌ Manual expiry tracking in Excel is error-prone
- ❌ Clients demand quick delivery - need real-time stock info
- ❌ Returns management is chaotic

**Critical Requirements:**
- Batch/lot tracking with expiry dates
- FEFO (First Expiry First Out) picking
- Expiry alerts 3-6 months in advance
- Quick stock lookup by batch number

**Technology Comfort:** Medium-High
- Uses laptop and smartphone
- Comfortable with cloud software
- Wants automation and integrations

---

### Persona 3: Amit - The Field Sales Executive

```
┌─────────────────────────────────────────────────────────────┐
│  AMIT KUMAR                                                 │
│  28 years old | Bangalore                                   │
│  Sales Executive at Krishna Distributors                    │
│  Visits 15-20 shops daily                                   │
└─────────────────────────────────────────────────────────────┘
```

**Background:**
- Works for a FMCG distribution company
- Visits retail shops to take orders
- Needs to check stock availability on the go
- Paid commission on sales

**Goals:**
- Check real-time stock before promising delivery
- Take orders on the spot
- Process orders quickly
- Minimize returns due to stock unavailability

**Pain Points:**
- ❌ Calls office to check stock - line often busy
- ❌ Promises items that are out of stock
- ❌ Loses credibility with shop owners
- ❌ Manual order writing - errors and delays
- ❌ Doesn't know which items are running low

**Critical Requirements:**
- Mobile app with offline support
- Real-time stock visibility
- Quick order entry
- Customer order history

**Technology Comfort:** High
- Heavy smartphone user
- Prefers mobile apps over web
- Needs fast, responsive interface

---

### Persona 4: Sunita - The Warehouse Manager

```
┌─────────────────────────────────────────────────────────────┐
│  SUNITA DEVI                                                │
│  38 years old | Jaipur                                      │
│  Warehouse Manager at Rajasthan Traders                      │
│  Manages 5000+ SKUs | 3 staff members                       │
└─────────────────────────────────────────────────────────────┘
```

**Background:**
- 10 years of warehouse experience
- Responsible for receiving, storing, and dispatching goods
- Reports to the business owner
- Limited English proficiency

**Goals:**
- Accurate stock counts
- Quick goods receiving
- Easy picking for orders
- Prevent theft and damage

**Pain Points:**
- ❌ Paper-based records get lost
- ❌ Counting errors during receiving
- ❌ Cannot find items quickly
- ❌ Stock discrepancies during audit
- ❌ Difficult to train new staff

**Critical Requirements:**
- Barcode scanning for quick operations
- Simple, visual interface (Hindi language support)
- Stock adjustment with approval workflow
- Location-wise stock visibility

**Technology Comfort:** Low-Medium
- Uses smartphone for calls only
- Needs simple, intuitive interface
- Prefers local language

---

## Use Cases by Persona

### Rajesh (Store Owner) Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC1.1 | View low stock alerts on mobile | Critical |
| UC1.2 | Check stock across all locations | Critical |
| UC1.3 | Generate GST invoice for customer | Critical |
| UC1.4 | Receive WhatsApp alert for reorder | High |
| UC1.5 | View sales and stock reports | High |
| UC1.6 | Approve stock transfers between locations | Medium |
| UC1.7 | Import data from Tally | High |
| UC1.8 | Manage supplier payments | Medium |

### Priya (Pharmacy Distributor) Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC2.1 | Track batches with expiry dates | Critical |
| UC2.2 | Get expiry alerts before stock expires | Critical |
| UC2.3 | Process orders with FEFO logic | Critical |
| UC2.4 | Generate batch-wise reports for compliance | Critical |
| UC2.5 | Quick stock lookup by batch number | High |
| UC2.6 | Handle customer returns by batch | High |
| UC2.7 | Track supplier performance | Medium |

### Amit (Field Sales) Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC3.1 | Check real-time stock on mobile | Critical |
| UC3.2 | Create order on mobile app | Critical |
| UC3.3 | View customer order history | High |
| UC3.4 | Work offline in low network areas | High |
| UC3.5 | Receive push notifications for urgent items | Medium |
| UC3.6 | Scan barcode to check product details | Medium |

### Sunita (Warehouse Manager) Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC4.1 | Receive goods with barcode scanning | Critical |
| UC4.2 | Perform stock take with mobile | Critical |
| UC4.3 | Pick items for orders | Critical |
| UC4.4 | Adjust stock with reason codes | High |
| UC4.5 | Print labels for new items | High |
| UC4.6 | View items by location/bin | Medium |
| UC4.7 | Use interface in Hindi | High |

---

## Feature Roadmap by Audience Priority

### Phase 1: Foundation (Months 1-2)
**Target: Rajesh & Sunita**

| Feature | Persona | Impact | Effort |
|---------|---------|--------|--------|
| Low stock WhatsApp alerts | Rajesh | Critical | Low |
| Mobile-responsive dashboard | Rajesh, Amit | Critical | Medium |
| Barcode scanning (receiving) | Sunita | Critical | Medium |
| Stock adjustment workflow | Sunita | High | Medium |
| Hindi language support | Sunita | High | Medium |
| Simple stock reports | Rajesh | High | Low |

### Phase 2: Growth (Months 3-4)
**Target: Priya & Amit**

| Feature | Persona | Impact | Effort |
|---------|---------|--------|--------|
| Batch/lot tracking | Priya | Critical | High |
| Expiry date management | Priya | Critical | High |
| Expiry alerts | Priya | Critical | Medium |
| Mobile app (PWA enhancement) | Amit | Critical | Medium |
| Offline mode | Amit | High | High |
| Customer order history | Amit | High | Low |
| FEFO picking logic | Priya | High | Medium |

### Phase 3: Scale (Months 5-6)
**Target: All Personas**

| Feature | Persona | Impact | Effort |
|---------|---------|--------|--------|
| Stock take/inventory count | Sunita, Rajesh | High | High |
| Label printing | Sunita | High | Medium |
| REST API for integrations | All | High | High |
| Enhanced supplier management | Rajesh, Priya | Medium | Medium |
| Purchase order automation | Rajesh | Medium | Medium |
| Advanced analytics | Rajesh | Medium | Medium |

### Phase 4: Enterprise (Months 7+)
**Target: Growing Businesses**

| Feature | Persona | Impact | Effort |
|---------|---------|--------|--------|
| Serial number tracking | Rajesh (Electronics) | High | High |
| Multi-currency support | Export businesses | Medium | Medium |
| BOM/Kit management | Assembly businesses | Medium | High |
| Webhook integrations | Tech-savvy users | Medium | Medium |
| Advanced reporting | All | Medium | Medium |

---

## User Journey Maps

### Journey 1: Rajesh's Daily Routine

```
9:00 AM ────► Opens DKS StockAlert on phone
     │           Views overnight alerts
     │           3 items low stock - needs action
     ▼
9:30 AM ────► Reaches store
     │           Staff reports new stock arrival
     │           Opens app → Receiving
     │           Scans supplier challan
     │           Verifies quantities
     ▼
11:00 AM ──── Customer walks in
     │           Asks for Samsung charger
     │           Rajesh checks stock in app
     │           Shows 5 units in main store
     │           Creates invoice, prints
     ▼
2:00 PM ────► Supplier calls for payment
     │           Rajesh checks pending bills
     │           Approves payment in app
     ▼
6:00 PM ────► Reviews daily sales
     │           Checks stock movement report
     │           Places reorder for low items
     ▼
9:00 PM ────► WhatsApp alert received
                 New order from regular customer
                 Will process tomorrow
```

### Journey 2: Priya's Batch Management

```
Monday ──────► Weekly expiry review
     │           Opens expiry report
     │           15 batches expiring in 3 months
     │           Creates promotion list
     ▼
Wednesday ───► New stock arrives
     │           Receives goods with batch entry
     │           Scans each batch
     │           Enters manufacturing & expiry dates
     ▼
Thursday ────► Customer order received
     │           System suggests FEFO picking
     │           Batch B123 expires earliest
     │           Picks from that batch
     ▼
Friday ──────► Drug inspector visit
     │           Generates batch-wise stock report
     │           Shows traceability
     │           Inspector satisfied
```

---

## Success Metrics by Persona

### Rajesh (Store Owner)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Stockout reduction | 50% decrease | Track missed sales |
| Time saved on inventory | 2 hrs/day | User feedback |
| Invoice generation time | < 2 minutes | System logs |
| WhatsApp alert response | 90% actioned | Click-through rate |

### Priya (Pharmacy Distributor)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Expired stock losses | 80% reduction | Financial tracking |
| Batch traceability | 100% batches tracked | System audit |
| Order processing time | 30% faster | Time tracking |
| Compliance audit pass | 100% | Audit results |

### Amit (Field Sales)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Order accuracy | 95%+ | Return rate |
| Mobile app usage | Daily active | Analytics |
| Offline order sync | < 5 min delay | Sync logs |
| Customer satisfaction | 4.5/5 rating | Feedback |

### Sunita (Warehouse Manager)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Stock accuracy | 98%+ | Stock take variance |
| Receiving time | 50% faster | Time per GRN |
| Training time | < 2 days | New staff onboarding |
| Language preference | 90% Hindi usage | App settings |

---

## Competitive Positioning

### vs. Tally ERP
| Aspect | Tally | DKS StockAlert |
|--------|-------|----------------|
| Learning curve | Steep | Simple |
| Mobile access | Limited | Full |
| Real-time alerts | No | WhatsApp |
| Multi-location | Complex | Easy |
| Price | ₹18,000+ | Freemium |

### vs. Zoho Inventory
| Aspect | Zoho | DKS StockAlert |
|--------|------|----------------|
| India-specific | Global | India-first |
| GST features | Good | Excellent |
| WhatsApp alerts | Add-on | Built-in |
| Tally integration | No | Yes |
| Local support | Limited | Priority |

### vs. Manual/Excel
| Aspect | Excel | DKS StockAlert |
|--------|-------|----------------|
| Real-time | No | Yes |
| Multi-user | Difficult | Easy |
| Mobile | No | Yes |
| Alerts | No | Yes |
| GST invoices | Manual | Automated |

---

## Pricing Strategy for Target Audience

### Free Tier (Get Started)
- 1 user, 1 location
- 100 products
- 50 invoices/month
- Basic reports
- **Goal:** Get users hooked

### Growth Tier (₹999/month)
- 5 users, 3 locations
- 5000 products
- Unlimited invoices
- WhatsApp alerts (500/month)
- Batch tracking
- **Target:** Rajesh, Sunita

### Business Tier (₹2,499/month)
- 15 users, 10 locations
- Unlimited products
- WhatsApp alerts (2000/month)
- Serial number tracking
- REST API access
- Priority support
- **Target:** Priya, growing businesses

### Enterprise (Custom)
- Unlimited users/locations
- Dedicated support
- Custom integrations
- On-premise option
- **Target:** Large distributors

---

## Go-to-Market Recommendations

### Channel Strategy
1. **Direct Sales:** Target electronics and pharmacy associations
2. **Partnerships:** Tally consultants as resellers
3. **Content:** YouTube tutorials in Hindi
4. **Referrals:** Incentivize existing users

### Onboarding Flow
1. Simple signup (phone number)
2. Import from Tally/Excel
3. Guided product tour
4. First invoice in 5 minutes
5. WhatsApp alert setup

### Support Strategy
1. Hindi phone support (business hours)
2. WhatsApp support bot
3. Video tutorials
4. Knowledge base in Hindi + English

---

## Next Steps

1. **Validate Personas:** Interview 10-15 potential users from each segment
2. **Prioritize Features:** Focus on Phase 1 for Rajesh & Sunita
3. **Design UI:** Create wireframes for critical use cases
4. **Build MVP:** Implement low stock alerts + mobile dashboard
5. **Beta Test:** Onboard 5-10 users for feedback

---

## Appendix: Feature-Persona Matrix

| Feature | Rajesh | Priya | Amit | Sunita |
|---------|--------|-------|------|--------|
| Low stock alerts | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| Batch tracking | ⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| Expiry management | ⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| Mobile app | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Barcode scanning | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Hindi interface | ⭐ | ⭐ | ⭐ | ⭐⭐⭐ |
| GST invoicing | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Stock reports | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ |
| Offline mode | ⭐ | ⭐ | ⭐⭐⭐ | ⭐ |
| Label printing | ⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ |

⭐ = Nice to have | ⭐⭐ = Important | ⭐⭐⭐ = Critical
