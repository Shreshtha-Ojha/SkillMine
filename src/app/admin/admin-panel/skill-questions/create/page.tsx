"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import useCurrentUser from "@/lib/useCurrentUser";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function CreateSkillPage() {
  const user = useCurrentUser();
  const [newSkillTitle, setNewSkillTitle] = useState("");
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(()=>{ if (user?.isAdmin) { axios.get('/api/skills').then(r=>setSkills(r.data.skills||[])).catch(()=>{}); } }, [user]);

  const createSkill = async () => {
    if (!newSkillTitle) return toast.error('Title required');
    setCreatingSkill(true);
    try {
      const res = await axios.post('/api/admin/skills', { title: newSkillTitle });
      if (res.data.success) {
        toast.success('Skill created');
        const s = res.data.skill;
        setSkills(prev => [...prev, { _id: s._id, title: s.title, key: s.key, questionCount: 0 }]);
        setNewSkillTitle('');
      }
    } catch (e:any) { toast.error('Failed to create'); }
    finally { setCreatingSkill(false); }
  }

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Delete this skill and all its questions?')) return;
    try {
      const res = await axios.delete('/api/admin/skills', { data: { skillId } });
      if (res.data.success) {
        toast.success('Deleted');
        setSkills(skills.filter(s=>s._id !== skillId));
      }
    } catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create Skill</h1>
        <p className="text-gray-400 mb-6">Create a new skill. After creating, you can add questions via the Questions page.</p>

        <div className="max-w-lg p-4 bg-[#0b0b10] border border-white/10 rounded-xl">
          <input placeholder="Skill name" value={newSkillTitle} onChange={(e)=>setNewSkillTitle(e.target.value)} className="w-full px-3 py-2 bg-[#07070a] border border-white/10 rounded-md text-white mb-3" />
          <button disabled={creatingSkill} onClick={createSkill} className={`w-full px-3 py-2 rounded-md ${creatingSkill?'bg-white/10 text-gray-400':'bg-[#7E102C] text-white'}`}>{creatingSkill?'Creating...':'Create Skill'}</button>
        </div>

        <div className="mt-6 p-4 bg-[#0b0b10] border border-white/10 rounded-xl">
          <h4 className="text-sm text-gray-300 mb-2">Existing Skills</h4>
          <div className="space-y-2">
            {skills.map(s=> (
              <div key={s._id} className="flex items-center justify-between p-2 bg-[#111118] rounded">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-gray-400">{s.questionCount || 0} questions</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/admin/admin-panel/skill-questions" className="px-3 py-1 bg-white/5 rounded">Add Questions</Link>
                  <button onClick={()=>handleDeleteSkill(s._id)} className="px-3 py-1 bg-red-600 rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
