# myTree 🌳

A mobile-first web application that allows users to visualize, record, and track the plants and trees they've personally contributed to around the world.

## Features

- 🗺️ Interactive world map showing all your planted trees
- 📸 Photo upload with automatic compression
- 📍 GPS location capture
- 🔐 Google OAuth authentication
- 🌍 Share individual trees publicly
- 📱 Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Firebase Storage
- **Maps**: MapLibre GL JS
- **Authentication**: Supabase Auth (Google OAuth)
- **Deployment**: Vercel

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run this SQL to create the trees table:
   ```sql
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

   -- Enable RLS
   alter table trees enable row level security;

   -- Policy: Users can only see their own trees
   create policy "Users can view own trees" on trees for select using (auth.uid() = user_id);
   create policy "Users can insert own trees" on trees for insert with check (auth.uid() = user_id);
   ```

3. **Set up Firebase**:
   - Create a Firebase project
   - Enable Storage
   - Configure storage rules for authenticated uploads

4. **Configure environment variables**:
   Update `.env.local` with your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Usage

1. Sign in with Google
2. Click "Add Tree" to plant your first tree
3. Take a photo, add location, and fill in details
4. View all your trees on the interactive map
5. Click any tree marker to see details
6. Share individual trees with the share button

## Deployment

Deploy to Vercel:
```bash
npm run build
```

The app is optimized for mobile-first usage and works great as a PWA.