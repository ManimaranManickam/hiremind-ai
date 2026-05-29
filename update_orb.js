const fs = require('fs');
const file = 'frontend/src/components/InterviewRoom.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace AIHRVideo with AIVoiceOrb
content = content.replace(
  /function AIHRVideo\(\{\s*speaking\s*\}\)\s*\{[\s\S]*?\n\}\n/m,
  `function AIVoiceOrb({ speaking, listening }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      {/* Dynamic Background Glow */}
      <motion.div 
        animate={{ 
          scale: speaking ? [1, 1.5, 1] : listening ? [1, 1.1, 1] : 1,
          opacity: speaking ? [0.3, 0.6, 0.3] : listening ? [0.2, 0.4, 0.2] : 0.1
        }}
        transition={{ duration: speaking ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
        className={\`absolute w-96 h-96 rounded-full blur-3xl \${listening ? 'bg-red-500/30' : 'bg-brand-500/30'}\`}
      />
      
      {/* Central Orb */}
      <div className="relative flex items-center justify-center z-10">
        <motion.div
          animate={{
            scale: speaking ? [1, 1.15, 1] : listening ? [1, 1.05, 1] : 1,
            boxShadow: speaking 
              ? ['0 0 40px 10px rgba(20,184,166,0.3)', '0 0 80px 30px rgba(20,184,166,0.6)', '0 0 40px 10px rgba(20,184,166,0.3)'] 
              : listening 
                ? ['0 0 20px 5px rgba(239,68,68,0.3)', '0 0 40px 15px rgba(239,68,68,0.5)', '0 0 20px 5px rgba(239,68,68,0.3)']
                : '0 0 20px 5px rgba(31,41,55,0.5)'
          }}
          transition={{ duration: speaking ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
          className={\`w-48 h-48 rounded-full border-4 flex items-center justify-center \${listening ? 'bg-red-500/10 border-red-500/50' : 'bg-brand-500/10 border-brand-500/50 backdrop-blur-md'}\`}
        >
          {listening ? (
            <Mic className="w-16 h-16 text-red-400" />
          ) : (
            <Brain className={\`w-16 h-16 \${speaking ? 'text-brand-300' : 'text-gray-500'}\`} />
          )}
        </motion.div>
        
        {/* Audio Wave Rings (only when speaking) */}
        <AnimatePresence>
          {speaking && [1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
              className="absolute w-48 h-48 border border-brand-400 rounded-full pointer-events-none"
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Status Text */}
      <div className="absolute bottom-10 flex flex-col items-center">
        <p className={\`text-lg font-bold tracking-widest uppercase \${listening ? 'text-red-400' : speaking ? 'text-brand-400' : 'text-gray-500'}\`}>
          {speaking ? 'AI is speaking...' : listening ? 'AI is listening...' : 'AI is on standby'}
        </p>
        <p className="text-gray-500 text-xs mt-2">HireMind Voice Assistant</p>
      </div>
    </div>
  );
}\n`
);

// Replace AIHRVideo with AIVoiceOrb in render
content = content.replace(
  /<AIHRVideo speaking=\{isSpeaking\} \/>/,
  `<AIVoiceOrb speaking={isSpeaking} listening={isRecording} />`
);

fs.writeFileSync(file, content);
console.log('Orb UI updated successfully');
