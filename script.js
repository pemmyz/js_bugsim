const garden = document.getElementById('garden');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const uiContainer = document.querySelector('.ui-container');
const bugs = [];

// --- 1. CONFIGURATION ---
// These values are controlled by the Options Menu
const config = {
    amount: window.innerWidth <= 768 ? 80 : 120,
    speed: 1,
    size: 1,
    isDarkMode: false
};

// --- 2. FULLSCREEN LOGIC ---
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        }
        fullscreenBtn.innerText = "EXIT FULLSCREEN";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
        uiContainer.classList.remove('hidden'); 
    }
});

// Event listeners to handle manual exit (Esc key)
const handleFullscreenExit = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
        uiContainer.classList.remove('hidden');
    }
};
document.addEventListener('fullscreenchange', handleFullscreenExit);
document.addEventListener('webkitfullscreenchange', handleFullscreenExit);

// Toggle top UI visibility when clicking the screen during Fullscreen
document.addEventListener('click', (e) => {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFullscreen && e.target !== fullscreenBtn) {
        uiContainer.classList.toggle('hidden');
    }
});

// --- 3. BUG LOGIC ---
class Bug {
    constructor() {
        this.element = document.createElement('img');
        this.element.src = 'sprites/bug.png'; 
        this.element.className = 'bug';
        
        const side = Math.floor(Math.random() * 4);
        const padding = 100; 
        
        if (side === 0) { // Top
            this.x = Math.random() * window.innerWidth;
            this.y = -padding;
        } else if (side === 1) { // Right
            this.x = window.innerWidth + padding;
            this.y = Math.random() * window.innerHeight;
        } else if (side === 2) { // Bottom
            this.x = Math.random() * window.innerWidth;
            this.y = window.innerHeight + padding;
        } else { // Left
            this.x = -padding;
            this.y = Math.random() * window.innerHeight;
        }

        // Random base velocity
        this.baseVx = (Math.random() - 0.5) * 2 + (this.x < 0 ? 2 : this.x > window.innerWidth ? -2 : 0);
        this.baseVy = (Math.random() - 0.5) * 2 + (this.y < 0 ? 2 : this.y > window.innerHeight ? -2 : 0);

        // Rotation calculation based on direction
        this.rotation = (Math.atan2(this.baseVy, this.baseVx) * 180 / Math.PI) + 135;

        garden.appendChild(this.element);
        this.updatePosition();
    }

    update() {
        // Position update using global speed multiplier
        this.x += this.baseVx * config.speed;
        this.y += this.baseVy * config.speed;
        this.updatePosition();

        // Bounds check
        if (this.x < -300 || this.x > window.innerWidth + 300 || 
            this.y < -300 || this.y > window.innerHeight + 300) {
            return false;
        }
        return true;
    }

    updatePosition() {
        // Apply transform including rotation and global size scale
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg) scale(${config.size})`;
    }

    destroy() {
        this.element.remove();
    }
}

function spawnBug() {
    if (bugs.length < config.amount) {
        bugs.push(new Bug());
    }
}

function animate() {
    for (let i = bugs.length - 1; i >= 0; i--) {
        const isAlive = bugs[i].update();
        if (!isAlive) {
            bugs[i].destroy();
            bugs.splice(i, 1);
            spawnBug();
        }
    }
    requestAnimationFrame(animate);
}

// --- 4. OPTIONS MENU UI INTERACTION ---
const optionsBtn = document.getElementById('optionsBtn');
const optionsMenu = document.getElementById('optionsMenu');
const closeOptionsBtn = document.getElementById('closeOptionsBtn');

const amountInput = document.getElementById('amountInput');
const amountDisplay = document.getElementById('amountDisplay');
const speedInput = document.getElementById('speedInput');
const speedDisplay = document.getElementById('speedDisplay');
const sizeInput = document.getElementById('sizeInput');
const sizeDisplay = document.getElementById('sizeDisplay');
const darkModeToggle = document.getElementById('darkModeToggle');

// Sync UI with initial config values
amountInput.value = config.amount;
amountDisplay.innerText = config.amount;

function toggleOptions() {
    // Only toggle if not in fullscreen (CSS also hides it, but this is a safety check)
    if (!document.fullscreenElement) {
        optionsMenu.classList.toggle('hidden');
    }
}

optionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleOptions();
});

closeOptionsBtn.addEventListener('click', toggleOptions);

// Press 'O' key to toggle options
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'o') {
        toggleOptions();
    }
});

// Slider: Bug Amount
amountInput.addEventListener('input', (e) => {
    config.amount = parseInt(e.target.value);
    amountDisplay.innerText = config.amount;
    
    // If user reduces amount, remove bugs immediately
    while (bugs.length > config.amount) {
        const bug = bugs.pop();
        bug.destroy();
    }
});

// Slider: Speed
speedInput.addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    speedDisplay.innerText = config.speed + 'x';
});

// Slider: Size
sizeInput.addEventListener('input', (e) => {
    config.size = parseFloat(e.target.value);
    sizeDisplay.innerText = config.size + 'x';
    // Update all existing bugs to new size instantly
    bugs.forEach(bug => bug.updatePosition());
});

// Toggle: Dark Mode
darkModeToggle.addEventListener('change', (e) => {
    config.isDarkMode = e.target.checked;
    if (config.isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

// --- 5. INITIALIZATION ---
// Spawn initial set and start animation loop
setInterval(spawnBug, 200);
animate();

window.addEventListener('resize', () => {
    // Logic for handling screen size changes if needed
});
