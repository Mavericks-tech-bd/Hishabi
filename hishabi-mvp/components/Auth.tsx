"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

type AuthView =
  | "login"
  | "signup"
  | "signup_otp"
  | "forgot_email"
  | "forgot_otp_password";

const RESEND_COOLDOWN_SECONDS = 60;

export default function Auth({ onLogin }: { onLogin: (userId: string) => void }) {
  const supabase = useMemo(() => createClient(), []);

  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resetMessages = () => {
    setError("");
    setInfo("");
  };

  const switchView = (next: AuthView) => {
    resetMessages();
    setOtp("");
    if (next === "login") {
      setPassword("");
      setConfirmPassword("");
    }
    setView(next);
  };

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    if (data.user) {
      onLogin(data.user.id);
    }
  };

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (signupError) {
      setError(signupError.message);
      return;
    }
    setInfo("We sent a 6-digit code to your email. Enter it below to verify.");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    switchView("signup_otp");
    setInfo("We sent a 6-digit code to your email. Enter it below to verify.");
  };

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid or expired code.");
      return;
    }
    if (data.user) {
      onLogin(data.user.id);
    }
  };

  const handleResendSignupOtp = async () => {
    if (resendCooldown > 0) return;
    resetMessages();
    setLoading(true);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setLoading(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setInfo("A new code has been sent to your email.");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setInfo("If an account exists for this email, a reset code has been sent.");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    switchView("forgot_otp_password");
    setInfo("Check your email for a 6-digit code, then set a new password below.");
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    if (password.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });
    if (verifyError) {
      setLoading(false);
      setError(verifyError.message || "Invalid or expired code.");
      return;
    }
    const { data: updated, error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (updated.user) {
      onLogin(updated.user.id);
    }
  };

  const handleResendResetOtp = async () => {
    if (resendCooldown > 0) return;
    resetMessages();
    setLoading(true);
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setInfo("A new code has been sent to your email.");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const messageBox = () => {
    if (error) {
      return (
        <div className="mb-5 text-sm font-semibold bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg">
          {error}
        </div>
      );
    }
    if (info) {
      return (
        <div className="mb-5 text-sm font-semibold bg-blue-50 text-[rgba(37,99,235,1)] border border-[rgba(37,99,235,0.3)] p-3 rounded-lg">
          {info}
        </div>
      );
    }
    return null;
  };

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-bold mb-2 text-black">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-black rounded-lg p-3 font-semibold text-black bg-white focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
          autoComplete="email"
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
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => switchView("forgot_email")}
          className="text-sm font-bold text-[rgba(37,99,235,1)] hover:underline"
        >
          Forgot password?
        </button>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[rgba(37,99,235,1)] text-white rounded-lg p-3 font-bold hover:bg-[rgba(29,78,216,1)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Loading..." : "Login"}
        </button>
        <button
          type="button"
          onClick={() => switchView("signup")}
          disabled={loading}
          className="w-full bg-black text-white rounded-lg p-3 font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Sign Up
        </button>
      </div>
    </form>
  );

  const renderSignup = () => (
    <form onSubmit={handleSignupRequest} className="space-y-5">
      <div>
        <label className="block text-sm font-bold mb-2 text-black">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-black rounded-lg p-3 font-semibold text-black bg-white focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
          autoComplete="email"
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
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="text-xs text-gray-500 mt-1">At least 8 characters.</p>
      </div>
      <div>
        <label className="block text-sm font-bold mb-2 text-black">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border-2 border-black rounded-lg p-3 font-semibold text-black bg-white focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => switchView("login")}
          disabled={loading}
          className="w-full bg-white border-2 border-black text-black rounded-lg p-3 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[rgba(37,99,235,1)] text-white rounded-lg p-3 font-bold hover:bg-[rgba(29,78,216,1)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </form>
  );

  const renderOtpInput = () => (
    <div>
      <label className="block text-sm font-bold mb-2 text-black">6-Digit OTP</label>
      <input
        type="text"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="w-full border-2 border-black rounded-lg p-3 font-bold text-black bg-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
        placeholder="000000"
        autoComplete="one-time-code"
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        Paste the code from your email. Random codes will not work.
      </p>
    </div>
  );

  const renderSignupOtp = () => (
    <form onSubmit={handleVerifySignupOtp} className="space-y-5">
      <div className="text-sm font-semibold text-gray-700">
        Code sent to <span className="text-black">{email}</span>
      </div>
      {renderOtpInput()}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => switchView("signup")}
          disabled={loading}
          className="w-full bg-white border-2 border-black text-black rounded-lg p-3 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[rgba(37,99,235,1)] text-white rounded-lg p-3 font-bold hover:bg-[rgba(29,78,216,1)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
      <button
        type="button"
        onClick={handleResendSignupOtp}
        disabled={loading || resendCooldown > 0}
        className="w-full text-sm font-bold text-[rgba(37,99,235,1)] hover:underline disabled:text-gray-400 disabled:no-underline"
      >
        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
      </button>
    </form>
  );

  const renderForgotEmail = () => (
    <form onSubmit={handleForgotPasswordRequest} className="space-y-5">
      <div className="text-sm text-gray-700">
        Enter the email tied to your account. We will send a 6-digit code to reset your password.
      </div>
      <div>
        <label className="block text-sm font-bold mb-2 text-black">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-black rounded-lg p-3 font-semibold text-black bg-white focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => switchView("login")}
          disabled={loading}
          className="w-full bg-white border-2 border-black text-black rounded-lg p-3 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[rgba(37,99,235,1)] text-white rounded-lg p-3 font-bold hover:bg-[rgba(29,78,216,1)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
      </div>
    </form>
  );

  const renderForgotOtpPassword = () => (
    <form onSubmit={handleVerifyResetOtp} className="space-y-5">
      <div className="text-sm font-semibold text-gray-700">
        Reset code sent to <span className="text-black">{email}</span>
      </div>
      {renderOtpInput()}
      <div>
        <label className="block text-sm font-bold mb-2 text-black">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-black rounded-lg p-3 font-semibold text-black bg-white focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="text-xs text-gray-500 mt-1">At least 8 characters.</p>
      </div>
      <div>
        <label className="block text-sm font-bold mb-2 text-black">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border-2 border-black rounded-lg p-3 font-semibold text-black bg-white focus:outline-none focus:border-[rgba(37,99,235,1)] focus:ring-2 focus:ring-[rgba(37,99,235,0.3)]"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => switchView("forgot_email")}
          disabled={loading}
          className="w-full bg-white border-2 border-black text-black rounded-lg p-3 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[rgba(37,99,235,1)] text-white rounded-lg p-3 font-bold hover:bg-[rgba(29,78,216,1)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
      <button
        type="button"
        onClick={handleResendResetOtp}
        disabled={loading || resendCooldown > 0}
        className="w-full text-sm font-bold text-[rgba(37,99,235,1)] hover:underline disabled:text-gray-400 disabled:no-underline"
      >
        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
      </button>
    </form>
  );

  const titles: Record<AuthView, string> = {
    login: "Hishabi Admin Login",
    signup: "Create Admin Account",
    signup_otp: "Verify Your Email",
    forgot_email: "Reset Your Password",
    forgot_otp_password: "Enter Code & New Password",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white border-2 border-black rounded-xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-6 sm:mb-8 text-black tracking-tight">
          {titles[view]}
        </h2>
        {messageBox()}
        {view === "login" && renderLogin()}
        {view === "signup" && renderSignup()}
        {view === "signup_otp" && renderSignupOtp()}
        {view === "forgot_email" && renderForgotEmail()}
        {view === "forgot_otp_password" && renderForgotOtpPassword()}
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
