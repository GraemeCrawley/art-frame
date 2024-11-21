let particles = [];

function setup() {
    createCanvas(400, 400);
    for (let i = 0; i < 100; i++) {
        particles.push(createVector(random(width), random(height)));
    }
}

function draw() {
    background(220);
    for (let p of particles) {
        ellipse(p.x, p.y, 5, 5);
        let velocity = createVector(random(-1, 1), random(-1, 1));
        p.add(velocity);
    }
}