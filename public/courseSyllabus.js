// Course Syllabus PDF Generator
function generateCourseSyllabus() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // PDF Styling
    const titleFont = 16;
    const headingFont = 14;
    const subheadingFont = 12;
    const normalFont = 10;
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = 210;
    
    // Helper function to add text with proper positioning
    const addText = (text, fontSize, isBold = false, indent = 0) => {
        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(text, margin + indent, yPos, { maxWidth: pageWidth - (margin * 2) - indent });
        yPos += lineHeight;
    };
    
    // Title
    addText('AI-powered Portfolio Advisor - Udemy Course Syllabus', titleFont, true);
    yPos += lineHeight;

    // Course Title
    addText('Course Title: Build an AI Career Advisor: Full-Stack JavaScript Project', headingFont, true);
    yPos += lineHeight;

    // Prerequisites
    addText('Prerequisites:', subheadingFont, true);
    const prerequisites = [
        '- Basic JavaScript knowledge',
        '- Understanding of HTML/CSS',
        '- Familiarity with Node.js basics',
        '- Basic understanding of APIs'
    ];
    prerequisites.forEach(item => {
        addText(item, normalFont, false, 5);
    });
    yPos += lineHeight;

    // Course Duration
    addText('Course Duration: 6-7 hours', subheadingFont, true);
    yPos += lineHeight * 2;

    // Syllabus Sections
    addText('Detailed Syllabus', headingFont, true);
    yPos += lineHeight;

    // All sections in a single array for easier maintenance
    const allSections = [
        {
            title: 'Section 1: Introduction and Setup (30 mins)',
            topics: [
                'Course Overview',
                'Project Demo',
                'Setting up Development Environment',
                '- Node.js installation',
                '- Code editor setup',
                '- Required tools'
            ]
        },
        {
            title: 'Section 2: Project Foundation (45 mins)',
            topics: [
                'Project Structure Setup',
                'Installing Dependencies',
                'Basic Server Setup',
                'Frontend Structure',
                'Connecting Frontend to Backend'
            ]
        },
        {
            title: 'Section 3: Core Features - Part 1 (60 mins)',
            topics: [
                'Skills Input System',
                '- Autocomplete',
                '- Tag-based input',
                'Career Goals Input',
                'Form Handling',
                'Basic API Integration'
            ]
        },
        {
            title: 'Section 4: AI Integration (45 mins)',
            topics: [
                'OpenAI Setup',
                'Implementing Career Advice Generation',
                'Response Processing',
                'Error Handling'
            ]
        },
        {
            title: 'Section 5: Core Features - Part 2 (60 mins)',
            topics: [
                'Career Paths Display',
                'Learning Path Generation',
                'Project Recommendations',
                'Resource Suggestions'
            ]
        },
        {
            title: 'Section 6: Advanced Features - Part 1 (45 mins)',
            topics: [
                'Skills Assessment Quiz',
                'Progress Tracking',
                'History Management',
                'Local Storage Implementation'
            ]
        },
        {
            title: 'Section 7: Advanced Features - Part 2 (45 mins)',
            topics: [
                'Salary Visualization with Chart.js',
                'PDF Export Functionality',
                'Share Features',
                'Job Board Integration'
            ]
        },
        {
            title: 'Section 8: UI/UX Enhancement (45 mins)',
            topics: [
                'Responsive Design',
                'Dark Mode Implementation',
                'Loading States',
                'Animations and Transitions'
            ]
        },
        {
            title: 'Section 9: Testing and Deployment (30 mins)',
            topics: [
                'Error Handling',
                'Testing Procedures',
                'Deployment Process',
                'Maintenance Tips'
            ]
        },
        {
            title: 'Section 10: Course Conclusion (15 mins)',
            topics: [
                'Project Review',
                'Best Practices',
                'Further Improvements',
                'Next Steps'
            ]
        }
    ];

    // Add all sections
    allSections.forEach(section => {
        addText(section.title, subheadingFont, true);
        
        section.topics.forEach(topic => {
            addText(topic, normalFont, false, 5);
        });
        yPos += lineHeight;
    });

    // Add final page with additional information
    doc.addPage();
    yPos = 20;

    // Course Materials
    addText('Course Materials', headingFont, true);
    yPos += lineHeight;

    const materials = [
        '1. Source code for each section',
        '2. Configuration files',
        '3. Final project code',
        '4. README documentation',
        '5. Troubleshooting guide'
    ];
    materials.forEach(item => {
        addText(item, normalFont);
    });
    yPos += lineHeight;

    // Course Deliverables
    addText('Course Deliverables', headingFont, true);
    yPos += lineHeight;

    const deliverables = [
        '1. Video lectures',
        '2. Source code',
        '3. Project files',
        '4. Documentation',
        '5. Exercise files'
    ];
    deliverables.forEach(item => {
        addText(item, normalFont);
    });

    // Save the PDF
    doc.save('AI_Portfolio_Advisor_Course_Syllabus.pdf');
}

export default generateCourseSyllabus; 