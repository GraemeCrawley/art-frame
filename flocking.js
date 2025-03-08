/**
 * @file flocking.js
 * @description Particle system simulation using p5.js.
 */

let particles = [];
let numParticles = 200;

/**
 * Setup function for p5.js.
 * Initializes the canvas and creates particles.
 */
function setup() {
    createCanvas(600, 600);
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(random(width), random(height)));
    }
}

/**
 * Draw function for p5.js.
 * Updates and displays particles on the canvas.
 */
function draw() {
    background(220);
    for (let p of particles) {
        p.flock(particles);
        p.avoidWalls();
        p.update();
        p.display();
    }
}

/**
 * Class representing a particle.
 */
class Particle {
    /**
     * Create a particle.
     * @param {number} x - The x-coordinate of the particle.
     * @param {number} y - The y-coordinate of the particle.
     */
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 4; // Moderate speed for smoother movement
        this.maxForce = 0.05; // Gentle steering force
    }

    /**
     * Apply flocking behavior to the particle.
     * @param {Particle[]} particles - Array of all particles.
     */
    flock(particles) {
        let separation = this.separate(particles);
        let alignment = this.align(particles);
        let cohesion = this.cohere(particles);

        // Adjust weights for smoother behavior
        separation.mult(1.5); // Slightly stronger to prevent crowding
        alignment.mult(0.9);  // Balanced alignment
        cohesion.mult(0.8);   // Balanced cohesion

        // Accumulate all forces
        this.acceleration.add(separation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
    }

    /**
     * Avoid walls by steering away from the edges.
     */
    avoidWalls() {
        let margin = 50; // Distance from wall to start steering
        let steer = createVector(0, 0);

        // Gradual steering near walls
        if (this.position.x < margin) {
            let proximity = map(this.position.x, 0, margin, 1, 0);
            steer.add(createVector(this.maxSpeed * proximity, 0));
        }
        if (this.position.x > width - margin) {
            let proximity = map(this.position.x, width, width - margin, 1, 0);
            steer.add(createVector(-this.maxSpeed * proximity, 0));
        }
        if (this.position.y < margin) {
            let proximity = map(this.position.y, 0, margin, 1, 0);
            steer.add(createVector(0, this.maxSpeed * proximity));
        }
        if (this.position.y > height - margin) {
            let proximity = map(this.position.y, height, height - margin, 1, 0);
            steer.add(createVector(0, -this.maxSpeed * proximity));
        }

        // Smooth steering force
        steer.limit(this.maxForce * 0.7); // Further reduce wall avoidance force
        this.acceleration.add(steer);
    }

    /**
     * Update the particle's position and velocity.
     */
    update() {
        // Gradual updates to velocity for smoother movement
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        // Reset acceleration (no excessive damping)
        this.acceleration.mult(0);
    }

    /**
     * Display the particle on the canvas.
     */
    display() {
        fill(50);
        noStroke();
        ellipse(this.position.x, this.position.y, 4, 4);
    }

    /**
     * Calculate the separation force to avoid crowding.
     * @param {Particle[]} particles - Array of all particles.
     * @returns {p5.Vector} - The separation force.
     */
    separate(particles) {
        let desiredSeparation = 30; // Balanced separation distance
        let steer = createVector(0, 0);
        let count = 0;

        for (let other of particles) {
            let d = p5.Vector.dist(this.position, other.position);
            if (d > 0 && d < desiredSeparation) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steer.div(count);
        }

        if (steer.mag() > 0) {
            steer.setMag(this.maxSpeed * 0.7); // Limit separation speed
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    /**
     * Calculate the alignment force to align with nearby particles.
     * @param {Particle[]} particles - Array of all particles.
     * @returns {p5.Vector} - The alignment force.
     */
    align(particles) {
        let neighborDist = 30; // Moderate range
        let sum = createVector(0, 0);
        let count = 0;

        for (let other of particles) {
            let d = p5.Vector.dist(this.position, other.position);
            if (d > 0 && d < neighborDist) {
                sum.add(other.velocity);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            sum.setMag(this.maxSpeed * 0.7); // Limit alignment speed
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    /**
     * Calculate the cohesion force to move towards the center of mass.
     * @param {Particle[]} particles - Array of all particles.
     * @returns {p5.Vector} - The cohesion force.
     */
    cohere(particles) {
        let neighborDist = 30; // Moderate range
        let sum = createVector(0, 0);
        let count = 0;

        for (let other of particles) {
            let d = p5.Vector.dist(this.position, other.position);
            if (d > 0 && d < neighborDist) {
                sum.add(other.position);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            return this.seek(sum).mult(0.7); // Weaken cohesion force slightly
        } else {
            return createVector(0, 0);
        }
    }

    /**
     * Seek a target position.
     * @param {p5.Vector} target - The target position.
     * @returns {p5.Vector} - The steering force towards the target.
     */
    seek(target) {
        let desired = p5.Vector.sub(target, this.position);
        desired.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
}
