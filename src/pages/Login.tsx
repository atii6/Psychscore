import { LoginForm } from "@/components/pageComponents/login/LoginForm";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Header with Icon */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full flex items-center justify-center">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2a0a3114e_logo.png" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to PsychScore Pro
              </h1>
              <p className="text-sm text-gray-600 mt-1">Sign in to continue</p>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer Links */}
          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Forgot password?
            </Link>
            <div className="text-gray-600">
              Need an account?{" "}
              <Link
                to="/Signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
