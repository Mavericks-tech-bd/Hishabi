"use client";

import HishabiDashboard from "@/components/HishabiDashboard";
import Auth from "@/components/Auth";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading your session...</div>
      </div>
    );
  }

  if (!userId) {
    return <Auth onLogin={setUserId} />;
  }

  return (
    <div>
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center text-sm">
        <span className="text-gray-700 font-medium truncate">
          {userEmail ?? "Signed in"}
        </span>
        <button
          onClick={handleSignOut}
          className="text-red-500 hover:underline font-medium"
        >
          Sign Out
        </button>
      </div>
      <HishabiDashboard />
    </div>
  );
}
