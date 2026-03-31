const garden = document.getElementById('garden');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const bugs = [];

// --- FULLSCREEN LOGIC ---
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Safari/iOS */
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
            document.documentElement.msRequestFullscreen();
        }
        fullscreenBtn.innerText = "EXIT FULLSCREEN";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
    }
});

// Update button text if user exits fullscreen via system keys (Esc)
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
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
         * 2. + 90 because sprite "Up" is 0 deg.
         * 3. + 45 because of your base rotation requirement.
         */
        this.rotation = (Math.atan2(this.vy, this.vx) * 180 / Math.PI) + 135;

        garden.appendChild(this.element);
        this.updatePosition();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.updatePosition();

        // Kill bug if it leaves screen
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

function spawnBug() {
    if (bugs.length < 40) {
        bugs.push(new Bug());
    }
}

function animate() {
    for (let i = bugs.length - 1; i >= 0; i--) {
        const isAlive = bugs[i].update();
        if (!isAlive) {
            bugs[i].destroy();
            bugs.splice(i, 1);
        }
    }
    requestAnimationFrame(animate);
}

setInterval(spawnBug, 800);
animate();

// Handle window resizing to keep bounds clean
window.addEventListener('resize', () => {
    // Current bugs stay, but bounds refresh automatically in next update cycle
});
