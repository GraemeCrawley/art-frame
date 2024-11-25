let particles = [];
let numParticles = 100;

function setup() {
    createCanvas(400, 400);
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(random(width), random(height)));
    }
}

function draw() {
    background(220);
    for (let p of particles) {
        p.flock(particles);
        p.update();
        p.display();
    }
}

class Particle {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 2; // Maximum speed
        this.maxForce = 0.05; // Maximum steering force
    }

    flock(particles) {
        let separation = this.separate(particles);
        let alignment = this.align(particles);
        let cohesion = this.cohere(particles);

        // Apply weights to each behavior
        separation.mult(1.5); // Separation is more critical
        alignment.mult(1.0);
        cohesion.mult(1.0);

        // Accumulate all forces
        this.acceleration.add(separation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
    }

    update() {
        // Update velocity and position
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        // Reset acceleration
        this.acceleration.mult(0);

        // Wrap around edges
        if (this.position.x > width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = width;
        if (this.position.y > height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = height;
    }

    display() {
        fill(50);
        noStroke();
        ellipse(this.position.x, this.position.y, 5, 5);
    }

    separate(particles) {
        let desiredSeparation = 25;
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
            steer.setMag(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    align(particles) {
        let neighborDist = 50;
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
            sum.setMag(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    cohere(particles) {
        let neighborDist = 50;
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
            return this.seek(sum);
        } else {
            return createVector(0, 0);
        }
    }

    seek(target) {
        let desired = p5.Vector.sub(target, this.position);
        desired.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
}
