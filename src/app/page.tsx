export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Hello World!</h1>
      <p>Environment check:</p>
      <ul>
        <li>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</li>
        <li>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</li>
        <li>Firebase API: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅' : '❌'}</li>
      </ul>
    </div>
  );
}
