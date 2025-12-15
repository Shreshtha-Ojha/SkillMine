import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Trophy, Calendar, MessageSquare, ChevronRight, X, Target, Award, TrendingUp } from "lucide-react";

interface InterviewResult {
  _id: string;
  topic: string;
  questions: string[];
  answers: string[];
  feedback: string;
  score: number;
  createdAt: string;
}

// Cache for interview history
const historyCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const InterviewHistory: React.FC<{ userId?: string }> = ({ userId }) => {
  const [history, setHistory] = useState<InterviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState<InterviewResult | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    
    const cacheKey = `interview_history_${userId}`;
    const cached = historyCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setHistory(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/interview/history?userId=${userId}`);
      const data = res.data.results || [];
      setHistory(data);
      
      historyCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!userId) return null;

  const avgScore = history.length > 0 
    ? (history.reduce((sum, item) => sum + item.score, 0) / history.length).toFixed(1) 
    : '0';
  const highScores = history.filter(item => item.score >= 8).length;

  return (
    <div className="w-full">
      <div className="theme-card theme-card--vintage border border-[#7E102C]/14 rounded-2xl hover:border-[#7E102C]/20 transition-all duration-300 p-6">
        <h3 className="text-lg font-semibold text-[#E1D4C1] mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#7E102C]" />
          Interview History
        </h3>

        {/* Stats Row */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="theme-card theme-card--vintage border border-[#7E102C]/14 rounded-2xl hover:border-[#7E102C]/20 transition-all duration-300 p-4 text-center">
              <div className="text-2xl font-bold text-[#E1D4C1]">{history.length}</div>
              <div className="text-xs text-[#E1D4C1]/70">Total</div>
            </div>
            <div className="theme-card theme-card--vintage border border-[#7E102C]/14 rounded-2xl hover:border-[#7E102C]/20 transition-all duration-300 p-4 text-center">
              <div className="text-2xl font-bold text-[#E1D4C1]">{avgScore}</div>
              <div className="text-xs text-[#E1D4C1]/70">Avg Score</div>
            </div>
            <div className="theme-card theme-card--vintage border border-[#7E102C]/14 rounded-2xl hover:border-[#7E102C]/20 transition-all duration-300 p-4 text-center">
              <div className="text-2xl font-bold text-[#E1D4C1]">{highScores}</div>
              <div className="text-xs text-[#E1D4C1]/70">High (8+)</div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[#7E102C] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#E1D4C1]/80 text-sm">Loading history...</span>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7E102C]/10 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-[#E1D4C1]" />
            </div>
            <h4 className="text-lg font-medium text-[#E1D4C1] mb-2">No interviews yet</h4>
            <p className="text-[#E1D4C1]/70 text-sm mb-4">Start practicing to build your history!</p>
            <button
              onClick={() => window.location.href = '/interview'}
              className="px-4 py-2 bg-[#7E102C] text-[#E1D4C1] rounded-lg font-medium"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item._id}
                onClick={() => setModalItem(item)}
                className="p-4 theme-card theme-card--vintage border border-[#7E102C]/14 rounded-2xl hover:border-[#7E102C]/20 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-[#E1D4C1] truncate max-w-[200px] group-hover:text-[#D7A9A8] transition-colors">
                    {item.topic}
                  </h4>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-[#7E102C]/20 text-[#E1D4C1]`}>
                    {item.score}/10
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#E1D4C1]/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', day: 'numeric', year: 'numeric' 
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-[#E1D4C1] group-hover:text-[#D7A9A8]">
                    View <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setModalItem(null)}
        >
          <div
            className="bg-[#111118] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">{modalItem.topic}</h4>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`px-2.5 py-1 rounded-full font-medium ${
                    modalItem.score >= 8 ? 'bg-green-500/20 text-green-400' :
                    modalItem.score >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    Score: {modalItem.score}/10
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(modalItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                onClick={() => setModalItem(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)]">
              {/* Feedback */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-400" />
                  AI Feedback
                </h5>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {modalItem.feedback}
                  </p>
                </div>
              </div>

              {/* Q&A */}
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Questions & Answers ({modalItem.questions.length})
                </h5>
                <div className="space-y-3">
                  {modalItem.questions.map((q, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium flex items-center justify-center">
                            Q{i + 1}
                          </span>
                          <span className="text-xs text-blue-400">Question</span>
                        </div>
                        <p className="text-white text-sm ml-7">{q}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-5 h-5 bg-green-500/20 text-green-400 rounded text-xs font-medium flex items-center justify-center">
                            A
                          </span>
                          <span className="text-xs text-green-400">Your Answer</span>
                        </div>
                        <p className="text-gray-300 text-sm ml-7">
                          {modalItem.answers[i] || (
                            <span className="italic text-gray-500">No answer provided</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;
