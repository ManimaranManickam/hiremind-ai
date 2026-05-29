const fs = require('fs');
const file = 'frontend/src/components/InterviewRoom.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the video ID
content = content.replace(
  /const videoId = "lrZ4qy7rW6M";/,
  `const videoId = "rUAzw9RgigE";`
);

fs.writeFileSync(file, content);
console.log('Video ID updated to single woman talking');
