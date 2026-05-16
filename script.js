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
    followMouse: false,
    isDarkMode: false,
    invertBugs: false,
    negativeBg: false // Tracks if bugs should be negative of background
};

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
window.addEventListener('touchmove', (e) => { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; });

// --- 2. FULLSCREEN LOGIC ---
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) { document.documentElement.requestFullscreen(); } 
        else if (document.documentElement.webkitRequestFullscreen) { document.documentElement.webkitRequestFullscreen(); }
        fullscreenBtn.innerText = "EXIT FULLSCREEN";
    } else {
        if (document.exitFullscreen) { document.exitFullscreen(); } 
        else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
    }
});

const handleFullscreenExit = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        fullscreenBtn.innerText = "ENTER FULLSCREEN";
        uiContainer.classList.remove('hidden');
        optionsBtn.classList.remove('hidden');
    }
};
document.addEventListener('fullscreenchange', handleFullscreenExit);
document.addEventListener('webkitfullscreenchange', handleFullscreenExit);

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
        
        if (side === 0) { this.x = Math.random() * window.innerWidth; this.y = -padding; } 
        else if (side === 1) { this.x = window.innerWidth + padding; this.y = Math.random() * window.innerHeight; } 
        else if (side === 2) { this.x = Math.random() * window.innerWidth; this.y = window.innerHeight + padding; } 
        else { this.x = -padding; this.y = Math.random() * window.innerHeight; }

        this.baseVx = (Math.random() - 0.5) * 2 + (this.x < 0 ? 2 : this.x > window.innerWidth ? -2 : 0);
        this.baseVy = (Math.random() - 0.5) * 2 + (this.y < 0 ? 2 : this.y > window.innerHeight ? -2 : 0);
        
        this.angle = Math.atan2(this.baseVy, this.baseVx);
        this.speedMag = Math.sqrt(this.baseVx * this.baseVx + this.baseVy * this.baseVy);
        this.turnSpeed = 0.01 + Math.random() * 0.04; 
        this.ignoreMouseFrames = 0;
        this.rotation = (this.angle * 180 / Math.PI) + 135;

        garden.appendChild(this.element);
        this.updatePosition();
    }

    update() {
        if (config.followMouse) {
            if (this.ignoreMouseFrames > 0) {
                this.ignoreMouseFrames--;
            } else {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    this.ignoreMouseFrames = 120; 
                } else {
                    const targetAngle = Math.atan2(dy, dx);
                    let diff = targetAngle - this.angle;
                    
                    while (diff <= -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    
                    if (Math.abs(diff) < this.turnSpeed) { this.angle = targetAngle; } 
                    else { this.angle += Math.sign(diff) * this.turnSpeed; }
                    
                    this.baseVx = Math.cos(this.angle) * this.speedMag;
                    this.baseVy = Math.sin(this.angle) * this.speedMag;
                    this.rotation = (this.angle * 180 / Math.PI) + 135;
                }
            }
        }

        this.x += this.baseVx * config.speed;
        this.y += this.baseVy * config.speed;
        this.updatePosition();

        if (this.x < -300 || this.x > window.innerWidth + 300 || this.y < -300 || this.y > window.innerHeight + 300) {
            return false;
        }
        return true;
    }

    updatePosition() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg) scale(${config.size})`;
    }

    destroy() { this.element.remove(); }
}

function spawnBug() {
    if (bugs.length < config.amount) { bugs.push(new Bug()); }
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
const followMouseToggle = document.getElementById('followMouseToggle');

// Color controls elements
const darkModeToggle = document.getElementById('darkModeToggle');
const invertBugsToggle = document.getElementById('invertBugsToggle');
const negativeBgToggle = document.getElementById('negativeBgToggle');
const bgColorPicker = document.getElementById('bgColorPicker');
const quickColorBtns = document.querySelectorAll('.quick-color-btn[data-color]');
const btnDefaultBg = document.getElementById('btn-default-bg');
const btnGreyBlack = document.getElementById('btn-grey-black');

// NEW ELEMENTS
const btnBlackWhite = document.getElementById('btn-black-white');
const greySliderContainer = document.getElementById('greySliderContainer');
const blackSliderContainer = document.getElementById('blackSliderContainer');
const greyBgSlider = document.getElementById('greyBgSlider');
const bugBrightnessSlider = document.getElementById('bugBrightnessSlider');

amountInput.value = config.amount;
amountDisplay.innerText = config.amount;

function toggleOptions() { optionsMenu.classList.toggle('hidden'); }

optionsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleOptions(); });
closeOptionsBtn.addEventListener('click', toggleOptions);
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'o') toggleOptions(); });

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

followMouseToggle.addEventListener('change', (e) => { config.followMouse = e.target.checked; });

// --- 5. COLOR & BACKGROUND LOGIC ---

// Updates specific bug filter styles (Black bugs)
function setDarkMode(isDark) {
    config.isDarkMode = isDark;
    darkModeToggle.checked = isDark;
    if (isDark) {
        document.body.classList.add('dark-mode');
        if (config.negativeBg) setNegativeBgMode(false);
        setLightBugMode(false);
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Updates negative bug filter styles (Invert bugs)
function setInvertBugs(isInvert) {
    config.invertBugs = isInvert;
    invertBugsToggle.checked = isInvert;
    if (isInvert) {
        document.body.classList.add('invert-bugs');
        if (config.negativeBg) setNegativeBgMode(false);
        setLightBugMode(false);
    } else {
        document.body.classList.remove('invert-bugs');
    }
}

// Updates mathematical negative-to-background styling
function setNegativeBgMode(isNegative) {
    config.negativeBg = isNegative;
    negativeBgToggle.checked = isNegative;
    if (isNegative) {
        document.body.classList.add('negative-bg-mode');
        // Turn off other filters to prevent conflicts
        setDarkMode(false);
        setInvertBugs(false);
        setLightBugMode(false);
    } else {
        document.body.classList.remove('negative-bg-mode');
    }
}

// Updates Light Bug Mode (For the Black BG button)
function setLightBugMode(isLight) {
    if (isLight) {
        document.body.classList.add('light-bug-mode');
        setDarkMode(false);
        setInvertBugs(false);
        setNegativeBgMode(false);
    } else {
        document.body.classList.remove('light-bug-mode');
    }
}

// Hides specific quick color sliders
function hideQuickSliders() {
    greySliderContainer.style.display = 'none';
    blackSliderContainer.style.display = 'none';
    setLightBugMode(false);
}

// Sets a flat background color (removing the image)
function setBackgroundColor(color) {
    garden.style.backgroundImage = 'none';
    garden.style.backgroundColor = color;
    bgColorPicker.value = color.startsWith('#') ? color : bgColorPicker.value;
}

// Restores default image
function restoreDefaultBackground() {
    garden.style.backgroundImage = ''; // Removes inline style, falls back to CSS
    garden.style.backgroundColor = '';
}

// Event Listeners for Filters
darkModeToggle.addEventListener('change', (e) => setDarkMode(e.target.checked));
invertBugsToggle.addEventListener('change', (e) => setInvertBugs(e.target.checked));
negativeBgToggle.addEventListener('change', (e) => setNegativeBgMode(e.target.checked));

// Event Listeners for Custom Color Picker
bgColorPicker.addEventListener('input', (e) => {
    setBackgroundColor(e.target.value);
    hideQuickSliders();
});

// Event Listeners for Standard Quick Colors
quickColorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        setBackgroundColor(e.target.getAttribute('data-color'));
        hideQuickSliders();
    });
});

// Default Image Quick-select
btnDefaultBg.addEventListener('click', () => {
    restoreDefaultBackground();
    hideQuickSliders();
});

// Grey Colors + Black Bugs Quick-select
btnGreyBlack.addEventListener('click', () => {
    const val = greyBgSlider.value;
    setBackgroundColor(`rgb(${val}, ${val}, ${val})`);
    
    setDarkMode(true);             // Make bugs black
    setInvertBugs(false);          // Ensure invert is off
    setNegativeBgMode(false);      // Ensure negative is off
    setLightBugMode(false);        // Ensure light bug is off
    
    // Show grey slider, hide black slider
    greySliderContainer.style.display = 'block';
    blackSliderContainer.style.display = 'none';
});

// Black BG + White/Grey Bugs Quick-select
btnBlackWhite.addEventListener('click', () => {
    setBackgroundColor('#000000'); // Black
    
    setLightBugMode(true);         // Enable light bug mode
    document.body.style.setProperty('--bug-brightness', bugBrightnessSlider.value);
    
    // Show black slider, hide grey slider
    blackSliderContainer.style.display = 'block';
    greySliderContainer.style.display = 'none';
});

// Slider Event Listeners
greyBgSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    setBackgroundColor(`rgb(${val}, ${val}, ${val})`);
});

bugBrightnessSlider.addEventListener('input', (e) => {
    document.body.style.setProperty('--bug-brightness', e.target.value);
});

// --- 6. INITIALIZATION ---
setInterval(spawnBug, 200);
animate();
