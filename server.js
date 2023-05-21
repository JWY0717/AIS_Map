const express = require('express');
const request = require('request');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/script', (req, res) => {
  const url = 'http://www.khoa.go.kr/oceanmap/BASEMAP/otmsBasemapApi.do?ServiceKey=936EAC2E348116FCE2E661F2D';

  // 원격 스크립트 다운로드
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.type('text/javascript');

      // SameSite 속성 설정
      res.setHeader('Set-Cookie', 'cookieName=cookieValue; SameSite=None; Secure');

      res.send(body);
    } else {
      res.status(500).send('Error downloading script');
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
