let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

let badPhrases = [
  "too oily", "too dry", "texture", "uneven tone", "dark circles",
  "wrinkles forming", "clogged pores", "red patches", "fine lines",
  "blemish detected", "imperfection", "not smooth", "pigmentation"
];

let floatingText = [];

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.parent("section1");

  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  image(video, 0, 0, width, height);

  for (let face of faces) {
    for (let kp of face.keypoints) {
      fill(255, 140, 160);
      noStroke();
      circle(kp.x, kp.y, 5);
    }

    if (frameCount % 20 === 0) {
      let kp = random(face.keypoints);
      floatingText.push({
        text: random(badPhrases),
        x: kp.x,
        y: kp.y,
        alpha: 255,
        size: random(14, 22),
        dx: random(-0.5, 0.5),
        dy: random(-0.5, 0.5)
      });
    }
  }

  for (let i = floatingText.length - 1; i >= 0; i--) {
    let t = floatingText[i];

    fill(255, 0, 0, t.alpha);
    noStroke();
    textSize(t.size);
    text(t.text, t.x, t.y);

    t.x += t.dx;
    t.y += t.dy;
    t.alpha -= 0.3;

    if (t.alpha <= 0) {
      floatingText.splice(i, 1);
    }
  }

  updateDermPanel();
}

function gotFaces(results) {
  faces = results;
}

function updateDermPanel() {
  const panel = document.getElementById("dermaPanel");
  if (!panel) return;

  panel.innerHTML = `
    <strong>DERMATOLOGY SCAN // ACTIVE</strong><br><br>
    REDNESS INDEX: ${nf(noise(frameCount * 0.01), 1, 2)}<br>
    TEXTURE VARIANCE: ${(noise(frameCount * 0.02) * 20).toFixed(1)}<br>
    PORE DENSITY: ${Math.floor(noise(frameCount * 0.015) * 200 + 50)}/cm²<br>
    WRINKLE PROBABILITY: ${Math.floor(noise(frameCount * 0.03) * 100)}%<br>
    IDEAL DEVIATION: ${(noise(frameCount * 0.025) * 20 - 10).toFixed(1)}%<br>
    SEBUM INDEX: ${nf(noise(frameCount * 0.018), 1, 2)}
  `;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
}
