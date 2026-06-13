// Comment out imports until files are available
// import skillAssessment from './skillAssessment.js';
// import generateCourseSyllabus from './courseSyllabus.js';
// console.log('SkillAssessment imported:', skillAssessment);
// console.log('generateCourseSyllabus imported:', typeof generateCourseSyllabus);

// Import JobBoardIntegration
import { JobBoardIntegration } from './jobIntegration.js';
// Import skillAssessment
import skillAssessment from './skillAssessment.js';
import generateCourseSyllabus from './courseSyllabus.js';

// Utility functions
function showNotification(message, type = 'info') {
    const uploadStatus = document.getElementById('uploadStatus');
    if (!uploadStatus) return;
    
    uploadStatus.className = `upload-status ${type}`;
    uploadStatus.innerHTML = `
        <div class="upload-status-content">
            ${getStatusIcon(type)}
            <span>${message}</span>
        </div>
    `;
    uploadStatus.classList.remove('hidden');
}

function getStatusIcon(type) {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle"></i>';
        case 'error':
            return '<i class="fas fa-exclamation-circle"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle"></i>';
        case 'loading':
            return '<i class="fas fa-spinner fa-spin"></i>';
        default:
            return '<i class="fas fa-info-circle"></i>';
    }
}

// History related functions
function closeModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.style.display = 'flex';
        updateHistoryList();
    }
}

function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    // Clear existing list
    historyList.innerHTML = '';

    // Get history from localStorage
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');

    if (history.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-history';
        emptyMessage.textContent = 'No chat history available';
        historyList.appendChild(emptyMessage);
            return;
        }

    // Create list items for each history entry
    history.reverse().forEach((entry, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const timestamp = new Date(entry.timestamp);
        const formattedDate = timestamp.toLocaleDateString();
        const formattedTime = timestamp.toLocaleTimeString();

        historyItem.innerHTML = `
            <div class="history-item-header">
                <span class="history-date">${formattedDate} ${formattedTime}</span>
                <button class="delete-history" data-index="${history.length - 1 - index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="history-messages">
                <div class="history-user-message">${entry.userMessage}</div>
                <div class="history-ai-response">${entry.aiResponse}</div>
            </div>
        `;

        // Add delete functionality
        const deleteButton = historyItem.querySelector('.delete-history');
        deleteButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(deleteButton.dataset.index);
            deleteHistoryItem(index);
        });

        historyList.appendChild(historyItem);
    });
}

function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('chatHistory', JSON.stringify(history));
    updateHistoryList();
}

