const garden = document.getElementById('garden');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const uiContainer = document.querySelector('.ui-container');
const optionsBtn = document.getElementById('optionsBtn');
const optionsMenu = document.getElementById('optionsMenu');
const bugs = [];

// --- 1. CONFIGURATION ---
const config = {
    amount: window.innerWidth <= 768 ? 80 : 120,
    speed: 1,
    size: 1,
    isDarkMode: false,
    followMouse: false // Tracks if bugs should follow the cursor
};

// Global variables to track mouse/touch position
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

window.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
});

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
    }
});

// Handle UI visibility on exit
const handleFullscreenExit = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
        uiContainer.classList.remove('hidden');
        optionsBtn.classList.remove('hidden');
    }
};
document.addEventListener('fullscreenchange', handleFullscreenExit);
document.addEventListener('webkitfullscreenchange', handleFullscreenExit);

// Toggle UI when clicking screen in Fullscreen
document.addEventListener('click', (e) => {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFullscreen && e.target !== fullscreenBtn && e.target !== optionsBtn && !optionsMenu.contains(e.target)) {
        uiContainer.classList.toggle('hidden');
        optionsBtn.classList.toggle('hidden');
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

        this.baseVx = (Math.random() - 0.5) * 2 + (this.x < 0 ? 2 : this.x > window.innerWidth ? -2 : 0);
        this.baseVy = (Math.random() - 0.5) * 2 + (this.y < 0 ? 2 : this.y > window.innerHeight ? -2 : 0);
        
        // Advanced Movement Properties for pathfinding
        this.angle = Math.atan2(this.baseVy, this.baseVx);
        this.speedMag = Math.sqrt(this.baseVx * this.baseVx + this.baseVy * this.baseVy);
        
        // Give each bug a slightly different turn radius (higher turnSpeed = tighter arc)
        this.turnSpeed = 0.01 + Math.random() * 0.04; 
        
        // Cooldown timer to let them fly "past" the cursor without immediately orbiting
        this.ignoreMouseFrames = 0;

        this.rotation = (this.angle * 180 / Math.PI) + 135;

        garden.appendChild(this.element);
        this.updatePosition();
    }

    update() {
        // Pathfinding Logic
        if (config.followMouse) {
            if (this.ignoreMouseFrames > 0) {
                // If they are in cooldown (flew past cursor), keep flying straight
                this.ignoreMouseFrames--;
            } else {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    // Trigger flyby behavior when close: ignore cursor for ~120 frames (approx 2 seconds)
                    // This makes them go past the cursor and continue heading in that direction
                    this.ignoreMouseFrames = 120; 
                } else {
                    // Calculate target angle towards cursor
                    const targetAngle = Math.atan2(dy, dx);
                    
                    // Difference between current angle and target angle
                    let diff = targetAngle - this.angle;
                    
                    // Normalize the difference to roughly -PI to PI
                    while (diff <= -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    
                    // Steer toward the target forming an arc based on bug's unique turnSpeed
                    if (Math.abs(diff) < this.turnSpeed) {
                        this.angle = targetAngle;
                    } else {
                        this.angle += Math.sign(diff) * this.turnSpeed;
                    }
                    
                    // Apply updated angle to velocities and visual rotation
                    this.baseVx = Math.cos(this.angle) * this.speedMag;
                    this.baseVy = Math.sin(this.angle) * this.speedMag;
                    this.rotation = (this.angle * 180 / Math.PI) + 135;
                }
            }
        }

        // Apply speed
        this.x += this.baseVx * config.speed;
        this.y += this.baseVy * config.speed;
        this.updatePosition();

        // Despawn if they go too far off screen
        if (this.x < -300 || this.x > window.innerWidth + 300 || 
            this.y < -300 || this.y > window.innerHeight + 300) {
            return false;
        }
        return true;
    }

    updatePosition() {
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
const closeOptionsBtn = document.getElementById('closeOptionsBtn');
const amountInput = document.getElementById('amountInput');
const amountDisplay = document.getElementById('amountDisplay');
const speedInput = document.getElementById('speedInput');
const speedDisplay = document.getElementById('speedDisplay');
const sizeInput = document.getElementById('sizeInput');
const sizeDisplay = document.getElementById('sizeDisplay');
const darkModeToggle = document.getElementById('darkModeToggle');
const followMouseToggle = document.getElementById('followMouseToggle');

amountInput.value = config.amount;
amountDisplay.innerText = config.amount;

function toggleOptions() {
    optionsMenu.classList.toggle('hidden');
}

optionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleOptions();
});

closeOptionsBtn.addEventListener('click', toggleOptions);

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'o') {
        toggleOptions();
    }
});

amountInput.addEventListener('input', (e) => {
    config.amount = parseInt(e.target.value);
    amountDisplay.innerText = config.amount;
    while (bugs.length > config.amount) {
        const bug = bugs.pop();
        bug.destroy();
    }
});

speedInput.addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    speedDisplay.innerText = config.speed + 'x';
});

sizeInput.addEventListener('input', (e) => {
    config.size = parseFloat(e.target.value);
    sizeDisplay.innerText = config.size + 'x';
    bugs.forEach(bug => bug.updatePosition());
});

darkModeToggle.addEventListener('change', (e) => {
    config.isDarkMode = e.target.checked;
    if (config.isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

followMouseToggle.addEventListener('change', (e) => {
    config.followMouse = e.target.checked;
});

// --- 5. INITIALIZATION ---
setInterval(spawnBug, 200);
animate();
