# StockAlert

Modern inventory management and restock alert system for small to medium businesses.

## Features

- **Product Management**: Add, edit, and delete products with SKU, barcode, category, unit cost, selling price, and supplier information
- **Multi-Location**: Manage inventory across multiple warehouses, stores, or locations
- **Supplier Management**: Track suppliers with contact details and product associations
- **Purchase Orders**: Create and track purchase orders with receipt tracking
- **Stock Transfers**: Move inventory between locations with full history
- **Smart Alerts**: Automatic notifications for low stock and out-of-stock items
- **Stock History**: Complete audit trail of all inventory changes
- **Team Collaboration**: Role-based access control (owner, admin, editor, viewer)
- **PWA Support**: Install as a mobile app on iOS & Android
- **POS Billing**: Point-of-sale billing system

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel / Docker

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account

### Environment Setup

1. Copy environment template:
```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t stockalert .
docker run -p 3000:3000 stockalert
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── products/     # Product management
│   │   ├── locations/    # Location management
│   │   ├── suppliers/    # Supplier management
│   │   ├── alerts/       # Alert management
│   │   └── ...
│   ├── dashboard/        # Dashboard page
│   ├── products/         # Product pages
│   ├── locations/        # Location pages
│   └── ...
├── components/           # Reusable components
├── lib/
│   ├── auth.ts          # Authentication helpers
│   ├── supabase.ts      # Supabase client
│   ├── validators.ts    # Zod validation schemas
│   ├── logger.ts        # Logging utilities
│   └── permissions.ts   # Role-based permissions
└── types/               # TypeScript definitions
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `CSRF_SECRET` | Yes | Secret for CSRF protection |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use GitHub Issues.