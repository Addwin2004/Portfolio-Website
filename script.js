// List of repository names you wish to hide from the UI
const excludedProjects = [
    'Memory-Matching-Game',
    'Memory - Matching - Game',
    'CAR-SHOWROOM-WEBSITE',
    'Addwin2004',
    'SignUp-and-SignIn-CSS-Web-page',
    'Portfolio-Website'
];

// Configuration
const GITHUB_USERNAME = 'Addwin2004';
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

document.addEventListener('DOMContentLoaded', () => {
    runTerminalLoader();
    window.observer = initScrollObserver();
    fetchRepositories();
    initMatrixRain();
    setTimeout(() => {
        initManualLoopingScroll('.skills-grid');
        initManualLoopingScroll('.certs-grid'); // Original certifications
        initManualLoopingScroll('#achievements-track'); // CTFs & Competitions
    }, 500); // Wait for styles to settle before duplicating

    initNavbar();
});

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Menu Toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

function initManualLoopingScroll(selector) {
    const grid = document.querySelector(selector);
    if (!grid) return;

    // Ensure we don't double initialize
    if (grid.dataset.loopInitialized) return;
    grid.dataset.loopInitialized = 'true';

    const originalChildren = Array.from(grid.children);
    if (originalChildren.length === 0) return;

    // We clone elements to create 3 total sets for an infinite loop effect
    // [Set 1] - [Set 2 (Main)] - [Set 3]
    originalChildren.forEach(child => {
        // Strip scroll-reveal classes so elements don't stay permanently hidden if they weren't observed
        child.classList.remove('scroll-reveal', 'in-view');
        child.style.opacity = '1';
        child.style.transform = 'none';
        
        const clone = child.cloneNode(true);
        grid.appendChild(clone);
    });
    originalChildren.forEach(child => {
        const clone = child.cloneNode(true);
        grid.appendChild(clone);
    });

    // We need to wait for layout to jump directly to the middle set
    setTimeout(() => {
        let isScrolling = false;
        let cachedItemWidth = 0;
        let cachedSetWidth = 0;

        function updateDimensions() {
            cachedItemWidth = originalChildren[0].offsetWidth;
            const gap = parseFloat(window.getComputedStyle(grid).gap) || 0;
            cachedSetWidth = (cachedItemWidth + gap) * originalChildren.length;
        }

        function updateScrollPosition() {
            updateDimensions();
            grid.style.scrollSnapType = 'none';
            grid.scrollLeft = cachedSetWidth;
            grid.style.scrollSnapType = 'x mandatory';
        }

        // Initialize position and dimensions
        updateScrollPosition();
        
        grid.addEventListener('scroll', () => {
            if (isScrolling) return;
            
            // Use cached values to prevent layout thrashing on scroll
            if (grid.scrollLeft < cachedItemWidth) {
                isScrolling = true;
                const oldSnap = grid.style.scrollSnapType;
                grid.style.scrollSnapType = 'none';
                grid.scrollLeft += cachedSetWidth;
                grid.style.scrollSnapType = oldSnap;
                setTimeout(() => isScrolling = false, 50);
            } 
            else if (grid.scrollLeft > cachedSetWidth * 2 - cachedItemWidth) {
                isScrolling = true;
                const oldSnap = grid.style.scrollSnapType;
                grid.style.scrollSnapType = 'none';
                grid.scrollLeft -= cachedSetWidth;
                grid.style.scrollSnapType = oldSnap;
                setTimeout(() => isScrolling = false, 50);
            }
        }, { passive: true });

        // On window resize, dimensions change
        window.addEventListener('resize', () => {
            clearTimeout(grid.resizeTimer);
            grid.resizeTimer = setTimeout(updateScrollPosition, 200);
        });

    }, 200);
}

const loadingSequence = [
    "SYSTEM BOOT INITIATED...",
    "ESTABLISHING SECURE CONNECTION TO MAINFRAME...",
    "BYPASSING SECURITY PROTOCOLS...",
    "[||||||||||||||||||||] 100% BYPASSED",
    "ACCESS GRANTED.",
    "LOADING USER REGISTRY: ADDWIN_ROOT",
    "INITIALIZING PORTFOLIO INTERFACE...",
    "SYSTEM READY."
];

async function runTerminalLoader() {
    const terminalLoader = document.getElementById('terminal-loader');
    const terminalContent = document.getElementById('terminal-content');
    const body = document.body;

    if (!terminalLoader || !terminalContent) return;

    for (let i = 0; i < loadingSequence.length; i++) {
        await typeLine(loadingSequence[i], terminalContent);
    }

    setTimeout(() => {
        terminalLoader.style.opacity = '0';
        setTimeout(() => {
            terminalLoader.style.display = 'none';
            body.classList.remove('loading');
        }, 800); // Shorter transition out
    }, 300); // Shorter pause on last text
}

function typeLine(text, container) {
    return new Promise(resolve => {
        let i = 0;
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line';
        container.appendChild(lineElement);

        function typeChar() {
            if (i < text.length) {
                lineElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, Math.random() * 8 + 2); // Extremely fast typing speed
            } else {
                setTimeout(resolve, Math.random() * 40 + 20); // Tiny pause between lines
            }
        }
        typeChar();
    });
}

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
    const revealElements = document.querySelectorAll('.hero-image-container, .about-section, .timeline-item, .skill-category, .certs-section, .cert-card');
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
    for (let x = 0; x < columns; x++) {
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

        for (let i = 0; i < drops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));

            // Randomly flash white for the lead character, with reduced opacity for a lighter, subtler background
            ctx.fillStyle = Math.random() > 0.95 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 255, 65, 0.25)';

            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Reset drop 
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
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
