import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Briefcase, MapPin, DollarSign, Upload, CheckCircle,
  Clock, AlertCircle, ChevronRight, LogOut, Star, X, FileText, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, resumeAPI, interviewAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import InterviewRoom from '../components/InterviewRoom';

// ---- Score gauge ----
function ATSGauge({ score }) {
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626';
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-gray-900">{Math.round(score)}</span>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">ATS Score</span>
      </div>
    </div>
  );
}

// ---- Processing step indicator ----
const STEPS = [
  'Uploading file',
  'Extracting text content',
  'AI analyzing skills & experience',
  'Generating ATS score',
  'Matching against job description',
  'Finalizing report',
];

function ProcessingView({ resumeId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Animate steps visually
    const stepInterval = setInterval(() => {
      setCurrentStep(s => {
        if (s >= STEPS.length - 1) { clearInterval(stepInterval); return s; }
        return s + 1;
      });
    }, 1800);

    // Poll backend for real status
    intervalRef.current = setInterval(async () => {
      try {
        const res = await resumeAPI.getById(resumeId);
        if (res.data.status === 'completed') {
          clearInterval(intervalRef.current);
          clearInterval(stepInterval);
          setCurrentStep(STEPS.length - 1);
          setTimeout(() => onComplete(res.data), 800);
        } else if (res.data.status === 'failed') {
          clearInterval(intervalRef.current);
          clearInterval(stepInterval);
          alert('Analysis failed. Please check your resume and API key, and try again.');
          window.location.reload(); // Quick way to return to jobs
        }
      } catch { /* ignore */ }
    }, 2000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(stepInterval);
    };
  }, [resumeId, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl p-10 shadow-lg"
    >
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
          <Brain className="w-10 h-10 text-brand-600 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI is Analyzing Your Resume</h2>
        <p className="text-gray-600 text-sm">Our agents are extracting insights from your CV.</p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                active ? 'bg-brand-50 border border-brand-100 shadow-sm' :
                done ? 'bg-green-50 border border-green-100' : 'opacity-40 border border-transparent'
              }`}
            >
              <div className="flex-shrink-0">
                {done ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : active ? (
                  <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span className={`text-sm font-bold ${done ? 'text-green-700' : active ? 'text-brand-700' : 'text-gray-500'}`}>
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---- Analysis Result View ----
function ResultView({ data, jobTitle, onBack, onStartInterview }) {
  const score = data?.ats_score || 0;
  const matchScore = data?.match_score || null;
  const eligible = score >= 50;

  const parsedSkills = Array.isArray(data?.parsed_skills) ? data.parsed_skills : [];
  const strengths = Array.isArray(data?.strengths) ? data.strengths : [];
  const weaknesses = Array.isArray(data?.weaknesses) ? data.weaknesses : [];
  const missingSkills = Array.isArray(data?.missing_skills) ? data.missing_skills : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Analysis Complete ✨</h2>
          <p className="text-gray-600 font-medium mt-1">{jobTitle ? `Applied for: ${jobTitle}` : 'General resume analysis'}</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 px-5 py-2.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors shadow-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Jobs
        </button>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center shadow-sm">
          <ATSGauge score={score} />
          <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Overall ATS Score</p>
          <p className="text-sm font-bold mt-2 px-3 py-1 rounded bg-gray-100">
            {score >= 80 ? '🟢 Strong candidate' : score >= 60 ? '🟡 Moderate match' : '🔴 Needs improvement'}
          </p>
        </div>
        {matchScore !== null && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center shadow-sm">
            <ATSGauge score={matchScore} />
            <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Job Match Score</p>
            <p className="text-sm font-bold text-brand-700 mt-2 px-3 py-1 rounded bg-brand-50 border border-brand-100">{data.recommendation || 'Under Review'}</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {data.experience_summary && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-brand-600" /> Experience Summary</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{data.experience_summary}</p>
        </div>
      )}

      {/* Skills */}
      <div className="grid md:grid-cols-3 gap-6">
        {parsedSkills.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Detected Skills</h3>
            <div className="flex flex-wrap gap-2">
              {parsedSkills.map(s => (
                <span key={s} className="px-2 py-1 rounded bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">{s}</span>
              ))}
            </div>
          </div>
        )}
        {strengths.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 mb-4">Strengths</h3>
            <ul className="space-y-2">
              {strengths.map(s => (
                <li key={s} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {weaknesses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4">Areas to Improve</h3>
            <ul className="space-y-2">
              {weaknesses.map(s => (
                <li key={s} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Missing skills */}
      {missingSkills.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-600 mb-4">Missing Skills for This Role</h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map(s => (
              <span key={s} className="px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-200">{s}</span>
            ))}
          </div>
        </div>
      )}
      {/* Video Interview CTA */}
      <div className={`rounded-xl p-8 border shadow-sm ${eligible ? 'bg-brand-50 border-brand-200' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className={`font-extrabold text-xl mb-2 flex items-center gap-2 ${eligible ? 'text-gray-900' : 'text-gray-900'}`}>
              🎥 {eligible ? 'Proceed to Video Interview' : 'Video Interview'}
            </h3>
            <p className="text-sm font-medium text-gray-600">
              {eligible
                ? 'Great score! The next step is a short AI-powered screening interview.'
                : `Minimum ATS score of 50 required. Your score: ${score.toFixed(0)}.`}
            </p>
          </div>
          <button
            onClick={eligible ? onStartInterview : undefined}
            disabled={!eligible}
            className={`flex-shrink-0 px-8 py-4 rounded font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              eligible
                ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-lg cursor-pointer'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            Start Interview <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Upload Modal ----
function UploadModal({ job, onClose, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) { setError('Please upload a PDF or DOCX file.'); return; }
    setFile(f); setError('');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await resumeAPI.upload(file, job?.id);
      onUploaded(res.data, job);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : 
                    (Array.isArray(detail) ? detail[0].msg : 'Upload failed. Please try again.');
      setError(errMsg);
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">Upload Your Resume</h3>
            {job && <p className="text-sm font-medium text-brand-600 mt-1">Applying for: {job.title}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            dragging ? 'border-brand-600 bg-brand-50' :
            file ? 'border-green-500 bg-green-50' :
            'border-gray-300 hover:border-brand-500 hover:bg-gray-50'
          }`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-gray-900">{file.name}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-bold text-gray-900 mb-1">Drop your resume here</p>
              <p className="text-xs font-medium text-gray-500">PDF or DOCX · up to 10MB</p>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mt-4 bg-red-50 border border-red-100 rounded p-3 font-medium">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="w-full mt-6 py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {uploading
            ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
            : <><Zap className="w-5 h-5" /> Analyze with AI</>}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---- Main Candidate Portal ----
export default function CandidatePortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [view, setView] = useState('jobs'); // 'jobs' | 'processing' | 'result' | 'interview'
  const [resumeData, setResumeData] = useState(null);
  const [resultJob, setResultJob] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [interviewSession, setInterviewSession] = useState(null); // { id, questions }

  useEffect(() => {
    jobsAPI.getAll()
      .then(r => setJobs(r.data))
      .catch(console.error)
      .finally(() => setLoadingJobs(false));
  }, []);

  const handleUploaded = (resume, job) => {
    setShowUpload(false);
    setResultJob(job);
    setResumeData({ id: resume.id });
    setView('processing');
  };

  const handleProcessingComplete = (data) => {
    setResumeData(data);
    setView('result');
  };

  const handleStartInterview = async () => {
    try {
      const res = await interviewAPI.start(resultJob?.id, resumeData?.id);
      setInterviewSession(res.data);
      setView('interview');
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-brand-500/20 selection:text-brand-700">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              Aaba<span className="text-brand-600">soft</span>
              <sup className="text-[10px] text-brand-600 font-normal ml-0.5">®</sup>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user?.full_name}</p>
              <p className="text-xs font-semibold text-brand-600">Candidate Portal</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 text-sm font-bold shadow-sm">
              {user?.full_name?.[0]}
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="p-2 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 shadow-sm">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Jobs View */}
          {view === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-10 text-center sm:text-left">
                <h1 className="text-4xl font-black text-gray-900 mb-3">Open Positions</h1>
                <p className="text-gray-600 text-lg">Find a role and let our AI evaluate your resume instantly.</p>
              </div>

              {loadingJobs ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid gap-6">
                  {jobs.map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white border border-gray-200 hover:border-brand-300 rounded-xl p-8 group transition-all hover:shadow-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-brand-500 transition-colors"></div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-brand-700 transition-colors">{job.title}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 mb-4">
                            <span className="flex items-center gap-1.5 text-brand-600"><Briefcase className="w-4 h-4" /> Aabasoft Corp</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                            <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {job.salary_range}</span>
                          </div>
                          <p className="text-base text-gray-600 line-clamp-2 mb-6 leading-relaxed max-w-3xl">{job.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements?.slice(0, 5).map(r => (
                              <span key={r} className="px-3 py-1 rounded bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700">{r}</span>
                            ))}
                            {job.requirements?.length > 5 && <span className="text-xs font-bold text-gray-400 self-center ml-1">+{job.requirements.length - 5} more</span>}
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-4 sm:mt-0">
                          <button
                            onClick={() => { setSelectedJob(job); setShowUpload(true); }}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded shadow-sm hover:shadow transition-all whitespace-nowrap"
                          >
                            Apply Now <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Processing View */}
          {view === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessingView resumeId={resumeData?.id} onComplete={handleProcessingComplete} />
            </motion.div>
          )}

          {/* Result View */}
          {view === 'result' && resumeData && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultView
                data={resumeData}
                jobTitle={resultJob?.title}
                onBack={() => setView('jobs')}
                onStartInterview={handleStartInterview}
              />
            </motion.div>
          )}

          {/* Interview View — full screen, hides header */}
          {view === 'interview' && interviewSession && (
            <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#08090f]"
            >
              <InterviewRoom
                interviewId={interviewSession.id}
                questions={interviewSession.questions || []}
                jobTitle={resultJob?.title}
                onFinish={() => setView('jobs')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            job={selectedJob}
            onClose={() => setShowUpload(false)}
            onUploaded={handleUploaded}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
