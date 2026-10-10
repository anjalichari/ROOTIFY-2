import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Lock, Mail, ArrowRight, Shield, Store, Bike, User, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate(returnUrl);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole, targetEmail: string, destination: string) => {
    setIsLoading(true);
    try {
      await switchRole(role);
      navigate(destination);
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-sand-300 shadow-lg p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white font-display font-black text-xl shadow-md">
              R
            </div>
            <span className="font-display font-extrabold text-2xl text-charcoal-900">ROOTIFY</span>
          </Link>
          <h2 className="font-display font-extrabold text-xl text-charcoal-900">Sign in to your account</h2>
          <p className="text-xs text-charcoal-500">
            Access your orders, saved addresses, or business dashboard
          </p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
          <span className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-700" /> 1-Click Demo Logins:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer', 'customer@demo.rootify', returnUrl === '/' ? '/orders' : returnUrl)}
              className="px-2.5 py-2 rounded-xl bg-white border border-sand-300 hover:border-brand-400 hover:bg-brand-50 text-left text-xs font-semibold text-charcoal-800 transition flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-brand-700" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('vendor', 'vendor@demo.rootify', '/vendor/orders')}
              className="px-2.5 py-2 rounded-xl bg-white border border-sand-300 hover:border-brand-400 hover:bg-brand-50 text-left text-xs font-semibold text-charcoal-800 transition flex items-center gap-2"
            >
              <Store className="w-3.5 h-3.5 text-brand-700" />
              <span>Vendor / SHG</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('delivery', 'delivery@demo.rootify', '/delivery/tasks')}
              className="px-2.5 py-2 rounded-xl bg-white border border-sand-300 hover:border-blue-400 hover:bg-blue-50 text-left text-xs font-semibold text-charcoal-800 transition flex items-center gap-2"
            >
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              <span>Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin', 'admin@demo.rootify', '/admin/dashboard')}
              className="px-2.5 py-2 rounded-xl bg-white border border-sand-300 hover:border-purple-400 hover:bg-purple-50 text-left text-xs font-semibold text-charcoal-800 transition flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
            {error}
          </div>
        )}

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-sand-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition"
              />
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-charcoal-700">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-brand-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-sand-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link to Signup */}
        <div className="text-center pt-2 border-t border-sand-200 text-xs text-charcoal-600">
          <span>Don't have an account? </span>
          <Link
            to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="font-bold text-brand-700 hover:underline"
          >
            Create Customer Account
          </Link>
        </div>

      </div>

      {/* Forgot Password Simulated Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-sand-300">
            <h3 className="font-display font-bold text-lg text-charcoal-900">Reset Password (Simulation)</h3>
            {forgotSubmitted ? (
              <div className="space-y-3">
                <p className="text-xs text-brand-900 bg-brand-50 p-3 rounded-xl border border-brand-200">
                  Password reset link sent to <strong>{forgotEmail}</strong> (Demo simulation).
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                  }}
                  className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-charcoal-500">
                  Enter your email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-charcoal-500 hover:bg-sand-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setForgotSubmitted(true)}
                    className="px-4 py-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
