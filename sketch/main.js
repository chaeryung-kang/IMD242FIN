let particles = [];
let particleCount = 800;
let mouse = {
  x: undefined,
  y: undefined
};

let exploded = false;
let clusters = [];
const clusterCount = 4;

const aspectW = 4;
const aspectH = 3;
const container = document.body.querySelector('.container-canvas');

function setup() {
  const { width: containerW, height: containerH } = container.getBoundingClientRect();

  if (aspectW === 0 || aspectH === 0) {
    createCanvas(containerW, containerH).parent(container);
  } else if (containerW / containerH > aspectW / aspectH) {
    createCanvas((containerH * aspectW) / aspectH, containerH).parent(container);
  } else {
    createCanvas(containerW, (containerW * aspectH) / aspectW).parent(container);
  }

  noStroke();
  background(34, 34, 34);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  createClusters();
}

function draw() {
  fill(34, 34, 34, 20);
  rect(0, 0, width, height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });
}

function mouseMoved() {
  mouse.x = mouseX;
  mouse.y = mouseY;
}

function mouseOut() {
  mouse.x = undefined;
  mouse.y = undefined;

  particles.forEach(p => {
    p.spread();
  });
}

function mousePressed() {
  if (!exploded) {
    particles.forEach(p => {
      p.explodeToMouse();
    });
    exploded = true;
  } else {
    createClusters();
    particles.forEach((p, index) => {
      p.explode(index);
    });
    exploded = false;
  }
}

function createClusters() {
  clusters = [];
  for (let i = 0; i < clusterCount; i++) {
    clusters.push({
      x: random(50, width - 50),
      y: random(50, height - 50)
    });
  }
}

function windowResized() {
  const { width: containerW, height: containerH } = container.getBoundingClientRect();
  if (aspectW === 0 || aspectH === 0) {
    resizeCanvas(containerW, containerH);
  } else if (containerW / containerH > aspectW / aspectH) {
    resizeCanvas((containerH * aspectW) / aspectH, containerH);
  } else {
    resizeCanvas(containerW, (containerW * aspectH) / aspectW);
  }
}

class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.angle = random(360);
    this.pangle = this.angle;

    this.speed = random(2, 5);
    this.blur = 1000;
    this.style = this.generateHSBColor();
    this.defaultColor = this.style;
  }

  generateHSBColor() {
    colorMode(HSB);
    const h = random(360);
    const s = random(50, 80);
    const b = random(80, 100);
    const generatedColor = color(h, s, b);
    colorMode(RGB);
    return generatedColor;
  }

  generatePastelColor() {
    colorMode(HSB);
    const h = random(360);
    const s = random(10, 30);
    const b = random(90, 100);
    const pastelColor = color(h, s, b);
    colorMode(RGB);
    return pastelColor;
  }

  draw() {
    push();
    strokeWeight(2);
    stroke(this.style);
    line(this.px, this.py, this.x, this.y);
    pop();
  }

  update() {
    this.px = this.x;
    this.py = this.y;

    if (mouse.x !== undefined && !exploded) {
      const distance = dist(this.x, this.y, mouse.x, mouse.y);

      if (distance < 100) {
        this.style = color(255, 255, 0);
      } else {
        this.style = this.defaultColor;
      }

      this.angle = this.getAngle(this.x, this.y, mouse.x, mouse.y);
    } else if (!exploded) {
      this.angle += random(-5, 5);
    }

    this.radian = (PI / 180) * this.angle;

    this.x += this.speed * sin(this.radian);
    this.y += this.speed * cos(this.radian);

    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.angle += 90;
    }
  }

  getAngle(x1, y1, x2, y2) {
    let rad = atan2(x2 - x1, y2 - y1);
    return (rad * 180) / PI;
  }

  spread() {
    this.angle = random(360);
    this.style = this.generatePastelColor();
  }

  explode(index) {
    const cluster = clusters[index % clusters.length];
    this.angle = this.getAngle(this.x, this.y, cluster.x, cluster.y);
    this.speed = random(5, 10);
    this.style = this.generateHSBColor();
  }

  explodeToMouse() {
    if (mouse.x !== undefined) {
      this.angle = this.getAngle(this.x, this.y, mouse.x, mouse.y);
      this.speed = random(5, 10);
      this.style = this.defaultColor;
    }
  }
}
