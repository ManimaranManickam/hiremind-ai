const fs = require('fs');
const file = 'frontend/src/components/InterviewRoom.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace AISpeakingAvatar with the new realistic AI avatar
content = content.replace(
  /function AISpeakingAvatar\(\{\s*speaking\s*\}\)\s*\{[\s\S]*?\n\}/,
  `function AIHRVideo({ speaking }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#111]">
      <motion.img 
        src="/hr_avatar.png" 
        alt="AI Recruiter"
        animate={speaking ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full object-cover object-top opacity-90"
      />
      {/* Speaking Overlay Glow */}
      <AnimatePresence>
        {speaking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-brand-500 mix-blend-overlay pointer-events-none"
          />
        )}
      </AnimatePresence>
      {/* Name Tag */}
      <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          {speaking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>}
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">Sarah Jenkins</p>
          <p className="text-brand-300 text-[10px] uppercase tracking-wider font-bold">AI Recruiter</p>
        </div>
      </div>
    </div>
  );
}`
);

// Update speakQuestion to be robust
content = content.replace(
  /const speakQuestion = useCallback\(\(text, onDone\) => \{[\s\S]*?\}, \[\]\);/,
  `const speakQuestion = useCallback((text, onDone) => {
    speechSynthesis.cancel();
    setQuestionText('');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; utterance.pitch = 1.0;
    
    const playVoice = () => {
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v => (v.name.includes('Google') || v.name.includes('Premium')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en-')) || voices[0];
      if (preferred) utterance.voice = preferred;
      
      const words = text.split(' ');
      let i = 0;
      const wordInterval = setInterval(() => {
        if (i < words.length) { setQuestionText(prev => prev + (prev ? ' ' : '') + words[i]); i++; }
        else clearInterval(wordInterval);
      }, Math.max(150, 3000 / words.length)); // approximate timing
      
      utterance.onend = () => { clearInterval(wordInterval); setQuestionText(text); onDone(); };
      utterance.onerror = () => { clearInterval(wordInterval); setQuestionText(text); onDone(); };
      speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length > 0) {
      playVoice();
    } else {
      speechSynthesis.onvoiceschanged = () => {
        playVoice();
        speechSynthesis.onvoiceschanged = null;
      };
      // Fallback if event doesn't fire
      setTimeout(() => { if (!speechSynthesis.speaking) playVoice(); }, 500);
    }
  }, []);`
);

// Update layout logic: Left column should ALWAYS contain AIHRVideo AND user camera (PIP)
content = content.replace(
  /<div className="w-2\/5 relative bg-black border-r border-dark-border">[\s\S]*?<\/div>\s*\{\/\* Right: Question \+ Transcript \*\/\}/,
  `<div className="w-2/5 relative bg-black border-r border-dark-border overflow-hidden group">
          <AIHRVideo speaking={isSpeaking} />

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

        {/* Right: Question + Transcript */}`
);

fs.writeFileSync(file, content);
console.log('Updated successfully');
