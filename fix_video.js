const fs = require('fs');
const file = 'frontend/src/components/InterviewRoom.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const startCamera = async \(\) => \{[\s\S]*?\};/,
  `const startCamera = async () => {
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
  });`
);

fs.writeFileSync(file, content);
console.log('Video ref fixed');
