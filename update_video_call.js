const fs = require('fs');
const file = 'frontend/src/components/InterviewRoom.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace AIVoiceOrb with AIHumanVideoCall
content = content.replace(
  /function AIVoiceOrb\(\{\s*speaking,\s*listening\s*\}\)\s*\{[\s\S]*?\n\}\n/m,
  `function AIHumanVideoCall({ speaking, listening }) {
  // Using a Synthesia AI Avatar demo video from YouTube
  // Muted background video playing on loop to simulate the AI person
  // We use CSS scale to hide the YouTube branding and controls
  const videoId = "lrZ4qy7rW6M";
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#111]">
      <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] md:w-[130%] md:h-[130%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-90">
        <iframe
          src={\`https://www.youtube-nocookie.com/embed/\${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=\${videoId}&modestbranding=1&playsinline=1\`}
          className="w-full h-full object-cover"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
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
            {(speaking || listening) && <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full \${speaking ? 'bg-brand-400' : 'bg-red-400'} opacity-75\`}></span>}
            <span className={\`relative inline-flex rounded-full h-3 w-3 \${speaking ? 'bg-brand-500' : listening ? 'bg-red-500' : 'bg-gray-500'}\`}></span>
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
}\n`
);

// Replace AIVoiceOrb call with AIHumanVideoCall
content = content.replace(
  /<AIVoiceOrb speaking=\{isSpeaking\} listening=\{isRecording\} \/>/,
  `<AIHumanVideoCall speaking={isSpeaking} listening={isRecording} />`
);

fs.writeFileSync(file, content);
console.log('Reverted to Video Call effect successfully');
