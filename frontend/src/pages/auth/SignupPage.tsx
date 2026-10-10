import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { TALUKAS } from '../../data/locations';
import { User, Mail, Phone, Lock, MapPin, ArrowRight } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { register } = useAuth();
  const { currentLocation } = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [street, setStreet] = useState('');
  const [village, setVillage] = useState(currentLocation.name);
  const [taluka, setTaluka] = useState(currentLocation.taluka);
  const [pincode, setPincode] = useState('403001');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all required personal information.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        address: {
          id: `addr-${Date.now()}`,
          name: 'Home',
          street: street.trim() || 'Goa Residence',
          villageOrTown: village || currentLocation.name,
          taluka: taluka || currentLocation.taluka,
          pincode: pincode.trim() || '403001',
          isDefault: true,
        },
      });

      navigate(returnUrl);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-sand-300 shadow-lg p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white font-display font-black text-xl shadow-md">
              R
            </div>
            <span className="font-display font-extrabold text-2xl text-charcoal-900">ROOTIFY</span>
          </Link>
          <h2 className="font-display font-extrabold text-xl text-charcoal-900">Create Customer Account</h2>
          <p className="text-xs text-charcoal-500">
            Join the Goan food community for authentic direct orders
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Fernandes"
                className="w-full pl-10 pr-4 py-2 text-sm border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              />
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@example.com"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                />
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98221 00000"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                />
                <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                />
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Confirm Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                />
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Delivery Location in Goa */}
          <div className="pt-2 border-t border-sand-200 space-y-3">
            <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block">
              Default Goa Delivery Address
            </span>

            <div>
              <label className="text-xs font-semibold text-charcoal-700 block mb-1">House / Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. House No. 12, Altinho Road"
                className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-charcoal-700 block mb-1">Village/Town</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-charcoal-700 block mb-1">Taluka</label>
                <select
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                >
                  {TALUKAS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-charcoal-700 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-sand-200 text-xs text-charcoal-600">
          <span>Already have an account? </span>
          <Link
            to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="font-bold text-brand-700 hover:underline"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