function saveChatToHistory(userMessage, aiResponse) {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.push({
        timestamp: new Date().toISOString(),
        userMessage,
        aiResponse
    });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

// Job board functionality
const jobBoard = {
    searchJobs: async (skills, role) => {
        // Mock job data - in a real app this would call an API
        return [
            {
                title: role,
                company: "Example Corp",
                location: "Remote",
                type: "Full-time",
                description: "Great opportunity for a " + role,
                url: "https://www.linkedin.com/jobs/search/?keywords=" + encodeURIComponent(role)
            }
        ];
    },
    getJobBoardLinks: (role, skills) => {
        const searchQuery = encodeURIComponent(`${role} ${skills.join(' ')}`);
        return {
            'LinkedIn': `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`,
            'Indeed': `https://www.indeed.com/jobs?q=${searchQuery}`,
            'Glassdoor': `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${searchQuery}`
        };
    }
};

// Progress tracking functionality
const progressTracker = {
    getProgress: (skill) => {
        try {
            const progress = JSON.parse(localStorage.getItem('skillProgress') || '{}');
            return progress[skill] || {};
        } catch (error) {
            console.error('Error getting progress:', error);
            return {};
        }
    },

    updateProgress: (skill, topic, completed) => {
        try {
            const progress = JSON.parse(localStorage.getItem('skillProgress') || '{}');
            if (!progress[skill]) {
                progress[skill] = {};
            }
            progress[skill][topic] = completed;
            localStorage.setItem('skillProgress', JSON.stringify(progress));
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }
};

// Skills handling
function addSkillTag(skill) {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `
        <span>${skill}</span>
        <button class="remove-skill" onclick="removeSkillTag(this)" aria-label="Remove skill" style="background:#f3f4f6;border:none;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;margin-left:8px;cursor:pointer;transition:background 0.2s;">
            <span style="font-size:18px;line-height:1;color:#374151;">&times;</span>
        </button>
    `;
    skillsContainer.appendChild(tag);
}

function removeSkillTag(button) {
    button.parentElement.remove();
}

function getSkillsFromTags() {
    const tags = document.querySelectorAll('.skill-tag span');
    return Array.from(tags).map(tag => tag.textContent.trim());
}

// File upload feedback
function handleFileUpload(file) {
    const uploadStatus = document.getElementById('uploadStatus');
    const extractBtn = document.getElementById('extractBtn');
    
    if (!file) {
        if (extractBtn) {
            extractBtn.disabled = true;
            extractBtn.classList.add('opacity-50');
        }
        if (uploadStatus) {
            uploadStatus.innerHTML = '';
            uploadStatus.classList.add('hidden');
        }
        return;
    }

    if (file.type !== 'application/pdf') {
        showNotification('Please select a PDF file', 'error');
        if (extractBtn) {
            extractBtn.disabled = true;
            extractBtn.classList.add('opacity-50');
        }
        return;
    }

    // Show file selected notification
    showNotification(`File selected: ${file.name}`, 'success');
    
    // Enable extract button and make it prominent
    if (extractBtn) {
        extractBtn.disabled = false;
        extractBtn.classList.remove('opacity-50');
        extractBtn.classList.add('animate-pulse');
        setTimeout(() => extractBtn.classList.remove('animate-pulse'), 2000);
    }
}

// Store the last career paths from the model for comparison
let lastCareerPaths = null;

// Update renderCareerPathsFromAPI to store the latest data
function renderCareerPathsFromAPI(careerPaths) {
    lastCareerPaths = careerPaths; // Store for compare modal
    const container = document.getElementById('careerPaths');
    const title = document.getElementById('careerPathsTitle');
    if (!container) return;
    if (title) title.textContent = careerPaths?.title || 'Career Paths';
    if (!careerPaths?.paths?.length) {
        container.innerHTML = '<div class="text-gray-500">No career paths found.</div>';
        return;
    }
    container.innerHTML = careerPaths.paths.map(path => `
        <div class="card p-4 space-y-3">
            <h4 class="text-xl font-semibold">${path.role}</h4>
            <p class="text-gray-600">${path.description}</p>
            <div class="flex justify-between items-center">
                <span class="badge badge-blue">Salary: ${path.salary || 'N/A'}</span>
                <span class="badge badge-green">Demand: ${path.demand || 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

function renderLearningPathFromAPI(learningPath) {
    const container = document.getElementById('learningPath');
    const title = document.getElementById('learningPathTitle');
    if (!container) return;
    if (title) title.textContent = learningPath?.title || 'Learning Path';
    if (!learningPath?.steps?.length) {
        container.innerHTML = '<div class="text-gray-500">No learning path found.</div>';
        return;
    }
    // Default skills to supplement if needed
    const defaultSkills = {
        Beginner: ['Python basics', 'Data analysis fundamentals', 'Excel for data'],
        Intermediate: ['Machine Learning algorithms', 'Data visualization techniques', 'SQL for analytics'],
        Advanced: ['Advanced Data Science methods', 'Big Data processing', 'Deep Learning']
    };
    // Render each phase with topics and checkboxes
    container.innerHTML = learningPath.steps.map(step => {
        const skill = step.phase;
        let topics = step.topics.slice();
        // Supplement with defaults if less than 3
        if (topics.length < 3 && defaultSkills[skill]) {
            topics = topics.concat(defaultSkills[skill].filter(t => !topics.includes(t)));
            topics = topics.slice(0, 3);
        }
        const progress = progressTracker.getProgress(skill);
        const total = topics.length;
        const completed = topics.filter(topic => progress[topic]).length;
        const percent = total ? Math.round((completed / total) * 100) : 0;
        return `
            <div class="card p-4 mb-4">
                <h4 class="text-lg font-semibold mb-2">${step.phase}</h4>
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-full bg-gray-200 rounded h-2">
                        <div class="bg-green-500 h-2 rounded" style="width:${percent}%; transition:width 0.3s;"></div>
            </div>
                    <span class="text-xs text-gray-600">${percent}%</span>
                </div>
                <div class="flex flex-wrap gap-2 mt-2">
                    ${topics.map(topic => `
                        <label class="flex items-center gap-2">
                            <input type="checkbox" class="learning-progress" data-skill="${skill}" data-topic="${topic}" ${progress[topic] ? 'checked' : ''} />
                            <span>${topic}</span>
                        </label>
                    `).join('')}
                </div>
        </div>
    `;
    }).join('');
    // Add event listeners for checkboxes
    container.querySelectorAll('.learning-progress').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const skill = e.target.getAttribute('data-skill');
            const topic = e.target.getAttribute('data-topic');
            progressTracker.updateProgress(skill, topic, e.target.checked);
            renderLearningPathFromAPI(learningPath); // re-render to update progress bar
        });
    });
}

function renderProjectsFromAPI(projects) {
    const container = document.getElementById('projects');
    const title = document.getElementById('projectsTitle');
    if (!container) return;
    if (title) title.textContent = projects?.title || 'Projects';
    if (!projects?.list?.length) {
        container.innerHTML = '<div class="text-gray-500">No projects found.</div>';
        return;
    }
    // Get project progress from localStorage
    const projectProgress = JSON.parse(localStorage.getItem('projectProgress') || '{}');
    const total = projects.list.length;
    const completed = projects.list.filter(p => projectProgress[p.name]).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    container.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            <div class="w-full bg-gray-200 rounded h-2">
                <div class="bg-green-500 h-2 rounded" style="width:${percent}%; transition:width 0.3s;"></div>
            </div>
            <span class="text-xs text-gray-600">${percent}%</span>
        </div>
        ${projects.list.map(project => `
            <div class="card p-4 mb-2 flex items-center justify-between">
                <div>
                    <h4 class="text-lg font-semibold">${project.name}</h4>
                    <p class="text-gray-600 mt-2">${project.description}</p>
                    <div class="flex flex-wrap gap-2 mt-3">
                        ${project.skills.map(skill => `<span class="badge badge-blue">${skill}</span>`).join('')}
                    </div>
                    <span class="badge badge-purple mt-2">${project.difficulty || ''}</span>
                </div>
                <div>
                    <input type="checkbox" class="project-progress" data-project="${project.name}" ${projectProgress[project.name] ? 'checked' : ''} />
                </div>
            </div>
        `).join('')}
    `;
    // Add event listeners for project checkboxes
    container.querySelectorAll('.project-progress').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const name = e.target.getAttribute('data-project');
            const progress = JSON.parse(localStorage.getItem('projectProgress') || '{}');
            progress[name] = e.target.checked;
            localStorage.setItem('projectProgress', JSON.stringify(progress));
            renderProjectsFromAPI(projects); // re-render to update progress bar
        });
    });
}

