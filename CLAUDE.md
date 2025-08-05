# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VSL Ads Agency is a SaaS marketing automation platform for agencies that automates the entire advertising creative process - from market research to Meta Ads performance analysis. The platform enables agencies to generate VSL angles, create video scripts, and analyze campaign performance through AI-powered workflows.

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript, App Router
- **UI**: Shadcn/UI components with Tailwind CSS
- **Database & Auth**: Supabase with Row Level Security (RLS)
- **AI Workflows**: n8n webhooks for automation
- **Styling**: Tailwind CSS with custom design system

## Development Commands

```bash
# Development
npm run dev           # Start dev server with Turbopack
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Database
# Execute database.sql in Supabase SQL editor to create schema
```

## Architecture Overview

### Authentication Flow
- Supabase Auth with SSR support using `@supabase/ssr`
- Middleware-based route protection (`src/middleware.ts`)
- Separate client/server Supabase instances for different contexts
- Agency-focused authentication (agency name instead of personal details)

### Database Schema
The application follows a hierarchical data model:
```
Users → Projects → Products → Angles → Scripts
                             ↓
                          Campaigns (Meta Ads performance)
```

Key tables:
- `users`: Agency accounts
- `projects`: Client projects per agency
- `products`: Products to promote within projects
- `product_details`: AI-generated product research (via Perplexity)
- `angles`: Marketing angles generated for products
- `scripts`: VSL scripts generated from selected angles
- `campaigns`: Meta Ads performance data and transcriptions

### Core Workflow
1. **Project Creation**: Agencies create projects for clients
2. **Product Management**: Add products with contextual notes
3. **AI Generation Pipeline**:
   - Generate product details via n8n → Perplexity API
   - Generate 5 marketing angles with emotional triggers, cognitive biases
   - Select angles and generate VSL scripts with duration options
   - Feedback iteration system for script improvement
4. **Performance Integration**: Meta Ads data collection and analysis
5. **Content Optimization**: Transcription of winning ads for future improvements

### n8n Webhook Integration

**Webhook URL**: `https://n8n.srv858309.hstgr.cloud/webhook-test/ads`

Supported actions via POST requests:
- `generateProjectDetails`: Product research via Perplexity
- `generateAngles`: Create 5 marketing angles with psychology triggers
- `generateScript`: Generate VSL scripts from selected angles
- `feedbackIteration`: Regenerate scripts based on feedback
- `scrape_best_ad`: Automated scraping of winning ads
- `fetch_campaign_data`: Daily Meta Ads metrics updates

### Component Architecture

**Layouts & Navigation**:
- `DashboardLayout`: Main authenticated layout with sidebar navigation
- Authentication pages with premium Apple-like design (rounded corners, gradients)

**Core Features**:
- `ProjectsOverview`: Project management dashboard
- `ProductsManagement`: Product lifecycle with status tracking
- `AnglesManagement`: Angle selection with filtering (all/selected/unselected)
- `ScriptGeneration`: VSL script creation with feedback loops
- `AngleDetailDialog`: Detailed view of marketing angles with psychology elements

**Status Flow**:
Products: `inactive` → `details_generating` → `details_generated` → `angles_generating` → `angles_generated`

### Environment Configuration

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.srv858309.hstgr.cloud/webhook-test/ads
```

### Row Level Security (RLS)

All database tables implement RLS policies ensuring agencies only access their own data:
- Projects filtered by `user_id`
- Products filtered through project ownership
- Nested data (angles, scripts, campaigns) filtered through product/project ownership chain

### UI Design System

- **Color Schemes**: Blue/Indigo gradients for login, Purple/Violet for signup
- **Rounded Corners**: Apple-like design with `rounded-3xl` cards, `rounded-2xl` inputs
- **Premium Elements**: Backdrop blur, gradient backgrounds, custom SVG icons
- **Agency-Focused Copy**: "Espace professionnel", "Rejoignez l'élite", agency-centric language

### Performance Optimization

- Next.js App Router with server components for initial rendering
- Client components only where interactivity is needed
- Supabase real-time subscriptions for status updates
- Optimistic UI updates during AI generation processes

## Development Notes

- Database schema is in `database.sql` - execute in Supabase SQL editor
- All UI components use Shadcn/UI with custom styling via `tailwind.config.js`
- Authentication redirects handle both authenticated and unauthenticated states
- n8n webhooks should return appropriate status updates for frontend polling
- RLS policies must be maintained when adding new tables or features