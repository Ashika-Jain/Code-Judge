const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration - most liberal for testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Serve static files from the frontend dist directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Test CORS route
app.get('/test-cors', (req, res) => {
  res.json({ msg: 'CORS is working' });
});

// Import the real aiCodeReview function
const { aiCodeReview } = require('./aiCodeReview');

app.post("/ai-review", async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }
    try {
        const review = await aiCodeReview(code);
        res.json({ "review": review });
    } catch (error) {
        res.status(500).json({ error: "Error in AI review, error: " + error.message });
    }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-judge', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/problems', require('./routes/problems.js'));
app.use('/api/submissions', require('./routes/submissions.js'));

// Handle all other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env[ec2-user@ip-172-31-39-242 backend]$ sudo lsof -i :5001
COMMAND
docker-pr 17275 root
docker-pr 17280 root
[ec2-user@ip-172-31-39-242 backend]$

9 main* O A0
main*

PID USER

TYPE DEVICE SIZE/OFF NODE NAME
Ot0 TCP *: commplex-link (LISTEN)
0t0 TCP *: commplex-link (LISTEN)

Ctrl+K to generate a command

FD
4u IPv4 46364
4u

IPv6

46370

Cursor Tab Ln 63, Col 25 Spa.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
});
