let waxDroplets = [];
let gravity;
let num_drops = 10; // Number of falling droplets
const min_mass = 30;
const max_mass = 60;
const gravity_value = 0.5; // Gravity value
const size_reduction_factor = 0.1; // Size reduction factor
const global_friction_element = 0; // Global friction element

function setup() {
    createCanvas(windowWidth, windowHeight);
    gravity = createVector(0, gravity_value * 0.1);
    
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
        this.size = random(min_mass, max_mass); // Initial size of droplet
        this.frictionCoefficient = global_friction_element; // Adjust for stronger or weaker slowing effect
    }

    applyForce(force) {
        let f = force.copy();
        this.acceleration.add(f);
    }

    update() {
        this.velocity.add(this.acceleration);
        
        // Apply friction, which increases as the droplet shrinks
        let friction = this.velocity.copy();
        friction.mult(-1);
        friction.normalize();
        friction.mult(this.frictionCoefficient / this.size); // Smaller droplets experience more friction
        this.velocity.add(friction);
        
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        
        // Simulate melting by reducing size over time
        this.size -= this.size * size_reduction_factor;
        if (this.size < 2) this.size = 2; // Prevent disappearing entirely
    }

    display() {
        noStroke();
        fill(255, 204, 100);
        ellipse(this.position.x, this.position.y, this.size, this.size);
    }

    isOffScreen() {
        return this.position.y > height + this.size;
    }
}
