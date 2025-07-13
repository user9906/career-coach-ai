document.getElementById('cv-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const linkedin = document.getElementById('linkedin').value;
    const education = document.getElementById('education').value;
    const experience = document.getElementById('experience').value;
    const projects = document.getElementById('projects').value;
    const skills = document.getElementById('skills').value;
    const certs = document.getElementById('certs').value;
    const certImagesInput = document.getElementById('cert-images');
    const certImages = certImagesInput.files;

    let cvHtml = `<div class="cv-professional">
        <div class="cv-header">
            <h2>${name}</h2>
            <div class="cv-contact">
                <span>${email}</span> | <span>${phone}</span>${linkedin ? ` | <a href="${linkedin}" target="_blank">LinkedIn</a>` : ''}
            </div>
        </div>
        <div class="cv-section">
            <h3>Education</h3>
            <p>${education.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="cv-section">
            <h3>Experience</h3>
            <p>${experience.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="cv-section">
            <h3>Projects</h3>
            <p>${projects.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="cv-section">
            <h3>Skills</h3>
            <p>${skills.replace(/\n/g, ', ')}</p>
        </div>`;
    if (certs) {
        cvHtml += `<div class="cv-section"><h3>Certifications</h3><p>${certs.replace(/\n/g, '<br>')}</p></div>`;
    }
    if (certImages && certImages.length > 0) {
        cvHtml += `<div class="cv-section"><h4>Certification Images</h4><div class="cert-images-list">`;
        Array.from(certImages).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.className = 'cert-image';
                document.querySelector('.cv-professional .cert-images-list').appendChild(img);
            };
            reader.readAsDataURL(file);
        });
        cvHtml += `</div></div>`;
    }
    cvHtml += `</div>`;
    document.getElementById('cv-preview').innerHTML = cvHtml + `<button id='download-cv' class='download-btn'>Download CV (PDF)</button>`;

    // Download as PDF using html2pdf.js
    document.getElementById('download-cv').onclick = function() {
        const element = document.querySelector('.cv-professional');
        html2pdf().set({
            margin: 0.5,
            filename: `${name.replace(/\s+/g, '_')}_CV.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        }).from(element).save();
    };

    // After generating the CV preview, show loading for AI feedback
    aiFeedbackDiv.style.display = 'block';
    aiFeedbackDiv.innerHTML = '<strong>AI Feedback:</strong> <span style="color:#a259e6">Analyzing your CV...</span>';
    // Gather all CV data as a string
    const cvData = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLinkedIn: ${linkedin}\nEducation: ${education}\nExperience: ${experience}\nProjects: ${projects}\nSkills: ${skills}\nCertifications: ${certs}`;
    // Call real AI API
    const feedback = await getAIFeedback(cvData);
    aiFeedbackDiv.innerHTML = `<strong>AI Feedback:</strong><div style='text-align:left;max-width:600px;margin:16px auto 0 auto;'>${feedback.replace(/\n/g, '<br>')}</div>`;
});

// To check available Gemini models for your API key, run this in PowerShell:
// curl "https://generativelanguage.googleapis.com/v1/models?key=AIzaSyBxk6Fi0BwUeMmGUU3fr2NQ_E2sfMZwzFA"
// Replace YOUR_API_KEY with your actual Gemini API key.
// Use a model from the output that supports generateContent (e.g., gemini-1.0-pro, gemini-pro, etc.)
// Then update the model name in the fetch URL below.
async function getAIFeedback(cvData) {
    const prompt = `You are a career coach AI. Give specific, actionable feedback for each section of this CV.\n\nCV Data:\n${cvData}\n\nFormat your feedback as a bullet list, one for each section (Personal Info, Education, Experience, Projects, Skills, Certifications).`;
    try {
        // Using the available model: gemini-1.5-flash
        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyBxk6Fi0BwUeMmGUU3fr2NQ_E2sfMZwzFA', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts.map(p => p.text).join('');
        } else if (data.error && data.error.message) {
            return 'AI Error: ' + data.error.message;
        } else {
            return 'Sorry, the AI could not generate feedback at this time.';
        }
    } catch (err) {
        return 'Error contacting AI service. Please try again later.';
    }
}

// Dynamically load html2pdf.js if not present
(function() {
    if (!window.html2pdf) {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = function() { /* ready to use */ };
        document.body.appendChild(script);
    }
})();

// Add AI feedback section below the CV preview
const aiFeedbackDiv = document.createElement('div');
aiFeedbackDiv.id = 'ai-feedback';
aiFeedbackDiv.style.marginTop = '32px';
aiFeedbackDiv.style.padding = '24px';
aiFeedbackDiv.style.background = '#f6f0fa';
aiFeedbackDiv.style.borderRadius = '10px';
aiFeedbackDiv.style.boxShadow = '0 2px 8px rgba(120, 80, 180, 0.08)';
aiFeedbackDiv.style.display = 'none';
document.addEventListener('DOMContentLoaded', function() {
    const preview = document.getElementById('cv-preview');
    if (preview && !document.getElementById('ai-feedback')) {
        preview.parentNode.insertBefore(aiFeedbackDiv, preview.nextSibling);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.main-header nav a');
    const homepage = document.getElementById('home');
    const sections = [
        homepage,
        document.querySelector('.container'),
        document.getElementById('features'),
        document.getElementById('about'),
        document.getElementById('contact')
    ];
    // Map nav links to section indices
    const linkToIndex = {
        '#home': 0,
        '#cv-form': 1,
        '#features': 2,
        '#about': 3,
        '#contact': 4
    };
    // Hide all except the homepage by default
    sections.forEach((sec, i) => {
        if (i !== 0) sec.style.display = 'none';
    });
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Hide all sections
            sections.forEach(sec => sec.style.display = 'none');
            // Show the selected section
            const idx = linkToIndex[link.getAttribute('href')];
            if (typeof idx !== 'undefined') {
                sections[idx].style.display = '';
            }
            // Optionally, update active link styling
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    // If user clicks 'Get Started', show CV form
    const getStartedBtn = document.querySelector('.get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sections.forEach(sec => sec.style.display = 'none');
            sections[1].style.display = '';
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector('a[href="#cv-form"]').classList.add('active');
        });
    }
});

