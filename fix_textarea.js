const fs = require('fs');
const file = 'frontend/src/components/InterviewRoom.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{!speechSupported && isAnswering && \([\s\S]*?<textarea[\s\S]*?\/>\s*\)\}/,
  `{isAnswering && (
                    <textarea 
                      className="w-full h-full bg-transparent text-gray-200 text-sm resize-none focus:outline-none placeholder:text-gray-600 mt-2" 
                      placeholder={speechSupported ? "Speak your answer or type here..." : "Mic unavailable. Type your answer..."} 
                      value={transcript} 
                      onChange={e=>setTranscript(e.target.value)}
                    />
                  )}`
);

fs.writeFileSync(file, content);
console.log('Textarea fallback updated');
