# LeafyBuddy 🌳

A modern, mobile-first web application that empowers eco-warriors to visualize, record, and track their environmental impact by documenting trees and plants they've planted around the world.

## ✨ Features

### 🏠 Public Landing Page
- Beautiful hero section with global tree statistics
- Feature showcase and call-to-action
- Mobile-optimized design
- SEO-friendly with Open Graph support

### 🌳 Tree Management
- **Add Trees**: Auto-location detection, photo upload with compression
- **Interactive Map**: Multiple map styles (satellite, street, terrain)
- **Tree Details**: Rich information display with environmental impact
- **Share Trees**: Public tree pages with social sharing

### 👤 User Experience
- **Profile Dashboard**: Personal stats, achievements, recent activity
- **Google OAuth**: Seamless authentication
- **PWA Support**: Install as mobile app, offline functionality
- **Responsive Design**: Perfect on all devices

### 📊 Analytics & Gamification
- Personal tree counter and location tracking
- Achievement system (First Tree, Tree Enthusiast, etc.)
- Environmental impact calculations
- Activity timeline

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Firebase Storage
- **Maps**: MapLibre GL JS with multiple tile sources
- **Authentication**: Supabase Auth (Google OAuth)
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd leafyBuddyApp
npm install
```

### 2. Database Setup (Supabase)

1. Create a new [Supabase](https://supabase.com) project
2. Run this SQL in the Supabase SQL editor:

```sql
-- Create trees table
create table trees (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  species text,
  latitude decimal not null,
  longitude decimal not null,
  image_url text not null,
  description text,
  planted_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table trees enable row level security;

-- Policies
create policy "Users can view own trees" on trees 
  for select using (auth.uid() = user_id);

create policy "Users can insert own trees" on trees 
  for insert with check (auth.uid() = user_id);

create policy "Users can update own trees" on trees 
  for update using (auth.uid() = user_id);

create policy "Users can delete own trees" on trees 
  for delete using (auth.uid() = user_id);

-- Enable Google OAuth in Authentication > Providers
```

### 3. Storage Setup (Firebase)

1. Create a [Firebase](https://firebase.google.com) project
2. Enable Storage in the Firebase console
3. Update Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trees/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Environment Configuration

Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage Guide

### For New Users
1. **Visit the Landing Page**: See global tree statistics and features
2. **Sign In**: Use Google OAuth for instant access
3. **Add Your First Tree**: Auto-location detection makes it easy
4. **Explore**: View your trees on the interactive map

### Key Features
- **Dashboard**: Track your impact with personal statistics
- **Map View**: Multiple map styles and interactive markers
- **Tree Sharing**: Generate public links for individual trees
- **Profile**: View achievements and recent activity
- **PWA**: Install as a mobile app for offline access

### Mobile Experience
- Optimized for touch interactions
- Auto-location detection
- Camera integration for photos
- Offline functionality via service worker
- Install prompt for native app experience

## 🌍 Environmental Impact

Each tree entry includes estimated environmental benefits:
- **CO₂ Absorption**: ~20kg per year
- **Oxygen Production**: ~260L per day
- **Location Tracking**: Global impact visualization

## 🏗 Architecture

```
src/
├── app/                 # Next.js 14 App Router
│   ├── page.tsx        # Main application with multi-view
│   ├── layout.tsx      # Root layout with PWA setup
│   ├── globals.css     # Enhanced styling
│   └── tree/[id]/      # Public tree pages
├── components/         # Reusable components
│   ├── AddTreeForm.tsx # Enhanced tree creation
│   ├── Map.tsx         # Interactive map with controls
│   ├── Profile.tsx     # User profile and stats
│   └── ShareTree.tsx   # Social sharing component
├── lib/                # Utilities
│   ├── supabase.ts     # Database client
│   └── firebase.ts     # Storage client
└── types/              # TypeScript definitions
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- Supabase URL and keys
- Firebase configuration
- Domain configuration for OAuth redirects

### PWA Considerations
- Service worker caches static assets
- Manifest.json enables app installation
- Offline functionality for core features

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint checking
```

### Key Dependencies
- **Next.js 14**: App Router, Server Components
- **Supabase**: Authentication, Database, Real-time
- **Firebase**: File storage and compression
- **MapLibre GL**: Interactive maps
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Made with 💚 for a greener planet**