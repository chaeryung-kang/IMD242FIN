let particles = [];
let particleCount = 800;
let mouse = {
  x: undefined,
  y: undefined
};

let exploded = false; // Track explosion state
let clusters = []; // Store cluster positions
const clusterCount = 4; // Number of clusters

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
  createClusters(); // Initialize clusters
}

function draw() {
  fill(34, 34, 34, 20);
  rect(0, 0, width, height); // Clear screen with a transparent layer

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
    p.spread(); // Add spreading effect when mouse is out
  });
}

function mousePressed() {
  if (!exploded) {
    particles.forEach(p => {
      p.explodeToMouse(); // Move particles towards mouse on first click
    });
    exploded = true;
  } else {
    createClusters(); // Generate new cluster positions
    particles.forEach((p, index) => {
      p.explode(index); // Scatter particles to clusters on second click
    });
    exploded = false;
  }
}

function createClusters() {
  clusters = [];
  for (let i = 0; i < clusterCount; i++) {
    clusters.push({
      x: random(50, width - 50), // Ensure clusters are within canvas
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

    this.speed = random(2, 5); // Randomize speed
    this.blur = 1000;
    this.style = this.generateHSBColor(); // Generate HSB-based color
    this.defaultColor = this.style; // Store initial random color
  }

  generateHSBColor() {
    colorMode(HSB); // HSB 모드 활성화
    const h = random(360); // 전체 색상 범위에서 랜덤 선택
    const s = random(50, 80); // 적당히 높은 채도
    const b = random(80, 100); // 밝은 색상
    const generatedColor = color(h, s, b);
    colorMode(RGB); // RGB 모드로 복구
    return generatedColor;
  }

  generatePastelColor() {
    colorMode(HSB); // Switch to HSB mode
    const h = random(360); // Full hue range
    const s = random(20, 40); // Lower saturation for pastel tones
    const b = random(85, 100); // High brightness for pastel tones
    const pastelColor = color(h, s, b);
    colorMode(RGB); // Restore to RGB mode
    return pastelColor;
  }

  draw() {
    push();
    strokeWeight(1.5);
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
        this.style = color(255, 255, 0); // Change color near mouse
      } else {
        this.style = this.defaultColor; // Revert to default color
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
    this.angle = random(360); // Reset to random direction
    this.style = this.generatePastelColor(); // Assign a pastel color
  }

  explode(index) {
    // Assign particle to a specific cluster
    const cluster = clusters[index % clusters.length];
    this.angle = this.getAngle(this.x, this.y, cluster.x, cluster.y);
    this.speed = random(5, 10); // Increase speed for explosion effect
    this.style = this.generateHSBColor(); // Randomize to a new HSB color
  }

  explodeToMouse() {
    if (mouse.x !== undefined) {
      this.angle = this.getAngle(this.x, this.y, mouse.x, mouse.y); // Move towards mouse
      this.speed = random(5, 10); // Increase speed
      this.style = this.defaultColor; // Retain initial random color
    }
  }
}
