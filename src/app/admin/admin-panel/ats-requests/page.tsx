"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Check, Mail } from "lucide-react";

export default function AtsRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/ats/requests');
      if (res.data.success) setRequests(res.data.requests || []);
    } catch (e:any) { toast.error('Failed to fetch requests'); }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const approve = async (userId: string) => {
    try {
      const res = await axios.post('/api/admin/ats/requests/approve', { userId });
      if (res.data.success) {
        toast.success('Approved');
        fetchRequests();
      } else toast.error(res.data.error || 'Failed');
    } catch (e:any) { toast.error(e?.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">ATS Retry Requests</h1>
        {loading && <div>Loading…</div>}
        {!loading && requests.length === 0 && <div className="text-gray-400">No pending requests</div>}
        <div className="space-y-4 mt-4">
          {requests.map((r:any) => (
            <div key={r._id} className="bg-[#0b0b11] p-4 rounded border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.fullName || r.email}</div>
                <div className="text-sm text-gray-400">{r.email}</div>
                <div className="text-xs text-gray-500">Used: {r.atsChecker?.used || 0}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(r._id)} className="px-3 py-2 bg-emerald-600 rounded flex items-center gap-2"><Check className="w-4 h-4"/> Allow</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
