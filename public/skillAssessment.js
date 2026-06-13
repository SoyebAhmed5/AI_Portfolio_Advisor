const skillAssessment = {
    questions: {
        python: [
            {
                question: "What is the output of: print(type([1, 2, 3]))?",
                options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'set'>"],
                correct: 0
            },
            {
                question: "Which of these is a Python package manager?",
                options: ["npm", "pip", "yarn", "gradle"],
                correct: 1
            }
        ],
        sql: [
            {
                question: "Which SQL command is used to retrieve data from a database?",
                options: ["GET", "FETCH", "SELECT", "RETRIEVE"],
                correct: 2
            },
            {
                question: "What is the purpose of GROUP BY in SQL?",
                options: [
                    "To sort the results",
                    "To filter the results",
                    "To group rows that have the same values",
                    "To join multiple tables"
                ],
                correct: 2
            }
        ],
        javascript: [
            {
                question: "What is the output of: typeof []?",
                options: ["'array'", "'object'", "'list'", "'undefined'"],
                correct: 1
            },
            {
                question: "Which method is used to add elements to the end of an array?",
                options: ["append()", "push()", "add()", "insert()"],
                correct: 1
            }
        ],
        html: [
            {
                question: "What does HTML stand for?",
                options: ["Hyper Trainer Marking Language", "Hyper Text Markup Language", "Hyper Text Marketing Language", "Hyper Text Markup Leveler"],
                correct: 1
            },
            {
                question: "Which tag is used for the largest heading?",
                options: ["<h6>", "<heading>", "<h1>", "<head>"],
                correct: 2
            }
        ],
        css: [
            {
                question: "Which property is used to change the text color in CSS?",
                options: ["font-color", "color", "text-color", "background-color"],
                correct: 1
            },
            {
                question: "What does CSS stand for?",
                options: ["Cascading Style Sheets", "Colorful Style Sheets", "Computer Style Sheets", "Creative Style Syntax"],
                correct: 0
            }
        ],
        java: [
            {
                question: "Which keyword is used to inherit a class in Java?",
                options: ["this", "super", "extends", "implements"],
                correct: 2
            },
            {
                question: "What is the default value of an int variable in Java?",
                options: ["0", "null", "undefined", "1"],
                correct: 0
            }
        ],
        cpp: [
            {
                question: "Which symbol is used to denote a preprocessor directive in C++?",
                options: ["@", "#", "$", "%"],
                correct: 1
            },
            {
                question: "What is the file extension for a C++ source file?",
                options: [".c", ".cpp", ".java", ".py"],
                correct: 1
            }
        ],
        excel: [
            {
                question: "Which symbol is used to start a formula in Excel?",
                options: ["=", "+", "-", "*"],
                correct: 0
            },
            {
                question: "Which function is used to calculate the average in Excel?",
                options: ["SUM()", "MEAN()", "AVERAGE()", "AVG()"],
                correct: 2
            }
        ],
        dataanalysis: [
            {
                question: "Which library is commonly used for data analysis in Python?",
                options: ["NumPy", "Pandas", "Matplotlib", "Seaborn"],
                correct: 1
            },
            {
                question: "What is the process of finding and correcting errors in data called?",
                options: ["Data Mining", "Data Cleaning", "Data Modeling", "Data Warehousing"],
                correct: 1
            }
        ],
        machinelearning: [
            {
                question: "Which algorithm is used for classification problems?",
                options: ["Linear Regression", "K-Means", "Logistic Regression", "PCA"],
                correct: 2
            },
            {
                question: "What is overfitting in machine learning?",
                options: ["Model fits training data too well and fails to generalize", "Model performs well on new data", "Model is too simple", "Model is not trained enough"],
                correct: 0
            }
        ],
        cloud: [
            {
                question: "Which of the following is a cloud computing platform?",
                options: ["AWS", "Linux", "Oracle", "Windows"],
                correct: 0
            },
            {
                question: "What does SaaS stand for?",
                options: ["Software as a Service", "Storage as a Service", "System as a Service", "Solution as a Service"],
                correct: 0
            }
        ],
        projectmanagement: [
            {
                question: "Which methodology uses sprints and daily standups?",
                options: ["Waterfall", "Agile", "Six Sigma", "Kanban"],
                correct: 1
            },
            {
                question: "What is a Gantt chart used for?",
                options: ["Budgeting", "Scheduling", "Risk Management", "Quality Control"],
                correct: 1
            }
        ],
        communication: [
            {
                question: "Which is an example of non-verbal communication?",
                options: ["Email", "Phone Call", "Body Language", "Text Message"],
                correct: 2
            },
            {
                question: "Active listening involves:",
                options: ["Interrupting frequently", "Giving full attention to the speaker", "Thinking about your response while listening", "Looking away"],
                correct: 1
            }
        ]
    },

    startAssessment: function(skills) {
        const questions = [];
        skills.forEach(skill => {
            const normalized = skill.toLowerCase().replace(/\s+/g, '');
            if (this.questions[normalized]) {
                questions.push(...this.questions[normalized]);
            }
        });
        
        return {
            questions: this.shuffleArray(questions),
            totalQuestions: questions.length
        };
    },

    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    calculateScore: function(answers, questions) {
        let correct = 0;
        answers.forEach((answer, index) => {
            if (answer === questions[index].correct) {
                correct++;
            }
        });
        return (correct / questions.length) * 100;
    },

    getSkillLevel: function(score) {
        if (score >= 90) return "Expert";
        if (score >= 70) return "Advanced";
        if (score >= 50) return "Intermediate";
        return "Beginner";
    }
};

export default skillAssessment; 