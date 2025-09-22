import { LoaderIcon, LockIcon, MailIcon } from 'lucide-react';
import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router';

function LoginPage() {
  const [formData, setFormData] = useState({email: "", password: ""});
  const {login, isLoggingIn} = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData);
  }

  return (
    <div className="w-full h-screen flex justify-center items-center p-4 text-[#3f3f3f] z-50 bg-black/50">
      <div className="relative w-full max-w-md h-auto py-6 bg-[#f3f3f3] flex items-center justify-center rounded-2xl border-4 border-[#795a3e] shadow-lg">
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <h2 className="text-4xl quicksand-semi mb-2">Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-12">
            {/* Email input */}
            <div className="px-10">
              <label className="auth-input-label">Email</label>
              <div className="relative">
                <MailIcon className="auth-input-icon" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input"
                  placeholder="Guest@gmail.com"
                />
              </div>
            </div>
            <div className="px-10">
              <label className="auth-input-label">Password</label>
              <div className="relative">
                <LockIcon className="auth-input-icon" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input"
                  placeholder="******"
                />
              </div>
            </div>
            <div className="px-10 mt-8">
              <button
                className="py-3 w-full text-xl h-16 bg-[#d3d3d3] text-[3f3f3f] font-bold hover:bg-[#c5c5c5] transition-colors rounded-lg border-2  border-[#795a3e]"
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <LoaderIcon className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="mb-1 quicksand-semi">Don't have an account?</p>
            <Link
              to={"/signup"}
              className="quicksand-semi text-[#5ea4ff] transition-colors hover:text-[#006fff]"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage