require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const puppeteer = require('puppeteer');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

console.log('Server initialized');

// Verify OpenAI API key
if (!process.env.OPENAI_API_KEY) {
    console.error('WARNING: OPENAI_API_KEY is not set in .env file');
}

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ status: 'Server is working' });
});

// Main endpoint
app.post('/api/analyze', async (req, res) => {
    console.log('Analyze endpoint called');
    console.log('Request body:', req.body);

    const { skills, goals } = req.body;

    if (!skills || !goals) {
        return res.json({
            success: false,
            error: 'Please provide both skills and goals'
        });
    }

    try {
        // Use OpenAI to generate personalized advice
        const prompt = `You are a professional career advisor. Given the following skills: ${skills} and career goals: ${goals}, provide a highly detailed, encouraging, and actionable paragraph of career advice in the summary. Reference the user's specific skills, suggest advanced or emerging skills to learn, and provide clear next steps for growth. The advice should be friendly, supportive, and tailored to the user's background. Do not use headings or bold text. Then, provide the rest of the information in the following strict JSON format (no explanation, no markdown, just JSON): {\n  \"summary\": string,\n  \"careerPaths\": {\n    \"title\": string,\n    \"paths\": [{\n      \"role\": string,\n      \"description\": string,\n      \"salary\": string,\n      \"demand\": string\n    }]\n  },\n  \"projects\": {\n    \"title\": string,\n    \"list\": [{\n      \"name\": string,\n      \"description\": string,\n      \"skills\": [string],\n      \"difficulty\": string\n    }]\n  },\n  \"learningPath\": {\n    \"title\": string,\n    \"steps\": [{\n      \"phase\": string,\n      \"topics\": [string]\n    }]\n  },\n  \"resources\": {\n    \"title\": string,\n    \"courses\": [{\n      \"name\": string,\n      \"platform\": string,\n      \"duration\": string\n    }],\n    \"tools\": [string]\n  }\n}`;
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful career advisor assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 900
        });
        // Try to parse the response as JSON
        let advice;
        try {
            advice = JSON.parse(completion.choices[0].message.content);
        } catch (e) {
            // If not valid JSON, return as plain text in summary
            advice = { summary: completion.choices[0].message.content };
        }
        // Fill in missing fields with defaults
        advice.summary = advice.summary || 'No summary available.';
        advice.careerPaths = advice.careerPaths || { title: 'Career Paths', paths: [] };
        advice.projects = advice.projects || { title: 'Projects', list: [] };
        advice.learningPath = advice.learningPath || { title: 'Learning Path', steps: [] };
        advice.resources = advice.resources || { title: 'Resources', courses: [], tools: [] };

        // Fetch similar jobs and add to careerPaths for comparison
        const mainRole = advice.careerPaths.paths[0]?.role;
        if (mainRole) {
            try {
                const similarJobsRes = await fetch(`http://localhost:${port}/api/similar-jobs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ careerPath: mainRole })
                });
                const similarJobsData = await similarJobsRes.json();
                if (similarJobsData.success && Array.isArray(similarJobsData.jobs)) {
                    for (const jobTitle of similarJobsData.jobs) {
                        if (!advice.careerPaths.paths.some(p => p.role === jobTitle)) {
                            // Ask the model for the salary range for this job
                            const salaryPrompt = `What is the average salary range for a ${jobTitle} in the United States? Respond with only the salary range in the format "$min - $max".`;
                            let salary = 'N/A';
                            try {
                                const salaryRes = await openai.chat.completions.create({
                                    model: 'gpt-3.5-turbo',
                                    messages: [
                                        { role: 'system', content: 'You are a helpful career advisor assistant.' },
                                        { role: 'user', content: salaryPrompt }
                                    ],
                                    max_tokens: 30
                                });
                                salary = salaryRes.choices[0].message.content.trim();
                            } catch (e) {}
                            // Ask the model for a one-sentence description
                            const descPrompt = `In one sentence, describe what a ${jobTitle} does.`;
                            let description = `A related career path to ${mainRole}.`;
                            try {
                                const descRes = await openai.chat.completions.create({
                                    model: 'gpt-3.5-turbo',
                                    messages: [
                                        { role: 'system', content: 'You are a helpful career advisor assistant.' },
                                        { role: 'user', content: descPrompt }
                                    ],
                                    max_tokens: 50
                                });
                                description = descRes.choices[0].message.content.trim();
                            } catch (e) {}
                            // Ask the model for a one-sentence demand
                            const demandPrompt = `In one sentence, describe the current job market demand for a ${jobTitle} in the United States.`;
                            let demand = 'N/A';
                            try {
                                const demandRes = await openai.chat.completions.create({
                                    model: 'gpt-3.5-turbo',
                                    messages: [
                                        { role: 'system', content: 'You are a helpful career advisor assistant.' },
                                        { role: 'user', content: demandPrompt }
                                    ],
                                    max_tokens: 50
                                });
                                demand = demandRes.choices[0].message.content.trim();
                            } catch (e) {}
                            advice.careerPaths.paths.push({
                                role: jobTitle,
                                description,
                                salary,
                                demand
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching similar jobs:', err);
            }
        }

        res.json({ success: true, advice });
    } catch (error) {
        console.error('Error:', error);
        res.json({
            success: false,
            error: 'An error occurred while generating advice'
        });
    }
});

// Endpoint to get similar/related jobs using OpenAI
app.post('/api/similar-jobs', async (req, res) => {
    const { careerPath } = req.body;
    if (!careerPath) {
        return res.json({ success: false, error: 'No career path provided' });
    }
    try {
        const prompt = `List 5 job titles that are similar or related to the career path: ${careerPath}. Return only a JSON array of job titles, no explanation, no markdown.`;
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful career advisor assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 150
        });
        let jobs = [];
        let content = completion.choices[0].message.content.trim();
        // Remove markdown and extract JSON array
        if (content.startsWith('```')) {
            content = content.replace(/```[a-zA-Z]*|```/g, '').trim();
        }
        // Try to parse as JSON array
        try {
            jobs = JSON.parse(content);
        } catch (e) {
            // fallback: extract items between [ and ]
            const arrMatch = content.match(/\[(.*)\]/s);
            if (arrMatch) {
                try {
                    jobs = JSON.parse('[' + arrMatch[1] + ']');
                } catch {
                    jobs = arrMatch[1].split(',').map(j => j.replace(/['"\]]/g, '').trim()).filter(j => j.length > 0);
                }
            } else {
                // fallback: split by newlines or commas
                jobs = content.split(/\n|,/).map(j => j.replace(/['"\]]/g, '').trim()).filter(j => j.length > 0);
            }
        }
        // Remove any empty or non-string items
        jobs = jobs.filter(j => typeof j === 'string' && j.length > 0);
        res.json({ success: true, jobs });
    } catch (error) {
        console.error('Error fetching similar jobs:', error);
        res.json({ success: false, error: 'Failed to fetch similar jobs' });
    }
});

// Endpoint to extract skills from a LinkedIn profile (for testing/demo only)
app.post('/api/linkedin-profile', async (req, res) => {
    const { url } = req.body;
    if (!url || !url.includes('linkedin.com/in/')) {
        return res.json({ success: false, error: 'Invalid LinkedIn profile URL.' });
    }
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // Wait for the skills section or fallback to main content
        await page.waitForTimeout(2000);
        // Try to extract skills from the profile page
        const skills = await page.evaluate(() => {
            // Try to find the skills section
            const skillElements = Array.from(document.querySelectorAll('span, li, div'));
            const skillSet = new Set();
            skillElements.forEach(el => {
                const text = el.textContent.trim();
                // Heuristic: skills are often short, not sentences, and not empty
                if (text && text.length < 40 && !text.includes('•') && !text.match(/\d+ (connections|followers)/i) && !text.match(/\b(Experience|Education|Activity|Interests|About|Contact|Message|Connect|Follow|See more|Show more|Recommendations|Endorsements|Skills|Top Skills|Languages|Licenses|Certifications|Projects|Volunteer|Accomplishments|Courses|Organizations|Interests|People also viewed|See all|Show all)\b/i)) {
                    skillSet.add(text);
                }
            });
            // Return top 10 unique skills
            return Array.from(skillSet).slice(0, 10);
        });
        await browser.close();
        if (skills && skills.length > 0) {
            res.json({ success: true, skills });
        } else {
            res.json({ success: false, error: 'No skills found.' });
        }
    } catch (error) {
        if (browser) await browser.close();
        console.error('LinkedIn scraping error:', error);
        res.json({ success: false, error: 'Failed to extract skills from LinkedIn profile.' });
    }
});

// Endpoint to extract skills from PDF
app.post('/api/extract-pdf', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);

        // Extract text content
        const text = data.text;

        // Common skill keywords to look for
        const skillKeywords = [
            'Skills', 'Technologies', 'Tools', 'Languages', 'Frameworks',
            'Platforms', 'Software', 'Technical Skills', 'Core Competencies'
        ];

        // Find skills section
        let skillsSection = '';
        for (const keyword of skillKeywords) {
            const index = text.indexOf(keyword);
            if (index !== -1) {
                // Extract text after the keyword until the next section
                skillsSection = text.substring(index);
                break;
            }
        }

        // Extract individual skills
        const skills = new Set();
        
        // Common skill patterns
        const skillPatterns = [
            /\b(Python|JavaScript|Java|SQL|React|Angular|Vue\.js|Node\.js|Express|MongoDB|MySQL|PostgreSQL|AWS|Azure|Docker|Kubernetes|Git|CI\/CD|HTML|CSS|PHP|Ruby|C\+\+|C#|Swift|Kotlin|TypeScript|Go|Rust|Scala|R|MATLAB|TensorFlow|PyTorch|Pandas|NumPy|Power BI|Tableau|Excel|Google Sheets|Looker|QlikView|SAP|Salesforce|JIRA|Confluence|Agile|Scrum)\b/g,
            /\b(Machine Learning|Deep Learning|Data Science|Artificial Intelligence|Natural Language Processing|Computer Vision|DevOps|Cloud Computing|Big Data|Data Analysis|Data Visualization|Business Intelligence|Project Management|Digital Marketing|UI\/UX Design|Product Management|Agile Development|Software Development|Web Development|Mobile Development)\b/g
        ];

        // Extract skills using patterns
        for (const pattern of skillPatterns) {
            const matches = skillsSection.match(pattern);
            if (matches) {
                matches.forEach(skill => skills.add(skill));
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            skills: Array.from(skills)
        });
    } catch (error) {
        console.error('Error processing PDF:', error);
        // Clean up uploaded file in case of error
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            error: 'Failed to process PDF file'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        error: 'An unexpected error occurred'
    });
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Server ready to accept requests');
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
}); 