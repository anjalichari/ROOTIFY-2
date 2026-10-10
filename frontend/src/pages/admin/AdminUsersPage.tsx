import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { adminService } from '../../services/adminService';
import { User, UserRole } from '../../types';
import {
  Users,
  Shield,
  Store,
  Bike,
  User as UserIcon,
  Search,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      const all = await adminService.getAllUsers();
      setUsers(all);
    };
    load();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'customer':
        return 'bg-sand-100 text-charcoal-800 border-sand-300';
      case 'vendor':
        return 'bg-brand-50 text-brand-800 border-brand-200';
      case 'delivery':
        return 'bg-terracotta-50 text-terracotta-800 border-terracotta-200';
      case 'admin':
        return 'bg-brand-800 text-white border-brand-900';
      default:
        return 'bg-sand-100 text-charcoal-800 border-sand-200';
    }
  };

  return (
    <PortalLayout
      portalType="admin"
      title="User Management & Roles"
      subtitle="Directory of customers, verified producers, delivery partners, and admins"
    >
      <div className="space-y-6">
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-sand-300">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 bg-white"
            />
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['all', 'customer', 'vendor', 'delivery', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition cursor-pointer ${
                  roleFilter === r
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'bg-sand-100 text-charcoal-700 hover:bg-sand-200'
                }`}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50/80 border-b border-sand-200 text-charcoal-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Primary Location</th>
                  <th className="py-3.5 px-4">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-sand-50/50">
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-9 h-9 rounded-xl object-cover border border-sand-300"
                      />
                      <div>
                        <span className="font-bold text-charcoal-900 block">{u.name}</span>
                        <span className="text-charcoal-400 text-[11px]">{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-700 font-medium">
                      {u.phone}
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-600">
                      {u.defaultAddress ? (
                        <span>{u.defaultAddress.villageOrTown}, {u.defaultAddress.taluka}</span>
                      ) : (
                        <span className="text-charcoal-400">Panaji Central</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
};
