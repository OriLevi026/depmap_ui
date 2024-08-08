const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');
const dotenv = require('dotenv');

dotenv.config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const API_ENDPOINT = "https://ujqbrreceoahpna3z7tt5fqxty0inhap.lambda-url.us-east-1.on.aws";

// Utility functions

// Load auth token from .env
const loadAuthToken = () => {
    const authToken = process.env.AUTH_TOKEN;
    if (!authToken) {
        console.error("Error: AUTH_TOKEN not found in .env file.");
        return null;
    }
    return authToken;
};

// Get headers with the auth token
const getHeaders = () => {
    const authToken = loadAuthToken();
    const headers = {};
    if (authToken) {
        headers['X-API-AUTH'] = authToken;
    }
    return headers;
};

// Handle response
const handleResponse = (response) => {
    try {
        if (response.data) {
            let data = response.data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            return data;
        }
        return {};
    } catch (error) {
        console.error("Error handling response:", error);
        return { error: error.message };
    }
};

// --- Analysis Routes ---
app.post('/analysis/start', async (req, res) => {
    const { label, action, model } = req.body;
    const payload = { model };

    try {
        const headers = getHeaders();
        const response = await axios.post(`${API_ENDPOINT}/analysis/${label}/${action}`, payload, { headers });
        const result = handleResponse(response);
        res.json(result);
    } catch (error) {
        console.error("Error starting analysis:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/analysis/status/:label/:action', async (req, res) => {
    const { label, action } = req.params;

    try {
        const headers = getHeaders();
        const response = await axios.get(`${API_ENDPOINT}/analysis/${label}/${action}/status`, { headers });
        
        const result = handleResponse(response);
        res.json(result);
    } catch (error) {
        console.error("Error getting analysis status:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/analysis/results/:label/:action?', async (req, res) => {
    const { label, action } = req.params;
    const { file, details = true } = req.query;

    try {
        const headers = getHeaders();
        const params = {};
        if (file) params.file = file;
        if (details) params.details = 'true';

        const endpoint = action
            ? `${API_ENDPOINT}/analysis/${label}/${action}`
            : `${API_ENDPOINT}/analysis/${label}`;

        const response = await axios.get(endpoint, { params, headers });
        const result = handleResponse(response);
        res.json(result);
    } catch (error) {
        console.error("Error getting analysis results:", error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/analysis/results/:label/:action', async (req, res) => {
    const { label, action } = req.params;

    try {
        const headers = getHeaders();
        const response = await axios.delete(`${API_ENDPOINT}/analysis/${label}/${action}`, { headers });
        console.log(response.data);
        const result = handleResponse(response);
        res.json(result);
    } catch (error) {
        console.error("Error deleting analysis results:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- Action Routes ---
app.get('/actions', async (req, res) => {
    try {
        const { names_only, label, status_only } = req.query;
        let endpoint = `${API_ENDPOINT}/action`;
        let params = {};

        if (names_only) params.name = '';
        if (label) {
            endpoint += `/label/${label}`;
            if (status_only) params.status_only = 'true';
        } else if (status_only) {
            return res.status(400).json({ error: "Status-only option requires a label" });
        }

        const headers = getHeaders();
        const response = await axios.get(endpoint, { params, headers });
        const actions = handleResponse(response);

        res.json(actions);
    } catch (error) {
        console.error("Error getting actions:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/actions/:action', async (req, res) => {
    try {
        const { action } = req.params;
        const { query } = req.query;

        let endpoint = `${API_ENDPOINT}/action/${action}`;
        if (query) endpoint += `?${query}`;

        const headers = getHeaders();
        const response = await axios.get(endpoint, { headers });
        const actionData = handleResponse(response);

        res.json(actionData);
    } catch (error) {
        console.error("Error getting specific action:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/actions', async (req, res) => {
    try {
        const { action, steps, include } = req.body;

        const payload = { action, steps, include };
        const headers = getHeaders();
        const response = await axios.post(`${API_ENDPOINT}/action`, payload, { headers });
        const result = handleResponse(response);

        res.json(result);
    } catch (error) {
        console.error("Error storing action:", error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/actions', async (req, res) => {
    try {
        const { action } = req.body;

        const headers = getHeaders();
        const response = await axios.delete(`${API_ENDPOINT}/action`, { data: { action }, headers });
        const result = handleResponse(response);

        res.json(result);
    } catch (error) {
        console.error("Error deleting action:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- Label Routes ---
app.get('/labels', async (req, res) => {
    try {
        const { status } = req.query;
        let url = `${API_ENDPOINT}/label`;

        if (status) url += "?check_s3=true";

        const headers = getHeaders();
        const response = await axios.get(url, { headers });
        const labels = handleResponse(response);

        res.json(labels);
    } catch (error) {
        console.error("Error getting labels:", error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/labels/:label', async (req, res) => {
    try {
        const { label } = req.params;

        const headers = getHeaders();
        const response = await axios.delete(`${API_ENDPOINT}/label/${label}`, { headers });
        const result = handleResponse(response);

        res.json(result);
    } catch (error) {
        console.error("Error deleting label:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- Clone Routes ---
app.post('/clone', async (req, res) => {
    const { label, urls } = req.body;
    console.log("Cloning", urls, "to", label);
    const tempDir = path.join('temp_clones', label);

    try {
        fs.mkdirSync(tempDir, { recursive: true });

        const clonePromises = urls.map(url => {
            const repoName = url.split('/').pop();
            const repoPath = path.join(tempDir, repoName);
            return new Promise((resolve, reject) => {
                exec(`git clone --depth 1 ${url} ${repoPath}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error cloning ${url}:`, stderr);
                        reject(error);
                    } else {
                        console.log(`Cloned ${url}:`, stdout);
                        resolve();
                    }
                });
            });
        });

        await Promise.all(clonePromises);

        const zipPath = `${tempDir}.zip`;
        const zip = new AdmZip();
        zip.addLocalFolder(tempDir);
        zip.writeZip(zipPath);
        console.log(`Created zip file: ${zipPath}`);

        const headers = getHeaders();
        const presignedUrlResponse = await axios.post(`${API_ENDPOINT}/clone`, { label }, { headers });
        const presignedUrl = presignedUrlResponse.data.presigned_url;

        const zipFileStream = fs.createReadStream(zipPath);
        await axios.put(presignedUrl, zipFileStream, {
            headers: {
                'X-API-AUTH': process.env.AUTH_TOKEN,
                'Content-Type': 'application/zip',
            }
        });

        await axios.put(`${API_ENDPOINT}/clone`, { label }, { headers });

        res.json({ status: 'success', message: 'Cloning and uploading completed successfully' });
    } catch (error) {
        console.error("Error in clone process:", error);
        res.status(500).json({ error: error.message });
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        fs.rmSync(`${tempDir}.zip`, { force: true });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
