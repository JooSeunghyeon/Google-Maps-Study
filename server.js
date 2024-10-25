require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

// 정적 파일 제공
app.use(express.static('public'));

// API 키를 전달하는 엔드포인트
app.get('/api-key', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
