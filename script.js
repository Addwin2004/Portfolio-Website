// List of repository names you wish to hide from the UI
const excludedProjects = [
    'Memory-Matching-Game',
    'Memory - Matching - Game',
    'CAR-SHOWROOM-WEBSITE',
    'Addwin2004',
    'SignUp-and-SignIn-CSS-Web-page'
];

// Configuration
const GITHUB_USERNAME = 'Addwin2004';
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

document.addEventListener('DOMContentLoaded', () => {
    window.observer = initScrollObserver();
    fetchRepositories();
    initMatrixRain();
});

function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
                // Clean up classes after animation finishes so hover states resume normally
                setTimeout(() => entry.target.classList.remove('scroll-reveal', 'in-view'), 800);
            }
        });
    }, { threshold: 0.1 });

    // Initial load elements
    const revealElements = document.querySelectorAll('.hero-image-container, .about-section, .timeline-item, .skill-category');
    revealElements.forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });

    return observer;
}

async function fetchRepositories() {
    const grid = document.getElementById('projects-grid');

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Filter out excluded projects and handle empty state
        const visibleProjects = data.filter(repo => !excludedProjects.includes(repo.name));

        // Clear loading state
        grid.innerHTML = '';

        if (visibleProjects.length === 0) {
            grid.innerHTML = '<p class="loading-state">No public repositories found or all are filtered out.</p>';
            return;
        }

        // Render project cards
        visibleProjects.forEach(repo => {
            const card = createProjectCard(repo);
            card.classList.add('scroll-reveal');
            grid.appendChild(card);
            if (window.observer) window.observer.observe(card);
        });

        // Re-initialize feather icons for the newly injected HTML
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

    } catch (error) {
        console.error('Error fetching repositories:', error);
        grid.innerHTML = `
            <div class="loading-state" style="color: var(--cyber-pink);">
                <i data-feather="alert-triangle"></i>
                <p>Failed to load repositories. Error: ${error.message}</p>
            </div>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

function createProjectCard(repo) {
    // Prevent unstyled undefined elements
    const description = repo.description || 'No description provided.';
    const language = repo.language || 'Unknown';

    const div = document.createElement('div');
    div.className = 'project-card';

    div.innerHTML = `
        <h4 class="project-name">
            <i data-feather="folder" style="color: var(--matrix-green); width: 18px; height: 18px;"></i> 
            ${repo.name}
        </h4>
        <p class="project-desc">${description}</p>
        <div class="card-footer">
            <span class="project-lang">&lt;${language}/&gt;</span>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn-card">
                <i data-feather="github" style="width: 14px; height: 14px;"></i> Source
            </a>
        </div>
    `;

    return div;
}

// Simple loading dots animation inside script (optional if needed dynamically)
const loadingDots = document.querySelector('.loading-dots');
if (loadingDots) {
    let dots = 0;
    setInterval(() => {
        dots = (dots + 1) % 4;
        loadingDots.textContent = '.'.repeat(dots);
    }, 500);
}
// Cinematic Matrix Digital Rain Generator
function initMatrixRain() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;
    
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    
    const drops = [];
    for(let x = 0; x < columns; x++) {
        drops[x] = Math.random() * -100; // stagger initial start
    }
    
    // Performance throttler for cinematic feel
    let lastDrawTime = 0;
    const fps = 30;
    const fpsInterval = 1000 / fps;

    function draw(time) {
        requestAnimationFrame(draw);
        
        const elapsed = time - lastDrawTime;
        if (elapsed < fpsInterval) return;
        lastDrawTime = time - (elapsed % fpsInterval);

        // Fade effect for trails
        ctx.fillStyle = 'rgba(5, 5, 5, 0.15)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = fontSize + 'px "JetBrains Mono", monospace';
        
        for(let i = 0; i < drops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            
            // Randomly flash white for the lead character
            ctx.fillStyle = Math.random() > 0.95 ? '#ffffff' : '#00ff41';
            
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            // Reset drop 
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    requestAnimationFrame(draw);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
