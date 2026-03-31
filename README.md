# js_bugsim

# Bug Invasion 🐜

A simple fullscreen web animation where bugs swarm into the screen from
all sides.

## Play it now: https://pemmyz.github.io/js_bugsim/

## Description

Bug Invasion is a lightweight HTML, CSS, and JavaScript project that
simulates bugs entering a garden area from the edges of the screen and
moving toward the center. The app supports fullscreen mode and smooth
animation using `requestAnimationFrame`.

## Features

-   Fullscreen toggle button
-   Animated bug spawning from all screen edges
-   Random movement toward the center
-   Sprite rotation based on movement direction
-   Smooth animation using requestAnimationFrame
-   Clean UI overlay
-   Responsive fullscreen layout
-   Lightweight and fast

## Project Structure

    bug-invasion/
    │
    ├── index.html
    ├── style.css
    ├── script.js
    └── sprites/
        └── bug.png

## How to Run

1.  Download or clone the project
2.  Make sure the folder structure is correct
3.  Open `index.html` in your browser

Or run a simple local server:

``` bash
python3 -m http.server
```

Then open:

    http://localhost:8000

## Controls

-   **ENTER FULLSCREEN** → Toggle fullscreen mode
-   **ESC** → Exit fullscreen

## Bug Behavior

-   Bugs spawn from random edges
-   Move toward the center
-   Rotate based on direction
-   Automatically removed when leaving screen bounds
-   Maximum of 40 bugs at a time
-   New bug spawns every 800 ms

## Customization

### Change Bug Image

Replace:

    /sprites/bug.png

with your own sprite.

### Change Spawn Speed

Edit in `script.js`:

``` js
setInterval(spawnBug, 800);
```

### Change Maximum Bugs

Edit:

``` js
if (bugs.length < 40)
```

### Change Bug Size

Edit in `style.css`:

``` css
.bug {
    width: 50px;
}
```

## Requirements

-   Modern web browser
-   JavaScript enabled

## Technologies Used

-   HTML5
-   CSS3
-   JavaScript (ES6)
-   Fullscreen API
-   requestAnimationFrame

## License

MIT License

## Author

pemmyz 2026
