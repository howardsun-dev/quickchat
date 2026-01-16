import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import { LockIcon, LoaderIcon, CheckCircleIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>(); // Extract token from URL
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const {
    resetPassword,
    isResettingPassword,
    resetPasswordError,
    resetPasswordSuccess,
    logout,
  } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      navigate('/forgot-password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }

    resetPassword({
      token,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });
  };

  // Redirect on success

  useEffect(() => {
    if (resetPasswordSuccess) {
      const timer = setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [resetPasswordSuccess, logout, navigate]);

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
                  <LockIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-slate-400">Enter your new password</p>
                </div>

                {/* SUCCESS MESSAGE */}
                {resetPasswordSuccess && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>
                        Password reset successfully! Redirecting to login...
                      </span>
                    </div>
                  </div>
                )}

                {/* ERROR MESSAGE */}
                {resetPasswordError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-400">{resetPasswordError}</span>
                  </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* NEW PASSWORD INPUT */}
                  <div>
                    <label className="auth-input-label">New Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          })
                        }
                        className="input"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD INPUT */}
                  <div>
                    <label className="auth-input-label">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="input"
                        placeholder="Confirm new password"
                        required
                      />
                      {formData.newPassword &&
                        formData.confirmPassword &&
                        formData.newPassword !== formData.confirmPassword && (
                          <p className="text-sm text-red-400 mt-1">
                            Passwords do not match
                          </p>
                        )}
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    className="auth-btn"
                    type="submit"
                    disabled={
                      isResettingPassword ||
                      formData.newPassword !== formData.confirmPassword ||
                      !token
                    }
                  >
                    {isResettingPassword ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="auth-link"
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
                  src="/reset-password.png" // Use reset password themed image
                  alt="Password reset illustration"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Secure password recovery
                  </h3>
                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Safe</span>
                    <span className="auth-badge">Secure</span>
                    <span className="auth-badge">Fast</span>
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

export default ResetPasswordPage;
