"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import useCurrentUser from "@/lib/useCurrentUser";
import axios from "axios";
import { toast } from "react-hot-toast";
import JSON5 from "json5";

export default function SkillQuestionsPage() {
  const user = useCurrentUser();
  const [skills, setSkills] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [bulkJSON, setBulkJSON] = useState("");
  const [appendMode, setAppendMode] = useState(false);

  const [newSkillTitle, setNewSkillTitle] = useState('');
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);

  useEffect(()=>{
    if (user?.isAdmin) {
      axios.get('/api/skills').then(r=>setSkills(r.data.skills||[])).catch(()=>{});
    }
  }, [user]);

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
        // Auto-select the newly created skill and clear editor
        setSelected(s._id);
        setQuestions([]);
      }
    } catch (e:any) { toast.error('Failed to create'); }
    finally { setCreatingSkill(false); }
  }

  const loadQuestions = async (skillId:string) => {
    try {
      const res = await axios.get(`/api/admin/skills/questions?skillId=${skillId}`);
      setQuestions(res.data.questions || []);
    } catch (e:any) { toast.error('Failed to load'); }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Delete this skill and all its questions? This action cannot be undone.')) return;
    try {
      const res = await axios.delete('/api/admin/skills', { data: { skillId } });
      if (res.data.success) {
        toast.success('Skill deleted');
        setSkills(skills.filter(s => s._id !== skillId));
        if (selected === skillId) { setSelected(''); setQuestions([]); }
      } else toast.error(res.data.error || 'Delete failed');
    } catch (e:any) { toast.error('Delete failed'); }
  };

  const handleSave = async () => {
    if (!selected) return toast.error('Select a skill');
    setSavingQuestions(true);
    try {
      const res = await axios.post('/api/admin/skills/questions', { skillId: selected, mcqQuestions: questions, append: appendMode });
      if (res.data.success) toast.success('Saved');
      await loadQuestions(selected);
      // update question count in skills list
      setSkills(prev => prev.map(sk => sk._id === selected ? { ...sk, questionCount: res.data.count || (sk.questionCount || 0) } : sk));
    } catch (e:any){ toast.error('Failed to save'); }
    finally { setSavingQuestions(false); }
  };

  const handleImport = async () => {
    if (!selected) return toast.error('Select a skill');
    try {
      let parsed:any;
      try { parsed = JSON.parse(bulkJSON); } catch { parsed = JSON5.parse(bulkJSON); }
      if (!Array.isArray(parsed)) return toast.error('JSON must be array');
      setQuestions(parsed as any[]);
      toast.success('Imported into editor');
    } catch (e:any) { toast.error('Invalid JSON'); }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Skill Questions</h1>
        <p className="text-gray-400 mb-6">Create skills and add MCQs via JSON or editor.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-1 p-4 bg-[#0b0b10] border border-white/10 rounded-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm text-gray-300">Skills</h3>
              <a href="/admin/admin-panel/skill-questions/create" className="text-sm px-3 py-1 bg-[#7E102C] text-white rounded">New Skill</a>
            </div>
            <div>
              <div className="space-y-2 max-h-72 overflow-auto">
                {skills.map(s => (
                  <div key={s._id} className={`p-2 rounded flex items-center justify-between ${selected===s._id? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20' : 'hover:bg-white/5'}`}>
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-gray-400">{s.questionCount || 0} questions</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelected(s._id); loadQuestions(s._id); }} className="px-2 py-1 bg-white/5 rounded">Edit</button>
                      <button onClick={() => handleDeleteSkill(s._id)} className="px-2 py-1 bg-red-600 rounded text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 p-4 bg-[#0b0b10] border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <button disabled={!selected || creatingSkill} onClick={()=>{ if (!selected) return toast.error('Select a skill first'); setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]) }} className={`px-4 py-2 ${(!selected||creatingSkill)? 'bg-white/10 text-gray-400' : 'bg-[#7E102C] text-white'} rounded`}>
                {creatingSkill ? 'Creating...' : 'Add Question'}
              </button>
              <div className="ml-2">
                <select value={selected} onChange={(e)=>{ const id = e.target.value; setSelected(id); if (id) loadQuestions(id); }} className="px-3 py-2 bg-[#07070a] border border-white/10 rounded-md text-white">
                  <option value="">Select skill...</option>
                  {skills.map(s => (<option key={s._id} value={s._id}>{s.title} ({s.questionCount||0})</option>))}
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={appendMode} onChange={(e)=>setAppendMode(e.target.checked)} className="accent-[#D4AF37]" />
                <span>Append</span>
              </label>
              <button disabled={savingQuestions || !selected} onClick={handleSave} className={`ml-auto px-4 py-2 rounded ${savingQuestions || !selected ? 'bg-white/10 text-gray-400' : 'bg-green-600 text-white'}`}>
                {savingQuestions ? 'Saving...' : 'Save Questions'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <textarea value={bulkJSON} onChange={(e)=>setBulkJSON(e.target.value)} placeholder='Paste JSON array of questions here' className="col-span-1 md:col-span-1 p-3 bg-[#07070a] border border-white/10 rounded-xl min-h-[160px] text-white" />
              <div className="flex flex-col gap-2">
                <button disabled={!selected} onClick={handleImport} className={`px-4 py-3 rounded-xl ${!selected ? 'bg-white/10 text-gray-400' : 'bg-yellow-600 text-white'}`}>{!selected ? 'Select skill to import' : 'Import JSON'}</button>
                <div className="text-sm text-gray-400">Each question: {'{ question, options[4], correctAnswer (0-3) }'}</div>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-[#111118] border border-white/5 rounded-xl">
                  <div className="mb-2"><strong>Q{idx+1}:</strong></div>
                  <input value={q.question} onChange={(e)=>{ const arr=[...questions]; arr[idx].question = e.target.value; setQuestions(arr); }} className="w-full p-2 bg-[#0b0b10] border border-white/10 rounded-md mb-2 text-white" placeholder="Question text" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    {q.options.map((opt:any, oi:number)=>(<input key={oi} value={opt} onChange={(e)=>{ const arr=[...questions]; arr[idx].options[oi]=e.target.value; setQuestions(arr); }} className="p-2 bg-[#0b0b10] border border-white/10 rounded-md text-white" placeholder={`Option ${oi+1}`} />))}
                  </div>
                  <div className="mb-2">
                    <label className="text-sm text-gray-300">Explanation (optional)</label>
                    <textarea value={q.explanation || ''} onChange={(e)=>{ const arr=[...questions]; arr[idx].explanation = e.target.value; setQuestions(arr); }} className="w-full p-2 bg-[#0b0b10] border border-white/10 rounded-md mt-1 text-white" placeholder="Optional explanation to show after submission" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-400">Correct Answer</label>
                    <select value={q.correctAnswer} onChange={(e)=>{ const arr=[...questions]; arr[idx].correctAnswer = parseInt(e.target.value); setQuestions(arr); }} className="px-3 py-2 bg-[#111118] border border-white/10 rounded-md text-white">
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                    <div className="ml-auto">
                      <button onClick={()=>{ setQuestions(questions.filter((_,i)=>i!==idx)); }} className="px-3 py-2 bg-red-600 text-white rounded-md">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        
      </div>
    </AdminLayout>
  );
}
