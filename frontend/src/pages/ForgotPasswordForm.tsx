import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import {
  MessageCircleIcon,
  MailIcon,
  LoaderIcon,
  CheckCircleIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

function ForgotPasswordPage() {
  const [formData, setFormData] = useState({ email: '' });
  const {
    forgotPassword,
    isSendingResetEmail,
    resetEmailError,
    resetEmailSuccess,
    logout,
  } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    forgotPassword(formData);
  };

  // Redirect on success
  useEffect(() => {
    if (resetEmailSuccess) {
      const timer = setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [resetEmailSuccess, logout, navigate]);

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900 min-h-screen">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Forgot Password?
                  </h2>
                  <p className="text-slate-400">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                {/* SUCCESS MESSAGE */}
                {resetEmailSuccess && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>
                        Reset link sent! Check your email for instructions.
                      </span>
                    </div>
                  </div>
                )}

                {/* ERROR MESSAGE */}
                {resetEmailError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-400">{resetEmailError}</span>
                  </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* EMAIL INPUT */}
                  <div>
                    <label className="auth-input-label">Email Address</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="input"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    className="auth-btn w-full"
                    type="submit"
                    disabled={isSendingResetEmail || !formData.email}
                  >
                    {isSendingResetEmail ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="auth-link"
                    disabled={isSendingResetEmail}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </div>

            {/* ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/reset-password.png"
                  alt="Password recovery illustration"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Quick & secure recovery
                  </h3>
                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Email</span>
                    <span className="auth-badge">Secure</span>
                    <span className="auth-badge">1-click</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
