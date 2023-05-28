const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// CORS 설정
app.use(cors());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
