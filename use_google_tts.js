const fs = require('fs');
const file = 'frontend/src/components/InterviewRoom.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const speakQuestion = useCallback\(\(text, onDone\) => \{[\s\S]*?\}, \[\]\);/,
  `const speakQuestion = useCallback((text, onDone) => {
    speechSynthesis.cancel();
    setQuestionText('');
    
    const words = text.split(' ');
    let i = 0;
    const wordInterval = setInterval(() => {
      if (i < words.length) { setQuestionText(prev => prev + (prev ? ' ' : '') + words[i]); i++; }
      else clearInterval(wordInterval);
    }, Math.max(150, 3000 / words.length));

    // Use highly realistic Google Translate TTS for human-like voice
    const audioUrl = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=en-US&client=tw-ob\`;
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
  }, []);`
);

fs.writeFileSync(file, content);
console.log('Voice TTS updated to Google Audio');
