const { spawn } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;  // Change the port to 3000

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files (like test.html, test.css, test.js)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the test.html file when accessing the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Route to handle summarization requests
app.post('/summarize', (req, res) => {
    const { text, script } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({ error: "No text provided for summarization." });
    }

    if (!script || !['summarizer.py', 'summarizer1.py'].includes(script)) {
        return res.status(400).json({ error: "Invalid script selection." });
    }

    // Log the selected script in the terminal
    console.log(`Selected script: ${script}`);
    console.log(`Running script: ${script} with input: "${text}"`);

    // Spawn the selected Python script
    const pythonProcess = spawn('python', [path.join(__dirname, script)]);

    // Send input text to the Python script
    pythonProcess.stdin.write(text);
    pythonProcess.stdin.end();

    let summary = "";

    // Capture Python script's output
    pythonProcess.stdout.on('data', (data) => {
        summary += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error("Error from Python script:", data.toString());
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.json({ summary: summary.trim() });
        } else {
            res.status(500).json({ error: "Failed to generate summary." });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

