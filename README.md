# VSL Ads Agency

SaaS marketing automation platform for agencies that automates the entire advertising creative process - from market research to Meta Ads performance analysis.

## Features

- **Agency-focused authentication** with premium UI design
- **Project & product management** with hierarchical structure
- **AI-powered marketing angles generation** via n8n workflows
- **VSL script creation** with feedback iteration system
- **Meta Ads performance integration** (planned)
- **Supabase backend** with Row Level Security

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI**: Shadcn/UI components with Tailwind CSS
- **Database**: Supabase with RLS
- **AI Workflows**: n8n webhooks
- **Authentication**: Supabase Auth with SSR

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```
Add your Supabase credentials and n8n webhook URL.

3. Set up the database:
Execute `database.sql` in your Supabase SQL editor.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Architecture

The platform follows a hierarchical data model:
```
Users → Projects → Products → Angles → Scripts
```

For detailed architecture information, see [CLAUDE.md](./CLAUDE.md).

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run linting
```