function renderResourcesFromAPI(resources) {
    const coursesContainer = document.getElementById('courses');
    const toolsContainer = document.getElementById('tools');
    const title = document.getElementById('resourcesTitle');
    if (title) title.textContent = resources?.title || 'Resources';
    if (coursesContainer) {
        if (!resources?.courses?.length) {
            coursesContainer.innerHTML = '<div class="text-gray-500">No courses found.</div>';
        } else {
            coursesContainer.innerHTML = resources.courses.map(course => {
                // Determine course link
                let courseUrl = course.url;
                if (!courseUrl && course.platform && course.name) {
                    // Fallback: search for course on platform
                    const search = encodeURIComponent(course.name);
                    if (course.platform.toLowerCase().includes('coursera')) {
                        courseUrl = `https://www.coursera.org/search?query=${search}`;
                    } else if (course.platform.toLowerCase().includes('udemy')) {
                        courseUrl = `https://www.udemy.com/courses/search/?q=${search}`;
                    } else if (course.platform.toLowerCase().includes('edx')) {
                        courseUrl = `https://www.edx.org/search?q=${search}`;
                    } else {
                        courseUrl = '#';
                    }
                }
                return `
                    <div class="card p-4 flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <div>
                            <h4 class="text-lg font-semibold">
                                <a href="${courseUrl || '#'}" target="_blank" rel="noopener" class="hover:underline">${course.name}</a>
                            </h4>
                            <a href="${courseUrl || '#'}" target="_blank" rel="noopener" class="badge badge-blue inline-block mt-1">${course.platform}</a>
                        </div>
                        <span class="badge badge-purple">${course.duration}</span>
                        </div>
                `;
            }).join('');
        }
    }
    if (toolsContainer) {
        if (!resources?.tools?.length) {
            toolsContainer.innerHTML = '';
        } else {
            toolsContainer.innerHTML = `
                <div class="mt-4">
                    <h5 class="font-semibold mb-2">Tools</h5>
                    <div class="flex flex-wrap gap-2">
                        ${resources.tools.map(tool => `<span class="badge badge-green">${tool}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    }
}

// Render functions for API response
function renderJobSearchSection(skills, goals) {
    const jobSection = document.getElementById('jobSearchSection');
    if (!jobSection) return;
    const jobBoard = new JobBoardIntegration();
    const role = goals.split(' ')[0] || 'Developer';
    const jobLinks = jobBoard.getJobBoardLinks(role, skills);
    const sampleJobs = jobBoard.getSampleJobs(`${role} ${skills.join(' ')}`);

    // Render job board links
    let linksHtml = `<div class="flex gap-4 mb-4">
        <a href="${jobLinks.linkedin}" target="_blank" class="btn btn-secondary">LinkedIn Jobs</a>
        <a href="${jobLinks.indeed}" target="_blank" class="btn btn-secondary">Indeed Jobs</a>
        <a href="${jobLinks.glassdoor}" target="_blank" class="btn btn-secondary">Glassdoor Jobs</a>
    </div>`;

    // Render sample jobs
    let jobsHtml = '<div class="grid gap-4">';
    for (const job of sampleJobs) {
        jobsHtml += `<div class="card p-4">
            <h4 class="text-lg font-semibold">${job.title}</h4>
            <div class="text-gray-600 mb-2">${job.company} &mdash; ${job.location} (${job.type})</div>
            <p class="mb-2">${job.description}</p>
            <a href="${job.url}" target="_blank" class="btn btn-primary">View Job</a>
        </div>`;
    }
    jobsHtml += '</div>';

    jobSection.innerHTML = `
        <h3 class="text-xl font-semibold mb-2"><i class="fas fa-briefcase mr-2"></i>Job Search</h3>
        ${linksHtml}
        <h4 class="text-lg font-semibold mb-2">Sample Jobs</h4>
        ${jobsHtml}
    `;
}

// Skill Assessment Modal Logic
function openAssessmentModal(skills) {
    const modal = document.getElementById('assessmentModal');
    const content = document.getElementById('assessmentContent');
    if (!modal || !content) return;
    // Generate questions from skills
    const { questions, totalQuestions } = skillAssessment.startAssessment(skills);
    if (!questions.length) {
        content.innerHTML = '<div class="text-red-600">No assessment available for your skills.</div>';
        modal.style.display = 'flex';
        return;
    }
    let userAnswers = Array(questions.length).fill(null);
    let current = 0;

    function renderQuestion(idx) {
        const q = questions[idx];
        content.innerHTML = `
            <div class="mb-4">
                <div class="font-semibold mb-2">Question ${idx + 1} of ${questions.length}</div>
                <div class="mb-3">${q.question}</div>
                <div class="space-y-2">
                    ${q.options.map((opt, i) => `
                        <label class="block">
                            <input type="radio" name="option" value="${i}" ${userAnswers[idx] === i ? 'checked' : ''} />
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="flex justify-between mt-4">
                <button class="btn btn-secondary" id="prevQ" ${idx === 0 ? 'disabled' : ''}>Previous</button>
                <button class="btn btn-secondary" id="nextQ" ${idx === questions.length - 1 ? 'disabled' : ''}>Next</button>
                <button class="btn btn-primary" id="submitAssessment" ${userAnswers.includes(null) ? 'disabled' : ''}>Submit</button>
            </div>
        `;
        // Option change
        content.querySelectorAll('input[name="option"]').forEach(input => {
            input.addEventListener('change', e => {
                userAnswers[idx] = parseInt(e.target.value);
                renderQuestion(idx); // re-render to enable submit if all answered
            });
        });
        // Navigation
        content.querySelector('#prevQ')?.addEventListener('click', () => {
            if (idx > 0) renderQuestion(idx - 1);
        });
        content.querySelector('#nextQ')?.addEventListener('click', () => {
            if (idx < questions.length - 1) renderQuestion(idx + 1);
        });
        // Submit
        content.querySelector('#submitAssessment')?.addEventListener('click', () => {
            const score = skillAssessment.calculateScore(userAnswers, questions);
            const level = skillAssessment.getSkillLevel(score);
            content.innerHTML = `
                <div class="text-center">
                    <div class="text-2xl font-bold mb-2">Your Score: ${score.toFixed(1)}%</div>
                    <div class="text-xl mb-4">Skill Level: <span class="badge badge-green">${level}</span></div>
                    <button class="btn btn-primary mt-4" id="closeAssessment">Close</button>
                </div>
            `;
            content.querySelector('#closeAssessment').addEventListener('click', () => {
                modal.style.display = 'none';
            });
        });
    }
    renderQuestion(current);
    modal.style.display = 'flex';
}

// Salary Insights Chart
function renderSalaryInsights(careerPaths) {
    const ctx = document.getElementById('salaryComparison');
    if (!ctx || !careerPaths?.paths?.length) return;
    // Extract roles and salary ranges
    const roles = [];
    const salaries = [];
    careerPaths.paths.forEach(path => {
        roles.push(path.role);
        // Parse salary string (e.g., "$80,000 - $150,000")
        let avg = 0;
        if (path.salary) {
            const match = path.salary.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
            if (match) {
                const min = parseInt(match[1].replace(/,/g, ''));
                const max = parseInt(match[2].replace(/,/g, ''));
                avg = Math.round((min + max) / 2);
            } else {
                // Try to parse a single value
                const single = path.salary.match(/\$([\d,]+)/);
                if (single) avg = parseInt(single[1].replace(/,/g, ''));
            }
        }
        salaries.push(avg);
    });
        // Destroy previous chart if exists
        if (window.salaryChartInstance) {
            window.salaryChartInstance.destroy();
        }
        window.salaryChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: roles,
                datasets: [{
                label: 'Average Salary (USD)',
                data: salaries,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                legend: { display: false },
                tooltip: { callbacks: {
                    label: ctx => `$${ctx.parsed.y.toLocaleString()}`
                }}
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                        callback: value => `$${value.toLocaleString()}`
                    }
                }
                }
            }
        });
    }

// Form handling
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const skills = [...new Set([
        ...document.getElementById('skills').value.split(',').map(s => s.trim()),
        ...getSkillsFromTags()
    ])].filter(Boolean);
    const goals = document.getElementById('goals').value;
    
    if (!skills.length) {
        showNotification('Please enter your skills or upload a LinkedIn PDF', 'error');
        return;
    }
    if (!goals.trim()) {
        showNotification('Please enter your career goals', 'error');
        return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    const output = document.getElementById('output');
    
    try {
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
        const response = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: skills.join(', '), goals })
        });
        const result = await response.json();
        if (!result.success || !result.advice) {
            throw new Error(result.error || 'Failed to get advice');
        }
        const advice = result.advice;
        const summary = document.getElementById('summary');
        if (summary) {
            summary.innerHTML = `<p style="font-size:1.15rem;line-height:1.7;font-weight:400;">${advice.summary || ''}</p>`;
        }
        renderCareerPathsFromAPI(advice.careerPaths);
        renderLearningPathFromAPI(advice.learningPath);
        renderProjectsFromAPI(advice.projects);
        renderResourcesFromAPI(advice.resources);
        // Render job search section
        renderJobSearchSection(skills, goals);
        // Render salary insights
        renderSalaryInsights(advice.careerPaths);
        saveChatToHistory(
            `Skills: ${skills.join(', ')}\nGoals: ${goals}`,
            advice.summary || 'Career advice analysis completed.'
        );
        if (output) {
            output.classList.remove('hidden');
            output.classList.add('active');
        }
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = 'none'; // Force hide
            console.log('Loading overlay hidden (try block)');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'An error occurred while processing your request', 'error');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = 'none'; // Force hide
            console.log('Loading overlay hidden');
        }
    } finally {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = 'none'; // Force hide
            console.log('Loading overlay hidden');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize event listeners and UI elements
    const fileInput = document.getElementById('linkedinPdf');
    const extractBtn = document.getElementById('extractBtn');
    const historyBtn = document.getElementById('historyBtn');
    const skillsInput = document.getElementById('skills');
    const advisorForm = document.getElementById('advisorForm');
    const assessmentBtn = document.getElementById('assessmentBtn');
    const fileNameSpan = document.getElementById('fileName');
    const downloadCourseBtn = document.getElementById('downloadCourseBtn');

    // Skills input handler
    if (skillsInput) {
        skillsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
                skills.forEach(addSkillTag);
                skillsInput.value = '';
            }
        });
    }

    // Form submit handler
    if (advisorForm) {
        advisorForm.addEventListener('submit', handleFormSubmit);
    }

    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            handleFileUpload(file);
        });

        // Add drag and drop support
        const dropZone = document.querySelector('.file-input-wrapper');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('border-blue-500', 'border-2');
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-blue-500', 'border-2');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-blue-500', 'border-2');
                const file = e.dataTransfer.files[0];
                if (file) {
                    fileInput.files = e.dataTransfer.files;
                    handleFileUpload(file);
                }
            });
        }

        // Custom file input: show file name
        if (fileInput && fileNameSpan) {
            fileInput.addEventListener('change', function() {
                const name = this.files[0] ? this.files[0].name : 'No file chosen';
                fileNameSpan.textContent = name;
            });
        }
    }

    // Extract button click handler
    if (extractBtn) {
        // Initially disable the extract button
        extractBtn.disabled = true;
        extractBtn.classList.add('opacity-50');

        extractBtn.addEventListener('click', async () => {
            const file = fileInput?.files?.[0];
            if (!file) {
                showNotification('Please select a PDF file first', 'error');
                return;
            }
            
            try {
                extractBtn.disabled = true;
                extractBtn.classList.add('opacity-50');
                extractBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extracting...';
                showNotification('Extracting skills from PDF...', 'loading');

                // --- Real PDF extraction integration ---
                const formData = new FormData();
                formData.append('pdf', file);
                const response = await fetch('/api/extract-pdf', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success && Array.isArray(result.skills) && result.skills.length > 0) {
                    result.skills.forEach(addSkillTag);
                    showNotification('Skills extracted successfully! Click "Get Advice" to continue', 'success');
            } else {
                    showNotification(result.error || 'No skills found in PDF.', 'error');
                }

                // Scroll to the Get Advice button
                const getAdviceBtn = document.querySelector('#advisorForm button[type="submit"]');
                if (getAdviceBtn) {
                    getAdviceBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    getAdviceBtn.classList.add('animate-pulse');
                    setTimeout(() => getAdviceBtn.classList.remove('animate-pulse'), 2000);
                }
            } catch (error) {
                showNotification('Failed to extract skills', 'error');
            } finally {
                extractBtn.disabled = false;
                extractBtn.classList.remove('opacity-50');
                extractBtn.innerHTML = '<i class="fas fa-file-import"></i> Extract Skills';
            }
        });
    }

    // Assessment button click handler
    if (assessmentBtn) {
        assessmentBtn.addEventListener('click', () => {
            const skills = [...new Set([
                ...document.getElementById('skills').value.split(',').map(s => s.trim()),
                ...getSkillsFromTags()
            ])].filter(Boolean);
            if (!skills.length) {
                showNotification('Please enter your skills or upload a LinkedIn PDF', 'error');
                return;
            }
            openAssessmentModal(skills);
        });
    }

    // History button click handler
    if (historyBtn) {
        historyBtn.addEventListener('click', openModal);
    }

    // Close modal on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('historyModal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // Initialize dark mode
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const isDark = document.body.classList.contains('dark');
            darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // Initialize output section
    const output = document.getElementById('output');
    if (output) {
        output.classList.add('hidden');
    }

    // Download Course button click handler
    if (downloadCourseBtn) {
        downloadCourseBtn.addEventListener('click', generateCourseSyllabus);
    }
});

// Make necessary functions available globally
window.closeModal = closeModal;
window.openModal = openModal;
window.deleteHistoryItem = deleteHistoryItem;
window.saveChatToHistory = saveChatToHistory;
window.showNotification = showNotification;
window.updateHistoryList = updateHistoryList;
window.removeSkillTag = removeSkillTag;

// Export to PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const output = document.getElementById('output');
    if (!output) {
        showNotification('No results to export.', 'error');
        return;
    }
    html2canvas(output).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = pageWidth;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save('career_advice.pdf');
    });
}

// Share Results (basic: copy link or show modal)
function shareResults() {
    const shareUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('Shareable link copied to clipboard!', 'success');
        }, () => {
            // Fallback if clipboard API fails
            fallbackCopyToClipboard(shareUrl);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(shareUrl);
    }
}

function fallbackCopyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        success = false;
    }
    document.body.removeChild(tempInput);
    if (success) {
        showNotification('Shareable link copied to clipboard!', 'success');
    } else {
        showNotification('Failed to copy link.', 'error');
    }
}

// Compare Career Paths (show modal with table)
function compareCareerPaths() {
    if (!lastCareerPaths || !lastCareerPaths.paths || lastCareerPaths.paths.length === 0) {
        showNotification('No career paths to compare. Please generate results first.', 'error');
                return;
            }
    // Create modal if not present
    let modal = document.getElementById('compareModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'compareModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
          <div class="modal-content" style="background:#fff; border-radius:10px; padding:2rem; min-width:350px; max-width:90vw; position:relative;">
            <button class="close-modal-btn" onclick="closeCompareModal()" aria-label="Close" style="position:absolute;top:10px;right:10px;background:#f3f4f6;border:none;border-radius:50%;width:32px;height:32px;font-size:22px;cursor:pointer;">&times;</button>
            <h2 class="text-xl font-bold mb-4">Compare Career Paths</h2>
            <div id="compareContent"></div>
          </div>
        `;
        document.body.appendChild(modal);
    }
    // Build comparison table
    const paths = lastCareerPaths.paths;
    let html = `
      <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px;">Title</th>
            <th style="padding:8px;">Salary</th>
            <th style="padding:8px;">Demand</th>
            <th style="padding:8px;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${paths.map(path => `
            <tr>
              <td style="padding:8px; font-weight:600;">${path.role}</td>
              <td style="padding:8px;">${path.salary || 'N/A'}</td>
              <td style="padding:8px;">${path.demand || 'N/A'}</td>
              <td style="padding:8px;">${path.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </div>
    `;
    document.getElementById('compareContent').innerHTML = html;
    modal.style.display = 'flex';
}

function closeCompareModal() {
    const modal = document.getElementById('compareModal');
    if (modal) modal.style.display = 'none';
}

// Make these functions available globally
window.exportToPDF = exportToPDF;
window.shareResults = shareResults;
window.compareCareerPaths = compareCareerPaths;
window.closeCompareModal = closeCompareModal;

shareResults();
compareCareerPaths();