# DKS StockAlert

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)

Open-source inventory management system for small and medium businesses with WhatsApp alerts, Tally integration, and GST invoicing.

Built for Indian SMBs but works globally.

## 🚀 Features

- 📦 **Multi-location Inventory** - Track stock across multiple warehouses/stores
- 📱 **WhatsApp Alerts** - Get instant low stock alerts (1000 free/month)
- 📊 **Tally ERP Import** - Import data directly from Tally (XML/CSV)
- 🧾 **GST Invoicing** - Generate GST-compliant invoices
- 👥 **Team Collaboration** - Multi-user with role-based access
- 🔄 **Stock Transfers** - Move stock between locations
- 📈 **Analytics Dashboard** - Track sales, inventory value, and trends
- 🏪 **POS/Billing** - Point of sale system with barcode support
- 📋 **Purchase Orders** - Manage supplier orders
- 🔔 **Smart Alerts** - Low stock, out of stock notifications
- 🌐 **Multi-language** - English support (extensible)
- 📱 **Mobile Responsive** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon, Supabase, or self-hosted)
- **Auth:** JWT-based authentication
- **Integrations:** WhatsApp Business API, Shopify, WooCommerce

## 📦 Installation

### Prerequisites

- Node.js 20.12.0 or higher
- PostgreSQL database
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dks-stockalert.git
   cd dks-stockalert
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.sample .env.local
   ```
   
   Edit `.env.local` with your database credentials:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/stockalert"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Database Setup

You can use any PostgreSQL database:

**Option 1: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create database
createdb stockalert
```

**Option 2: Neon (Free Tier)**
- Sign up at [neon.tech](https://neon.tech)
- Create a new project
- Copy the connection string

**Option 3: Supabase (Free Tier)**
- Sign up at [supabase.com](https://supabase.com)
- Create a new project
- Use the connection string from settings

## 🏗️ Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/dks-stockalert)

1. Click the button above
2. Connect your GitHub account
3. Add environment variables from `.env.sample`
4. Deploy!

### Manual Deployment

See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t dks-stockalert .
docker run -p 3000:3000 --env-file .env.local dks-stockalert
```

## 📖 Documentation

- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Security Policy](./SECURITY.md) - Security guidelines
- [Changelog](./CHANGELOG.md) - Version history
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Production deployment

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork the repo, then:
git clone https://github.com/YOUR_USERNAME/dks-stockalert.git
cd dks-stockalert
npm install
cp .env.sample .env.local
# Edit .env.local with your DB credentials
npx prisma migrate dev
npm run dev
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Indian SMBs
- Inspired by Tally ERP workflows
- WhatsApp Business API integration
- Open source community

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/dks-stockalert/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/dks-stockalert/discussions)
- **Email:** hello@dksstockalert.com

## 🔐 Security

Please report security vulnerabilities to [security@dksstockalert.com](mailto:security@dksstockalert.com).

See [SECURITY.md](./SECURITY.md) for details.

---

**Made with ❤️ for the open source community**
