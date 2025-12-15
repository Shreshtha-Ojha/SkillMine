"use client";

import React, { useEffect, useState } from "react";
import JSON5 from "json5";
import AdminLayout from "../AdminLayout";
import useCurrentUser from "@/lib/useCurrentUser";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Roadmap { _id: string; title: string }
interface MCQ { _id?: string; question: string; options: string[]; correctAnswer: number }

export default function RoadmapQuestionsPage() {
  const user = useCurrentUser();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkJSON, setBulkJSON] = useState("");
  const [appendMode, setAppendMode] = useState<boolean>(false);

  useEffect(() => {
    if (user === undefined) return;
    if (!user || !user.isAdmin) return;
    axios.get('/api/roadmap/fetchall').then(res => setRoadmaps(res.data.roadmaps || []));
  }, [user]);

  const loadQuestions = async (roadmapId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/roadmap-test/admin/questions?roadmapId=${roadmapId}`);
      setQuestions(res.data.questions || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load questions');
    }
    setLoading(false);
  };

  const handleAddRow = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  // Permanent DB delete removed; use Remove then Save to update question bank.

  const handleSave = async () => {
    if (!selected) return toast.error('Select a roadmap');
    try {
      const res = await axios.post('/api/roadmap-test/admin/questions', { roadmapId: selected, mcqQuestions: questions, append: appendMode });
      if (res.data && res.data.success) {
        const msg = res.data.message || 'Questions saved';
        toast.success(msg);
      } else {
        toast.success('Questions saved');
      }
      // Refresh from server to show deduped/updated list
      await loadQuestions(selected);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleImport = async () => {
    if (!selected) return toast.error('Select a roadmap');
    try {
      let parsed: any;
      let usedJson5 = false;
      try {
        parsed = JSON.parse(bulkJSON);
      } catch (e) {
        try {
          parsed = JSON5.parse(bulkJSON);
          usedJson5 = true;
        } catch (e2) {
          return toast.error('Invalid JSON. Try correcting trailing commas or use valid JSON/JSON5.');
        }
      }

      if (!Array.isArray(parsed)) return toast.error('JSON must be an array of questions');

      // Validate items and dedupe incoming by question text
      const seen = new Set<string>();
      const incoming: MCQ[] = [];
      const invalids: string[] = [];
      let trimmedCount = 0;
      parsed.forEach((raw: any, i: number) => {
        const q: any = { ...raw };
        // Basic validation
        if (!q.question || !Array.isArray(q.options)) {
          invalids.push(`index ${i}: missing question/options`);
          return;
        }

        // Normalize options: if more than 4, trim and count; if less than 4, invalid
        if (q.options.length > 4) {
          q.options = q.options.slice(0, 4);
          trimmedCount += 1;
        }
        if (q.options.length < 4) {
          invalids.push(`index ${i}: options length ${q.options.length} < 4`);
          return;
        }

        // Normalize correctAnswer
        const ca = Number(q.correctAnswer);
        if (!Number.isInteger(ca) || ca < 0 || ca > 3) {
          invalids.push(`index ${i}: invalid correctAnswer ${q.correctAnswer}`);
          return;
        }
        q.correctAnswer = ca;

        const key = q.question.trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          incoming.push(q as MCQ);
        }
      });

      if (incoming.length === 0 && invalids.length > 0) {
        return toast.error(`No valid questions found. Errors: ${invalids.slice(0,3).join('; ')}${invalids.length>3?` (+${invalids.length-3} more)`:''}`);
      }

      if (appendMode) {
        // Filter out items that already exist in current questions
        const existingSet = new Set((questions || []).map(q => q.question.trim().toLowerCase()));
        const toAdd = incoming.filter(q => !existingSet.has(q.question.trim().toLowerCase()));
        const duplicates = incoming.length - toAdd.length;
        setQuestions([...questions, ...toAdd]);
        toast.success(`Imported ${toAdd.length} new questions. ${duplicates} duplicates skipped.${trimmedCount?` ${trimmedCount} trimmed to 4 options.`:''}${usedJson5? ' (parsed with JSON5)':''}`);
      } else {
        setQuestions(incoming);
        toast.success(`Imported ${incoming.length} unique questions into editor.${trimmedCount?` ${trimmedCount} trimmed to 4 options.`:''}${usedJson5? ' (parsed with JSON5)':''}`);
      }
    } catch (err: any) {
      toast.error('Invalid JSON');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Manage Test Questions</h1>
        <p className="text-gray-400 mb-6">Select a roadmap and add MCQs (stored as JSON). Tests will pick 60 random MCQs during runtime.</p>

        <div className="flex gap-3 mb-6">
          <select value={selected} onChange={(e) => { setSelected(e.target.value); if (e.target.value) loadQuestions(e.target.value); }} className="px-4 py-3 bg-[#111118] border border-white/10 rounded-xl text-white">
            <option value="">Select Roadmap</option>
            {roadmaps.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
          </select>
          <button onClick={handleAddRow} className="px-4 py-3 bg-blue-600 text-white rounded-xl">Add Question</button>
          <div className="text-sm text-gray-400 px-3">Total questions: <span className="font-semibold text-white">{questions.length}</span></div>
          {questions.length < 60 && selected && (
            <div className="text-sm text-[#E1D4C1] px-3">Warning: Less than 60 questions configured. Users cannot take test until 60+ MCQs exist.</div>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-gray-300 px-4">
            <input type="checkbox" checked={appendMode} onChange={(e) => setAppendMode(e.target.checked)} className="accent-blue-500" />
            <span>Append (keep existing)</span>
          </label>
          <button onClick={handleSave} className="px-4 py-3 bg-green-600 text-white rounded-xl">Save Questions</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <textarea value={bulkJSON} onChange={(e) => setBulkJSON(e.target.value)} placeholder='Paste JSON array of questions here to bulk import' className="col-span-1 md:col-span-1 p-3 bg-[#0b0b10] border border-white/10 rounded-xl min-h-[160px] text-white" />
          <div className="flex flex-col gap-2">
            <button onClick={handleImport} className="px-4 py-3 bg-[#7E102C] text-[#E1D4C1] rounded-xl border border-[#0a0a0f]">Import JSON</button>
            <div className="text-sm text-gray-400">Each question: {"{ question: string, options: [4 strings], correctAnswer: 0-3 }"}</div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="p-4 bg-[#111118] border border-white/5 rounded-xl">
              <div className="mb-2"><strong>Q{idx + 1}:</strong></div>
              <input value={q.question} onChange={(e) => { const arr = [...questions]; arr[idx].question = e.target.value; setQuestions(arr); }} className="w-full p-2 bg-[#0b0b10] border border-white/10 rounded-md mb-2 text-white" placeholder="Question text" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                {q.options.map((opt, oi) => (
                  <input key={oi} value={opt} onChange={(e) => { const arr = [...questions]; arr[idx].options[oi] = e.target.value; setQuestions(arr); }} className="p-2 bg-[#0b0b10] border border-white/10 rounded-md text-white" placeholder={`Option ${oi + 1}`} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-gray-400">Correct Answer</label>
                <select value={q.correctAnswer} onChange={(e) => { const arr = [...questions]; arr[idx].correctAnswer = parseInt(e.target.value); setQuestions(arr); }} className="px-3 py-2 bg-[#111118] border border-white/10 rounded-md text-white">
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => { const arr = questions.filter((_, i) => i !== idx); setQuestions(arr); }} className="px-3 py-2 bg-red-600 text-white rounded-md">Remove</button>
                  {/** Show DB delete if present */}
                  {/* DB delete removed; use Remove then Save to update bank */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
