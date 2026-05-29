import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, LayoutDashboard, Users, FileText, Briefcase, LogOut,
  TrendingUp, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp,
  Target, Zap, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resumeAPI, jobsAPI, interviewAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ScoreBadge({ score }) {
  if (score == null) return <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-500 border border-gray-200">Pending</span>;
  const color = score >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
    score >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
    'bg-red-50 text-red-700 border-red-200';
  return <span className={`px-2 py-0.5 text-xs rounded-md border font-semibold ${color}`}>{score.toFixed(0)}</span>;
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', cls: 'bg-gray-100 text-gray-600 border border-gray-200', icon: Clock },
    processing: { label: 'Analyzing…', cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Zap },
    completed: { label: 'Completed', cls: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle },
    failed: { label: 'Failed', cls: 'bg-red-50 text-red-700 border border-red-200', icon: AlertCircle },
    terminated: { label: '🚫 Terminated', cls: 'bg-red-50 text-red-700 border border-red-200', icon: AlertCircle },
  };
  const { label, cls, icon: Icon } = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md font-medium ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function CandidateRow({ resume, interview, isExpanded, onToggle }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200 bg-white"
      >
        <td className="px-6 py-4">
          <div className="font-medium text-gray-900 text-sm">{resume.candidate_name || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{resume.email}</div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {resume.job_posting_id ? `Job #${resume.job_posting_id}` : 'General'}
        </td>
        <td className="px-6 py-4"><ScoreBadge score={resume.ats_score} /></td>
        <td className="px-6 py-4"><ScoreBadge score={resume.match_score} /></td>
        <td className="px-6 py-4"><StatusBadge status={resume.status} /></td>
        <td className="px-6 py-4 text-right">
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />}
        </td>
      </tr>
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={6} className="bg-gray-50 border-b border-gray-200">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {resume.experience_summary && (
                  <div className="md:col-span-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <span className="text-xs uppercase font-bold text-gray-500 block mb-1">Experience Summary</span>
                    {resume.experience_summary}
                  </div>
                )}
                {resume.parsed_skills?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <span className="text-xs uppercase font-bold text-gray-500 block mb-2">Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.parsed_skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs bg-brand-50 text-brand-700 border border-brand-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {resume.strengths?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <span className="text-xs uppercase font-bold text-green-600 block mb-2">Strengths</span>
                    <ul className="space-y-1">
                      {resume.strengths.map(s => <li key={s} className="text-xs text-gray-700 flex gap-1.5 items-start"><CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{s}</li>)}
                    </ul>
                  </div>
                )}
                {resume.weaknesses?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <span className="text-xs uppercase font-bold text-red-600 block mb-2">Areas to Improve</span>
                    <ul className="space-y-1">
                      {resume.weaknesses.map(s => <li key={s} className="text-xs text-gray-700 flex gap-1.5 items-start"><AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />{s}</li>)}
                    </ul>
                  </div>
                )}
                {resume.recommendation && (
                  <div className="md:col-span-3 flex items-center gap-2 text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <Award className="w-5 h-5 text-brand-600" />
                    Resume AI Recommendation: <span className="text-brand-600">{resume.recommendation}</span>
                  </div>
                )}

                {/* Interview Scores */}
                {interview && interview.status === 'completed' && (
                  <div className="md:col-span-3 bg-brand-50 border border-brand-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs uppercase font-bold text-brand-700">🎥 Video Interview Results</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 border border-green-200">{interview.overall_recommendation}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {[['Communication', interview.communication_score], ['Technical', interview.technical_score], ['Cultural Fit', interview.cultural_fit_score], ['Overall', interview.overall_score]].map(([label, score]) => (
                        <div key={label} className="text-center bg-white border border-brand-100 rounded-lg py-2 shadow-sm">
                          <div className={`text-2xl font-extrabold ${Number(score) >= 8 ? 'text-green-600' : Number(score) >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>{score?.toFixed(1)}<span className="text-xs text-gray-400">/10</span></div>
                          <div className="text-xs text-gray-500 font-medium">{label}</div>
                        </div>
                      ))}
                    </div>
                    {interview.feedback && <p className="text-sm text-gray-700 leading-relaxed italic border-l-2 border-brand-300 pl-3">"{interview.feedback}"</p>}
                  </div>
                )}
                {interview && interview.status === 'analyzing' && (
                  <div className="md:col-span-3 text-sm text-brand-600 font-medium flex items-center gap-2 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /> Interview analysis in progress…
                  </div>
                )}
                {interview && interview.status === 'terminated' && (
                  <div className="md:col-span-3 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm uppercase font-bold text-red-700">🚫 Interview Terminated — Cheating Detected</span>
                    </div>
                    <p className="text-sm text-red-900 bg-white border border-red-100 rounded p-2 inline-block shadow-sm">
                      <span className="font-bold">Reason:</span> {interview.termination_reason || 'Policy violation detected'}
                    </p>
                    <p className="text-xs text-red-600 mt-2 font-medium">This interview was automatically terminated and flagged for HR review.</p>
                  </div>
                )}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default function HRDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]); // all interview sessions
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Build a lookup map: resume_id -> interview
  const interviewMap = Object.fromEntries(interviews.map(iv => [iv.resume_id, iv]));

  useEffect(() => {
    Promise.all([resumeAPI.getAll(), jobsAPI.getAll(), interviewAPI.getAll()])
      .then(([r, j, iv]) => { setResumes(r.data); setJobs(j.data); setInterviews(iv.data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Auto-refresh to catch newly processed resumes + interviews
    const interval = setInterval(() => {
      resumeAPI.getAll().then(r => setResumes(r.data)).catch(() => {});
      interviewAPI.getAll().then(iv => setInterviews(iv.data)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const completed = resumes.filter(r => r.status === 'completed');
  const avgATS = completed.length ? (completed.reduce((s, r) => s + (r.ats_score || 0), 0) / completed.length).toFixed(1) : 0;
  const avgMatch = completed.filter(r => r.match_score).length
    ? (completed.filter(r => r.match_score).reduce((s, r) => s + r.match_score, 0) / completed.filter(r => r.match_score).length).toFixed(1) : 0;

  const chartData = jobs.map(j => ({
    name: j.title.split(' ').slice(0, 2).join(' '),
    applications: resumes.filter(r => r.job_posting_id === j.id).length,
  })).filter(d => d.applications > 0);

  const NAV = [
    { key: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { key: 'candidates', icon: Users, label: 'Candidates' },
    { key: 'jobs', icon: Briefcase, label: 'Job Postings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex selection:bg-brand-500/20 selection:text-brand-700">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-30 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900">
            Aaba<span className="text-brand-600">soft</span>
            <sup className="text-[10px] text-brand-600 font-normal ml-0.5">®</sup>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {NAV.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === key ? 'text-brand-600' : 'text-gray-400'}`} /> {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-sm shadow-sm">
              {user?.full_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs font-medium text-brand-600">HR Admin</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:text-white hover:bg-gray-800 border border-gray-200 hover:border-gray-800 rounded-lg transition-all text-sm font-semibold shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-xl px-8 h-16 flex items-center justify-between shadow-sm">
          <h1 className="font-bold text-xl capitalize text-gray-900">{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'candidates' ? 'Candidate Pipeline' : 'Job Postings'}</h1>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
            </span>
            <div className="text-xs font-semibold text-gray-500">Auto-refreshing</div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin" /></div>
          ) : (
            <AnimatePresence mode="wait">

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Applications', value: resumes.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Analysis Complete', value: completed.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                      { label: 'Avg. ATS Score', value: avgATS, icon: Target, color: 'text-brand-600', bg: 'bg-brand-50' },
                      { label: 'Avg. Job Match', value: `${avgMatch}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${bg} opacity-50 pointer-events-none`}></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">{label}</span>
                          <div className={`w-8 h-8 rounded bg-white shadow-sm border border-gray-100 flex items-center justify-center ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className={`text-4xl font-black ${color} relative z-10`}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  {chartData.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-6 text-lg">Applications per Job</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData} barSize={40}>
                          <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                          <YAxis tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                          <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#111827', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{ fill: 'rgba(220, 38, 38, 0.05)' }} />
                          <Bar dataKey="applications" radius={[6, 6, 0, 0]}>
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={`#dc2626`} fillOpacity={1 - (i * 0.15)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Recent candidates */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 text-lg">Recent Applications</h3>
                      <button onClick={() => setActiveTab('candidates')} className="text-sm font-semibold text-brand-600 hover:text-brand-800 hover:underline">View all Pipeline →</button>
                    </div>
                    <table className="w-full">
                      <thead><tr className="border-b border-gray-200 bg-gray-50">
                        {['Candidate', 'Role', 'ATS Score', 'Match Score', 'Status', ''].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {resumes.slice(0, 5).map(r => (
                          <CandidateRow key={r.id} resume={r} interview={interviewMap[r.id]} isExpanded={expanded === r.id} onToggle={() => setExpanded(expanded === r.id ? null : r.id)} />
                        ))}
                      </tbody>
                    </table>
                    {resumes.length === 0 && (
                      <div className="text-center py-16 text-gray-500 bg-white">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="font-medium">No applications yet.</p>
                        <p className="text-sm mt-1">Share your job postings to start receiving candidates.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* CANDIDATES */}
              {activeTab === 'candidates' && (
                <motion.div key="candidates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 text-lg">All Candidates ({resumes.length})</h3>
                      <p className="text-sm text-gray-500 mt-1">Click a row to expand full AI analysis and video interview results.</p>
                    </div>
                    <table className="w-full">
                      <thead><tr className="border-b border-gray-200 bg-gray-50">
                        {['Candidate', 'Applied For', 'ATS Score', 'Match Score', 'Status', ''].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {resumes.map(r => (
                          <CandidateRow key={r.id} resume={r} interview={interviewMap[r.id]} isExpanded={expanded === r.id} onToggle={() => setExpanded(expanded === r.id ? null : r.id)} />
                        ))}
                      </tbody>
                    </table>
                    {resumes.length === 0 && (
                      <div className="text-center py-20 text-gray-500 bg-white">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium text-lg">Your pipeline is empty.</p>
                        <p className="mt-1">Share your job postings to start receiving applications.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* JOBS */}
              {activeTab === 'jobs' && (
                <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6">
                  {jobs.map((job, i) => {
                    const appCount = resumes.filter(r => r.job_posting_id === job.id).length;
                    return (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-xl mb-1">{job.title}</h3>
                            <p className="text-sm font-semibold text-brand-600 mb-4">{job.location} <span className="text-gray-300 mx-1">|</span> {job.salary_range}</p>
                            <p className="text-base text-gray-600 line-clamp-2 mb-6 max-w-3xl leading-relaxed">{job.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {job.requirements?.map(r => (
                                <span key={r} className="px-3 py-1 rounded bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium">{r}</span>
                              ))}
                            </div>
                          </div>
                          <div className="ml-8 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center flex-shrink-0 min-w-[120px]">
                            <div className="text-4xl font-black text-brand-600">{appCount}</div>
                            <div className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">applications</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
