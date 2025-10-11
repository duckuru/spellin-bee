import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { EyeIcon, EyeOffIcon, LoaderIcon, LockIcon, MailIcon, UserIcon } from 'lucide-react'
import { Link } from 'react-router';
import toast from 'react-hot-toast';

function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const {signup, isSigningUp} = useAuthStore()
  const [showPassword, setShowPassword] = useState(false); // toggle visibility

  const handleSubmit = (e: React.FormEvent) =>{
    e.preventDefault();
    if(formData.password !== formData.confirmPassword){
      toast.error("Password do not match");
      return;
    }
    signup(formData);
  }

  return (
    <div className="w-full h-screen flex justify-center items-center p-4 text-[#3f3f3f] z-50 bg-black/50">
      <div className="relative w-full max-w-md h-auto py-6 bg-[#f3f3f3] flex items-center justify-center rounded-2xl border-4 border-[#795a3e] shadow-lg">
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <h2 className="text-4xl quicksand-semi mb-2">Register</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-12">
            {/* Username input */}
            <div className="px-10">
              <label className="auth-input-label">Username</label>
              <div className="relative">
                <UserIcon className="auth-input-icon" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="input"
                  placeholder="Guest123"
                />
              </div>
            </div>

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
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input"
                  placeholder="******"
                />
                    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-20"
      onClick={() => setShowPassword(!showPassword)}
      tabIndex={-1} // prevent focusing the button
    >
      {showPassword ? <EyeIcon className="w-5 h-5 z-20" /> : <EyeOffIcon className="w-5 h-5 z-20" />}
    </button>
              </div>
            </div>
            <div className="px-10">
              <label className="auth-input-label">Confirm Password</label>
              <div className="relative">
                <LockIcon className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
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
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <LoaderIcon className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="mb-1 quicksand-semi">Already have an account?</p>
            <Link
              to={"/login"}
              className="quicksand-semi text-[#5ea4ff] transition-colors hover:text-[#006fff]"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage