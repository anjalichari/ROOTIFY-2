import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Address } from '../../types';
import { TALUKAS } from '../../data/locations';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Plus,
  LogOut,
  Sparkles,
  ShieldCheck,
  Store,
} from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { user, logout, updateUser, role, switchRole } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Add Address Modal
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrName, setAddrName] = useState('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrVillage, setAddrVillage] = useState('Panaji');
  const [addrTaluka, setAddrTaluka] = useState('Tiswadi');
  const [addrPincode, setAddrPincode] = useState('403001');

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Not Signed In</h2>
        <p className="text-sm text-gray-500 mb-6">Please sign in to manage your customer profile.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      await updateUser({ name, phone });
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to update profile:', e);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      name: addrName,
      street: addrStreet,
      villageOrTown: addrVillage,
      taluka: addrTaluka,
      pincode: addrPincode,
      isDefault: false,
    };

    const currentAddresses = user.addresses || [];
    await updateUser({
      addresses: [...currentAddresses, newAddr],
    });

    setShowAddAddr(false);
    setAddrStreet('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sand-300">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2.5">
            <User className="w-7 h-7 text-brand-700" />
            My Customer Profile
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Manage your personal details, Goa addresses, and marketplace activity
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20"
            />
            <div>
              <h2 className="font-display font-bold text-lg text-charcoal-900">{user.name}</h2>
              <p className="text-xs text-charcoal-500">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 uppercase tracking-wider border border-brand-200">
                {role} account
              </span>
            </div>
          </div>

          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs text-charcoal-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-xs font-bold text-charcoal-800 transition"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>

        {/* Contact fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
            <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">
              Full Name
            </span>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1 text-xs border border-sand-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-brand-600"
              />
            ) : (
              <span className="text-xs font-bold text-charcoal-900">{user.name}</span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
            <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">
              Phone Number
            </span>
            {isEditing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1 text-xs border border-sand-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-brand-600"
              />
            ) : (
              <span className="text-xs font-bold text-charcoal-900">{user.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-sand-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-700" />
            <h2 className="font-display font-bold text-lg text-charcoal-900">
              Saved Goa Delivery Addresses
            </h2>
          </div>
          <button
            onClick={() => setShowAddAddr(true)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200 transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Address
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(user.addresses || (user.defaultAddress ? [user.defaultAddress] : [])).map((addr) => (
            <div key={addr.id} className="p-4 rounded-2xl border border-sand-300 bg-sand-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-charcoal-900">{addr.name}</span>
                {addr.isDefault && (
                  <span className="text-[10px] bg-sand-200 text-charcoal-700 px-2 py-0.5 rounded-full font-bold">
                    Primary
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">{addr.street}</p>
              <p className="text-xs text-charcoal-500">
                {addr.villageOrTown}, {addr.taluka} Taluka • PIN: {addr.pincode}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddAddr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-sand-300">
            <h3 className="font-display font-bold text-lg text-charcoal-900">Add New Goa Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-charcoal-700 block mb-1">Address Label</label>
                <input
                  type="text"
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  placeholder="e.g. Beach Villa / Studio / Office"
                  className="w-full px-3 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-charcoal-700 block mb-1">Street / House Details</label>
                <input
                  type="text"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="House 8, Coastal Highway"
                  className="w-full px-3 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-charcoal-700 block mb-1">Village/Town</label>
                  <input
                    type="text"
                    value={addrVillage}
                    onChange={(e) => setAddrVillage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal-700 block mb-1">Taluka</label>
                  <select
                    value={addrTaluka}
                    onChange={(e) => setAddrTaluka(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-sand-300 rounded-xl bg-white outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    {TALUKAS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAddr(false)}
                  className="px-4 py-2 text-xs text-charcoal-600 hover:bg-sand-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Become a Vendor Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-900 to-brand-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-bold text-lg flex items-center justify-center sm:justify-start gap-2">
            <Store className="w-5 h-5 text-terracotta-300" />
            Are you a local Goan food producer or SHG?
          </h3>
          <p className="text-xs text-sand-100/90 max-w-lg">
            Register your traditional kitchen or Mahila Mandal to reach thousands of customers across Goa.
          </p>
        </div>
        <Link
          to="/vendor/register"
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-sand-50 text-brand-900 font-extrabold text-xs shadow-md transition whitespace-nowrap"
        >
          Register as Vendor
        </Link>
      </div>

    </div>
  );
};
