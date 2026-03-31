const garden = document.getElementById('garden');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const uiContainer = document.querySelector('.ui-container');
const bugs = [];

// --- FULLSCREEN LOGIC ---
fullscreenBtn.addEventListener('click', () => {
    // Check if we are NOT in fullscreen
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Safari/iOS */
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
            document.documentElement.msRequestFullscreen();
        }
        fullscreenBtn.innerText = "EXIT FULLSCREEN";
    } else {
        // We ARE in fullscreen, so exit
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        }
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
        uiContainer.classList.remove('hidden'); // Ensure UI is visible when exiting
    }
});

// Handle standard fullscreen exit (like pressing Esc)
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
        uiContainer.classList.remove('hidden'); // Force UI back on
    }
});

// Handle Safari specific fullscreen exit
document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) {
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
        uiContainer.classList.remove('hidden'); // Force UI back on
    }
});

// Toggle UI visibility when touching/clicking the screen in Fullscreen
document.addEventListener('click', (e) => {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    
    // Only toggle if we are currently in fullscreen mode
    if (isFullscreen) {
        // Prevent toggling if the user specifically clicked the fullscreen button
        if (e.target !== fullscreenBtn) {
            uiContainer.classList.toggle('hidden');
        }
    }
});


// --- BUG LOGIC ---
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

        // Random velocity toward the center
        this.vx = (Math.random() - 0.5) * 2 + (this.x < 0 ? 2 : this.x > window.innerWidth ? -2 : 0);
        this.vy = (Math.random() - 0.5) * 2 + (this.y < 0 ? 2 : this.y > window.innerHeight ? -2 : 0);

        /**
         * ROTATION CALCULATION:
         * 1. Math.atan2 gets movement angle.
         * 2. + 135 adjusts for sprite orientation and base rotation.
         */
        this.rotation = (Math.atan2(this.vy, this.vx) * 180 / Math.PI) + 135;

        garden.appendChild(this.element);
        this.updatePosition();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.updatePosition();

        // Kill bug if it leaves screen bounds safely
        if (this.x < -300 || this.x > window.innerWidth + 300 || 
            this.y < -300 || this.y > window.innerHeight + 300) {
            return false;
        }
        return true;
    }

    updatePosition() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }

    destroy() {
        this.element.remove();
    }
}

// Dynamic bug limit based on screen size
function getMaxBugs() {
    // Mobile (<= 768px): Double the original 40 = 80
    // Desktop: Greatly increased to fill the area with smaller bugs = 120
    return window.innerWidth <= 768 ? 80 : 120;
}

function spawnBug() {
    if (bugs.length < getMaxBugs()) {
        bugs.push(new Bug());
    }
}

function animate() {
    for (let i = bugs.length - 1; i >= 0; i--) {
        const isAlive = bugs[i].update();
        if (!isAlive) {
            bugs[i].destroy();
            bugs.splice(i, 1);
            // Whenever one leaves, immediately spawn a new one
            spawnBug();
        }
    }
    requestAnimationFrame(animate);
}

// Start game loops (Interval lowered to 200ms so the larger amounts spawn faster initially)
setInterval(spawnBug, 200);
animate();

// Handle window resizing to keep bounds clean
window.addEventListener('resize', () => {
    // Current bugs stay, but bounds refresh automatically in next update cycle
});
