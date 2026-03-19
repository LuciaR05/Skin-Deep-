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
let sciImgs = [];
let floatingImgs = [];
let maxSciImages = 3;

function preload() {
  faceMesh = ml5.faceMesh(options);

  for (let i = 1; i <= 10; i++) {
    sciImgs.push(loadImage("scientific" + i + ".jpg"));
  }
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

    if (frameCount % 120 === 0 && floatingImgs.length < maxSciImages) {
      spawnScientificImages(face);
    }
  }

  for (let t of floatingText) {
    fill(255, 0, 0, t.alpha);
    textSize(t.size);
    text(t.text, t.x, t.y);
    t.x += t.dx;
    t.y += t.dy;
    t.alpha -= 0.3;
  }

  for (let i = floatingImgs.length - 1; i >= 0; i--) {
    let img = floatingImgs[i];
    image(img.img, img.x, img.y, img.w, img.h);
    if (millis() - img.born > img.life) floatingImgs.splice(i, 1);
  }

  updateDermPanel();
}

function spawnScientificImages(face) {
  let cx = (face.box.xMin + face.box.xMax) / 2;
  let cy = (face.box.yMin + face.box.yMax) / 2;
  let fw = face.box.xMax - face.box.xMin;

  for (let i = 0; i < 2; i++) {
    if (floatingImgs.length >= maxSciImages) return;

    let img = random(sciImgs);
    let scale = 0.6;

    floatingImgs.push({
      img,
      w: img.width * scale,
      h: img.height * scale,
      x: cx + random(-fw * 1.5, fw * 1.5),
      y: cy + random(-fw * 1.5, fw * 1.5),
      born: millis(),
      life: random(5000, 7000)
    });
  }
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
