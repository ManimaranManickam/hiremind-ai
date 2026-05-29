import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, ChevronRight, CheckCircle, Brain, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { interviewAPI } from '../services/api';
import useAntiCheat from '../hooks/useAntiCheat';
import { WarningOverlay, TerminatedScreen } from './InterviewWarning';

const STATES = { SETUP:'setup', AI_SPEAKING:'ai_speaking', ANSWERING:'answering', REVIEWING:'reviewing', ROUND_TRANSITION:'round_transition', DONE:'done', ANALYZING:'analyzing', RESULTS:'results', TERMINATED:'terminated' };
const ROUND_NAMES = ["Round 1: Aptitude", "Round 2: Technical/Coding", "Round 3: Final HR"];

function ScoreGauge({ score, label, color='#14b8a6' }) {
  const r=42, circ=2*Math.PI*r, pct=Math.max(0,Math.min((score||0)/10,1));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1f2937" strokeWidth="8"/>
          <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} initial={{strokeDashoffset:circ}} animate={{strokeDashoffset:circ-pct*circ}} transition={{duration:1.2,ease:'easeOut'}}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-white">{score?.toFixed(1)}</span>
          <span className="text-[9px] text-gray-400">/10</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
}

function AIHumanVideoCall({ speaking, listening }) {
  // Using a Synthesia AI Avatar demo video from YouTube
  // Muted background video playing on loop to simulate the AI person
  // We use CSS scale to hide the YouTube branding and controls
  const videoId = "rUAzw9RgigE";
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#111] flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-90">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
          alt="HR Recruiter"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Invisible overlay to prevent clicking the video and add styling */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      
      {/* Audio Reactive Glow when AI is speaking */}
      <AnimatePresence>
        {speaking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 z-10 bg-brand-500 mix-blend-overlay pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Name Tag and Status */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
        <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3 w-max shadow-2xl">
          <div className="relative flex h-3 w-3">
            {(speaking || listening) && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${speaking ? 'bg-brand-400' : 'bg-red-400'} opacity-75`}></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${speaking ? 'bg-brand-500' : listening ? 'bg-red-500' : 'bg-gray-500'}`}></span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Sarah Jenkins</p>
            <p className="text-brand-300 text-[10px] uppercase tracking-wider font-bold">AI Recruiter</p>
          </div>
        </div>
        
        {/* State Indicator */}
        <div className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-lg border border-white/5 w-max">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/70">
            {speaking ? 'Speaking...' : listening ? 'Listening...' : 'Standby'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InterviewRoom({ interviewId, questions, jobTitle, onFinish }) {
  const [state, setState] = useState(STATES.SETUP);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [camError, setCamError] = useState(false);
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(120);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [warning, setWarning] = useState(null);
  const [warningCountdown, setWarningCountdown] = useState(5);
  const [terminationReason, setTerminationReason] = useState('');
  const [questionText, setQuestionText] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const isInterviewActive = [STATES.AI_SPEAKING, STATES.ANSWERING, STATES.REVIEWING, STATES.DONE].includes(state);

  const handleWarning = useCallback((reason) => {
    if (state === STATES.TERMINATED) return;
    setWarning(reason);
    setWarningCountdown(5);
    let c = 5;
    warningTimerRef.current = setInterval(() => {
      c--;
      setWarningCountdown(c);
      if (c <= 0) { clearInterval(warningTimerRef.current); setWarning(null); }
    }, 1000);
  }, [state]);

  const handleTerminate = useCallback((reason) => {
    clearInterval(timerRef.current);
    clearInterval(warningTimerRef.current);
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    speechSynthesis.cancel();
    setTerminationReason(reason);
    setState(STATES.TERMINATED);
    // Auto-submit with terminated flag
    const currentAnswers = answers.length > 0 ? answers : [];
    const flagged = [...currentAnswers, { question: questions[currentQ] || '', transcript: `[TERMINATED: ${reason}]` }];
    interviewAPI.submit(interviewId, flagged, true, reason).catch(() => {});
  }, [answers, currentQ, questions, interviewId]);

  useAntiCheat({ enabled: isInterviewActive, onWarning: handleWarning, onTerminate: handleTerminate });

  useEffect(() => {
    setSpeechSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    startCamera();
    return () => stopEverything();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { setCamError(true); }
  };

  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  const stopEverything = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    clearInterval(timerRef.current);
    speechSynthesis.cancel();
  };

  const speakQuestion = useCallback((text, onDone) => {
    speechSynthesis.cancel();
    setQuestionText('');
    
    const words = text.split(' ');
    let i = 0;
    const wordInterval = setInterval(() => {
      if (i < words.length) { setQuestionText(prev => prev + (prev ? ' ' : '') + words[i]); i++; }
      else clearInterval(wordInterval);
    }, Math.max(150, 3000 / words.length));

    // Use highly realistic Google Translate TTS for human-like voice
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=tw-ob`;
    const audio = new Audio(audioUrl);
    
    const fallbackToBrowser = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; utterance.pitch = 1.0;
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v => (v.name.includes('Google') || v.name.includes('Premium')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en-')) || voices[0];
      if (preferred) utterance.voice = preferred;
      
      utterance.onend = () => { clearInterval(wordInterval); setQuestionText(text); onDone(); };
      utterance.onerror = () => { clearInterval(wordInterval); setQuestionText(text); onDone(); };
      speechSynthesis.speak(utterance);
    };

    audio.onended = () => {
      clearInterval(wordInterval);
      setQuestionText(text);
      onDone();
    };

    audio.onerror = fallbackToBrowser;

    audio.play().catch(err => {
      console.warn('Audio play failed, falling back:', err);
      fallbackToBrowser();
    });
  }, []);

  const startQuestion = useCallback((qIndex) => {
    setState(STATES.AI_SPEAKING);
    setTranscript(''); setInterimTranscript('');
    speakQuestion(questions[qIndex], () => setState(STATES.ANSWERING));
  }, [questions, speakQuestion]);

  const startSpeech = useCallback(() => {
    if (!speechSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let final = '', interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
        else interim += event.results[i][0].transcript;
      }
      if (final) setTranscript(prev => prev + final);
      setInterimTranscript(interim);
    };
    recognition.onerror = () => {};
    recognition.onend = () => { if (isRecording) try { recognition.start(); } catch {} };
    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported, isRecording]);

  const startRecording = () => {
    setTranscript(''); setInterimTranscript(''); setIsRecording(true); setTimer(120);
    startSpeech();
    timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { stopRecording(); return 0; } return t-1; }), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    setInterimTranscript('');
    clearInterval(timerRef.current);
    setState(STATES.REVIEWING);
  };

  const confirmAnswer = () => {
    const final = transcript.trim() || '[No response]';
    const newAnswers = [...answers, { question: questions[currentQ], transcript: final }];
    setAnswers(newAnswers);
    if (currentQ + 1 >= questions.length) { setState(STATES.DONE); }
    else { setState(STATES.ROUND_TRANSITION); }
  };

  const submitInterview = async () => {
    setState(STATES.ANALYZING);
    try {
      await interviewAPI.submit(interviewId, answers);
      const poll = setInterval(async () => {
        try {
          const res = await interviewAPI.getById(interviewId);
          if (res.data.status === 'completed') { clearInterval(poll); setResults(res.data); setState(STATES.RESULTS); }
          else if (res.data.status === 'failed') { clearInterval(poll); setState(STATES.RESULTS); }
        } catch {}
      }, 3000);
    } catch { setState(STATES.DONE); }
  };

  const enterFullscreen = async () => {
    try { await document.documentElement.requestFullscreen(); } catch {}
  };

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (state === STATES.TERMINATED) return <TerminatedScreen reason={terminationReason} onAcknowledge={onFinish} />;

  if (state === STATES.SETUP) return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#08090f]">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-lg w-full bg-dark-card border border-dark-border rounded-3xl p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-brand-500/10 rounded-2xl flex items-center justify-center">
          <Video className="w-8 h-8 text-brand-500"/>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Live AI Interview</h2>
        <p className="text-gray-400 text-sm mb-2">Role: <span className="text-brand-400 font-medium">{jobTitle}</span></p>
        <p className="text-gray-400 text-sm mb-6">This interview consists of <strong className="text-white">3 distinct rounds</strong> (Aptitude, Technical, and HR). The AI will ask one targeted question per round based on your resume.</p>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-left space-y-2">
          <p className="text-red-400 font-semibold text-sm">🚨 Anti-Cheat Rules — Strictly Enforced</p>
          {['Do NOT switch tabs or windows','Do NOT open new tabs (Ctrl+T / Ctrl+N)','Do NOT minimize the browser','Do NOT exit fullscreen','Do NOT right-click during the interview'].map(r => (
            <div key={r} className="flex items-center gap-2 text-xs text-gray-400"><AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0"/>{r}</div>
          ))}
          <p className="text-xs text-yellow-400 mt-2">⚠️ 1 warning allowed. 2nd violation = immediate termination.</p>
        </div>
        {camError && <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm">⚠️ Camera access denied. Enable camera for best experience.</div>}
        <button onClick={async () => { await enterFullscreen(); startQuestion(0); }}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center justify-center gap-2">
          <Brain className="w-5 h-5"/> Begin Live Interview
        </button>
        <button onClick={onFinish} className="mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors">Not now — go back</button>
      </motion.div>
    </div>
  );

  if (state === STATES.ROUND_TRANSITION) return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#08090f]">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-lg w-full bg-dark-card border border-dark-border rounded-3xl p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-brand-500/10 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-brand-500"/>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">{ROUND_NAMES[currentQ]} Completed!</h2>
        <p className="text-gray-400 text-sm mb-8">Up next: <span className="text-brand-400 font-bold text-lg block mt-2">{ROUND_NAMES[currentQ+1] || "Final Analysis"}</span></p>
        <button onClick={() => { setCurrentQ(q => q+1); startQuestion(currentQ+1); }} className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
          Start Next Round <ChevronRight className="w-5 h-5"/>
        </button>
      </motion.div>
    </div>
  );

  if (state === STATES.ANALYZING) return (
    <div className="min-h-screen flex items-center justify-center bg-[#08090f]">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="max-w-md text-center px-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-brand-500/10 rounded-3xl flex items-center justify-center">
          <Brain className="w-10 h-10 text-brand-500 animate-pulse"/>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Analyzing Your Interview</h2>
        <p className="text-gray-400 mb-8">Our AI is evaluating your responses…</p>
        <div className="space-y-3 text-left bg-dark-card border border-dark-border rounded-2xl p-6">
          {['Transcribing responses','Evaluating communication','Assessing technical depth','Measuring cultural fit','Generating final report'].map((s,i) => (
            <motion.div key={s} className="flex items-center gap-3 text-sm" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.4}}>
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0"/>
              <span className="text-gray-300">{s}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (state === STATES.RESULTS && results) {
    const rec = results.overall_recommendation;
    const recColor = rec?.toLowerCase().includes('strong') ? '#22c55e' : '#14b8a6';
    return (
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{background:`${recColor}20`,color:recColor}}>
            <CheckCircle className="w-4 h-4"/> {rec || 'Analysis Complete'}
          </div>
          <h2 className="text-3xl font-extrabold text-white">Interview Complete!</h2>
          <p className="text-gray-400 text-sm mt-1">AI analysis for <span className="text-brand-400">{jobTitle}</span></p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-6 text-center uppercase tracking-wider">Performance Scores</h3>
          <div className="flex justify-around flex-wrap gap-6">
            <ScoreGauge score={results.communication_score} label="Communication" color="#14b8a6"/>
            <ScoreGauge score={results.technical_score} label="Technical" color="#6366f1"/>
            <ScoreGauge score={results.cultural_fit_score} label="Cultural Fit" color="#22c55e"/>
            <ScoreGauge score={results.overall_score} label="Overall" color="#f59e0b"/>
          </div>
        </div>
        {results.feedback && <div className="bg-dark-card border border-dark-border rounded-2xl p-6"><p className="text-gray-300 text-sm leading-relaxed">{results.feedback}</p></div>}
        <button onClick={onFinish} className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all">Back to Jobs</button>
      </motion.div>
    );
  }

  const isSpeaking = state === STATES.AI_SPEAKING;
  const isAnswering = state === STATES.ANSWERING;
  const isReviewing = state === STATES.REVIEWING;
  const isDone = state === STATES.DONE;

  return (
    <div className="flex flex-col h-screen bg-[#08090f]">
      {warning && <WarningOverlay reason={warning} countdown={warningCountdown}/>}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-dark-bg/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-brand-500"/>
          <span className="font-bold text-sm">HireMind <span className="text-brand-500">AI</span> Live Interview</span>
        </div>
        <div className="flex items-center gap-2">
          {questions.map((_,i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i<currentQ?'bg-green-500':i===currentQ?'bg-brand-500 scale-125':'bg-gray-700'}`}/>
          ))}
          <span className="text-xs text-brand-400 ml-2 font-bold uppercase tracking-widest">{ROUND_NAMES[currentQ] || 'Interview'}</span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> {fmt(timer)}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: AI avatar or candidate camera */}
        <div className="w-2/5 relative bg-black border-r border-dark-border overflow-hidden group">
          <AIHumanVideoCall speaking={isSpeaking} listening={isRecording} />

          {/* User Camera PIP */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 w-32 md:w-48 aspect-[3/4] md:aspect-video bg-gray-900 rounded-2xl overflow-hidden border-2 border-dark-border shadow-2xl z-20 group-hover:border-brand-500/50 transition-colors"
          >
            {camError ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-900">
                <VideoOff className="w-6 h-6 text-red-400 mb-1" />
                <span className="text-[10px] text-red-300 px-2 text-center">Camera Denied</span>
              </div>
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover -scale-x-100" />
            )}
            
            {isRecording && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-red-500/90 backdrop-blur-md rounded-md">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[9px] font-bold tracking-wider">LIVE</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Question + Transcript */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {isSpeaking && (
              <motion.div key="speaking" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="flex-1 flex flex-col p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"/>
                  <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">AI is asking Question {currentQ+1}</span>
                </div>
                <div className="flex-1 flex items-center">
                  <h3 className="text-2xl font-bold text-white leading-snug">{questionText}<span className="inline-block w-0.5 h-6 bg-brand-500 ml-1 animate-pulse"/></h3>
                </div>
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4">
                  <p className="text-brand-300 text-sm">🎧 Please listen carefully. Recording will begin automatically when the AI finishes.</p>
                </div>
              </motion.div>
            )}

            {(isAnswering || isReviewing) && (
              <motion.div key={`q-${currentQ}`} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Question {currentQ+1}</span>
                  <h3 className="text-xl font-bold text-white mt-2 leading-snug">{questions[currentQ]}</h3>
                </div>
                <div className="flex-1 bg-dark-bg border border-dark-border rounded-2xl p-5 mb-5 overflow-y-auto min-h-[120px]">
                  {!transcript && !interimTranscript && !isReviewing && (
                    <p className="text-gray-600 text-sm">Your response will appear here as you speak…</p>
                  )}
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
                  {interimTranscript && <span className="text-gray-500 text-sm italic">{interimTranscript}</span>}
                  {isAnswering && (
                    <textarea 
                      className="w-full h-full bg-transparent text-gray-200 text-sm resize-none focus:outline-none placeholder:text-gray-600 mt-2" 
                      placeholder={speechSupported ? "Speak your answer or type here..." : "Mic unavailable. Type your answer..."} 
                      value={transcript} 
                      onChange={e=>setTranscript(e.target.value)}
                    />
                  )}
                </div>
                {isAnswering && !isRecording && (
                  <button onClick={startRecording} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    <div className="w-4 h-4 bg-white rounded-full"/> Start Speaking
                  </button>
                )}
                {isAnswering && isRecording && (
                  <button onClick={stopRecording} className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 ring-2 ring-red-500 ring-offset-2 ring-offset-[#08090f] animate-pulse">
                    <div className="w-4 h-4 bg-white rounded-sm"/> Stop Recording ({fmt(timer)} left)
                  </button>
                )}
                {isReviewing && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle className="w-4 h-4"/> Response recorded</div>
                    <div className="flex gap-3">
                      <button onClick={() => { setTranscript(''); setState(STATES.ANSWERING); startRecording(); }} className="flex-1 py-3 border border-dark-border hover:border-gray-500 text-gray-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4"/> Re-record
                      </button>
                      <button onClick={confirmAnswer} className="flex-grow py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        {currentQ+1>=questions.length ? <><CheckCircle className="w-4 h-4"/>Finish Interview</> : <><ChevronRight className="w-4 h-4"/>Complete Round</>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {isDone && (
              <motion.div key="done" initial={{opacity:0}} animate={{opacity:1}} className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-5"/>
                <h2 className="text-2xl font-bold text-white mb-2">All Questions Answered!</h2>
                <p className="text-gray-400 text-sm mb-8">Review your answers or submit for AI analysis.</p>
                <div className="w-full max-w-sm space-y-2 mb-8">
                  {answers.map((a,i) => (
                    <div key={i} className="text-left p-3 bg-dark-card border border-dark-border rounded-xl">
                      <p className="text-xs font-semibold text-brand-400 mb-1">Q{i+1}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{a.transcript}</p>
                    </div>
                  ))}
                </div>
                <button onClick={submitInterview} className="w-full max-w-sm py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  <Send className="w-5 h-5"/> Submit for AI Analysis
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
