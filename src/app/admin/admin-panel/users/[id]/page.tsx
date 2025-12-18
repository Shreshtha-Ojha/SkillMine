"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../AdminLayout';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AdminUserDetail({ params }: any) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/users/${id}`);
        if (res.data && res.data.user) setUser(res.data.user);
        else setError('User not found');
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleRevokePremium = async () => {
    if (!confirm('Revoke Premium for this user?')) return;
    try {
      setProcessing(true);
      // Simple admin action: remove purchases.premium
      const res = await axios.post(`/api/admin/users/${id}/revoke-premium`, {}, { withCredentials: true });
      if (res.data && res.data.success) {
        setUser((u:any) => ({ ...u, purchases: { ...(u.purchases || {}), premium: { purchased: false } } }));
        alert('Premium revoked');
      } else {
        alert('Failed to revoke premium');
      }
    } catch (err:any){
      console.error(err);
      alert(err.response?.data?.error || err.message || 'Failed to revoke');
    } finally { setProcessing(false); }
  };

  return (
    <AdminLayout>
      <div className="bg-[#0a0a0f] text-white">
        <button onClick={() => router.back()} className="mb-4 px-3 py-2 bg-white/5 rounded">Back</button>

        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="bg-[#0b0b10] p-6 rounded-lg border border-white/5">
            <h2 className="text-xl font-semibold mb-4">{user.username} {user.isAdmin ? <span className="ml-2 text-xs bg-[#7E102C] px-2 rounded">Admin</span> : null}</h2>

            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="w-full md:w-1/3 flex items-center justify-center">
                {user.profilePhoto?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePhoto.url} alt={user.fullName || user.username} className="w-36 h-36 rounded-lg object-cover border border-white/10" />
                ) : (
                  <div className="w-36 h-36 rounded-lg bg-gradient-to-br from-[#7E102C] to-[#D7A9A8] flex items-center justify-center text-3xl font-bold">{(user.username||'?')[0]?.toUpperCase()}</div>
                )}
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Full Name</div>
                    <div className="font-medium">{user.fullName || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Contact Number</div>
                    <div className="font-medium">{user.contactNumber || '—'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">College</div>
                    <div className="font-medium">{user.college || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Age</div>
                    <div className="font-medium">{user.age || '—'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Gender</div>
                    <div className="font-medium">{user.gender || '—'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Verified</div>
                    <div className="font-medium">{user.isVerified ? 'Yes' : 'No'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Premium</div>
                    <div className="font-medium">{user.purchases?.premium?.purchased ? `Yes • ${user.purchases?.premium?.purchasedAt ? new Date(user.purchases.premium.purchasedAt).toLocaleString() : ''}` : 'No'}</div>
                  </div>
                </div>

                {/* Coding profiles & other details */}
                <div className="mt-4">
                  <div className="text-sm text-gray-400 mb-2">Connected Profiles</div>
                  <div className="flex gap-2 flex-wrap text-sm">
                    {user.codingProfiles?.github?.username && <div className="px-2 py-1 bg-white/5 rounded">GitHub: {user.codingProfiles.github.username}</div>}
                    {user.codingProfiles?.leetcode?.username && <div className="px-2 py-1 bg-white/5 rounded">LeetCode: {user.codingProfiles.leetcode.username}</div>}
                    {user.codingProfiles?.codeforces?.username && <div className="px-2 py-1 bg-white/5 rounded">CF: {user.codingProfiles.codeforces.username}</div>}
                    {user.codingProfiles?.codechef?.username && <div className="px-2 py-1 bg-white/5 rounded">CodeChef: {user.codingProfiles.codechef.username}</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              {user.purchases?.premium?.purchased ? (
                <button onClick={handleRevokePremium} disabled={processing} className="px-4 py-2 bg-red-600 rounded">{processing ? 'Processing...' : 'Revoke Premium'}</button>
              ) : (
                <button onClick={() => router.push('/admin/admin-panel/premium-users')} className="px-4 py-2 bg-green-600 rounded">Back to list</button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}