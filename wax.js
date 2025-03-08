let waxDroplets = [];
let gravity;
let num_drops = 10; // Number of falling droplets
const min_mass = 15;
const max_mass = 30;
const gravity_value = 0.5; // Gravity value
const size_reduction_factor = 0.99; // Size reduction factor

function setup() {
    createCanvas(windowWidth, windowHeight);
    gravity = createVector(0, gravity_value);
    
    for (let i = 0; i < num_drops; i++) {
        waxDroplets.push(new WaxDroplet(random(width), random(-height, 0)));
    }
}

function draw() {
    // Draw a semi-transparent black overlay instead of clearing completely
    // fill(50, 50, 50, 50); // Low opacity to leave trails
    // rect(0, 0, width, height);
    
    for (let i = waxDroplets.length - 1; i >= 0; i--) {
        waxDroplets[i].applyForce(gravity);
        waxDroplets[i].update();
        waxDroplets[i].display();
        
        if (waxDroplets[i].isOffScreen()) {
            waxDroplets.splice(i, 1);
            waxDroplets.push(new WaxDroplet(random(width), random(-50, 0))); // Add new droplet
        }
    }
}

class WaxDroplet {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.mass = random(min_mass, max_mass);
        this.size = this.mass * 2;
        this.trail = []; // Store previous positions
    }
    
    applyForce(force) {
        let f = p5.Vector.div(force, this.mass);
        this.acceleration.add(f);
    }
    
    update() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        
        // Reduce size over time
        this.size *= size_reduction_factor;
        
        // Store trail positions
        this.trail.push(createVector(this.position.x, this.position.y));
        if (this.trail.length > 50) {
            this.trail.shift();
        }
    }
    
    display() {
        noStroke();
        
        // Draw droplet
        fill(255, 200, 0);
        ellipse(this.position.x, this.position.y, this.size);
    }
    
    isOffScreen() {
        return this.position.y > height || this.size < 2;
    }
}
