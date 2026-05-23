"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function Auth({ onLogin }: { onLogin: (userId: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else if (data.user) {
      onLogin(data.user.id);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setError("Signup successful! You can now log in.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white border-2 border-black rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-black tracking-tight">
          Hishabi Admin Login
        </h2>
        {error && (
          <div className="mb-5 text-sm font-semibold bg-[rgba(37,99,235,0.08)] text-[rgba(37,99,235,1)] border border-[rgba(37,99,235,0.3)] p-3 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black rounded-lg p-3 font-semibold text-black bg-white focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black rounded-lg p-3 font-semibold text-black bg-white focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
              required
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[rgba(37,99,235,1)] text-white rounded-lg p-3 font-bold hover:bg-[rgba(29,78,216,1)] disabled:opacity-50 transition-colors"
            >
              {loading ? "Loading..." : "Login"}
            </button>
            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-black text-white rounded-lg p-3 font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <Image
          src="/mavericks-logo.png"
          alt="Mavericks"
          width={80}
          height={80}
          className="opacity-90"
        />
        <p className="text-sm font-bold text-black tracking-wide">
          Powered by <span className="text-[rgba(37,99,235,1)]">Mavericks</span>
        </p>
      </div>
    </div>
  );
}
