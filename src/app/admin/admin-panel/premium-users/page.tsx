"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface PremiumUser {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  premiumPurchasedAt?: string | null;
  createdAt?: string;
  isAdmin?: boolean;
}

export default function PremiumUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<PremiumUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/premium-users', { withCredentials: true });
        if (res.data && res.data.users) {
          setUsers(res.data.users);
        } else {
          setError('Unexpected response from server');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch premium users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="bg-[#0a0a0f] text-white">
        <h1 className="text-2xl font-bold mb-4">Premium Users</h1>
        <p className="text-sm text-gray-300 mb-6">List of users who purchased Premium access.</p>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="overflow-x-auto bg-[#0b0b10] border border-white/5 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Purchased At</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.fullName || '—'}</td>
                    <td className="px-4 py-3">{u.premiumPurchasedAt ? new Date(u.premiumPurchasedAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/admin-panel/users/${u.id}`} className="text-[#D4AF37] hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}