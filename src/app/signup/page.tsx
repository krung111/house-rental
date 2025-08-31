"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        role: "admin",
      });

      setSuccessMsg("✅ Account created! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/20 rounded-2xl shadow-2xl p-8 border border-white/30">
        <h1 className="text-3xl font-bold text-center text-white mb-6 drop-shadow-md">
          Admin Sign Up
        </h1>

        {errorMsg && (
          <p className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm">
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="bg-green-500/20 text-green-200 p-3 rounded mb-4 text-sm">
            {successMsg}
          </p>
        )}

        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Full Name
            </label>
            <div className="flex items-center border border-white/30 bg-white/10 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-pink-400">
              <User size={20} className="text-white/70 mr-2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-transparent outline-none text-white placeholder-white/50"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <div className="flex items-center border border-white/30 bg-white/10 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-pink-400">
              <Mail size={20} className="text-white/70 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent outline-none text-white placeholder-white/50"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <div className="flex items-center border border-white/30 bg-white/10 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-pink-400">
              <Lock size={20} className="text-white/70 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent outline-none text-white placeholder-white/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white font-semibold py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {/* Link to Login */}
          <p className="text-center text-sm text-white/80 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-pink-300 hover:underline cursor-pointer"
            >
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
