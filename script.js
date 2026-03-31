const garden = document.getElementById('garden');
const bugs = [];

class Bug {
    constructor() {
        this.element = document.createElement('img');
        this.element.src = '/sprites/bug.png'; 
        this.element.className = 'bug';
        
        // Randomly choose a starting side: 0=top, 1=right, 2=bottom, 3=left
        const side = Math.floor(Math.random() * 4);
        const padding = 100; 
        
        if (side === 0) { // Start above Top
            this.x = Math.random() * window.innerWidth;
            this.y = -padding;
        } else if (side === 1) { // Start beyond Right
            this.x = window.innerWidth + padding;
            this.y = Math.random() * window.innerHeight;
        } else if (side === 2) { // Start below Bottom
            this.x = Math.random() * window.innerWidth;
            this.y = window.innerHeight + padding;
        } else { // Start beyond Left
            this.x = -padding;
            this.y = Math.random() * window.innerHeight;
        }

        // Velocity: Give them a speed between 1 and 3 pixels per frame
        // The ternary operators ensure they generally move toward the screen area
        this.vx = (Math.random() - 0.5) * 2 + (this.x < 0 ? 2 : this.x > window.innerWidth ? -2 : 0);
        this.vy = (Math.random() - 0.5) * 2 + (this.y < 0 ? 2 : this.y > window.innerHeight ? -2 : 0);

        /**
         * CALCULATE ROTATION
         * 1. Math.atan2 gets the angle of movement in radians.
         * 2. Convert to degrees (* 180 / Math.PI).
         * 3. Add 90 because the sprite naturally points "Up" (North).
         * 4. Add 45 because of your specific requirement for a 45° clockwise base rotation.
         * Total offset = 135 degrees.
         */
        this.rotation = (Math.atan2(this.vy, this.vx) * 180 / Math.PI) + 135;

        garden.appendChild(this.element);
        this.updatePosition();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.updatePosition();

        // Remove bug if it wanders too far off screen (200px buffer)
        if (this.x < -200 || this.x > window.innerWidth + 200 || 
            this.y < -200 || this.y > window.innerHeight + 200) {
            return false;
        }
        return true;
    }

    updatePosition() {
        // We use transform for both movement and rotation for better performance
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }

    destroy() {
        this.element.remove();
    }
}

function spawnBug() {
    // Keep a maximum of 50 bugs on screen to maintain performance
    if (bugs.length < 50) {
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

// Spawn a bug every 700 milliseconds
setInterval(spawnBug, 700);

// Start the animation loop
animate();
