/* ================== SETUP ================== */
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const textEl = document.getElementById("text");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ================== TIME ================== */
// CHANGE THIS

let currentScene = "";
let timeInterval = null;

function startLiveTimer() {
  if (timeInterval) clearInterval(timeInterval);

  timeInterval = setInterval(() => {
    if (currentScene !== "time") return;

    const timerEl = document.getElementById("live-timer");
    if (timerEl) {
      timerEl.textContent = getTimeString();
    }
  }, 1000);
}


function stopLiveTimer() {
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
}


const startDate = new Date(2025, 11, 15, 61, 55, 0);

function getTimeString() {
  const now = new Date();
  let diff = now - startDate;

  const d = Math.floor(diff / 86400000);
  diff %= 86400000;
  const h = Math.floor(diff / 3600000);
  diff %= 3600000;
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return `${d} days\n${h} hours\n${m} minutes\n and ${s} seconds`;
}

/* ================== STORY ================== */
const story = [
  { text: "My cute wifey, tap tap through this quickly (or slowly xD) and come back home soon, hubby is missing you!", scene: "intro" },
  { text: "I made this, hubby pro, right? hihihihi", scene: "intro" },
  { text: "It's a quiet place\njust for the two of us.\n No one's watching us, don't worry, my innocent wifey, if ykyk, lol", scene: "intro" },

  { text: "At first,\nwe were just two strangers.", scene: "love" },
  { text: "Yapping.\nSmiling.\nLaughing.\nGetting curious about each other.\nRemember the scorpio thingie?", scene: "love" },
  { text: "Somewhere between\nthose moments…\n", scene: "love" },
  { text: "Something happened. Something blossomed. \n \n\n ahm, ahm, hihiihi, blossom means developing in healthy way", scene: "love" },
  { text: "Something called love.", scene: "love" },

  { text: "Even when life\nput space between us,\n nearly 6900km, wifeyyy, so far away, no?", scene: "distance" },
  { text: "Even when days\nfelt long without you,\n the sadness disappeared as soon as you appeared,\n bites wifey's arms, nomnom, so sweet,\n bites the other one as well, nomnom", scene: "distance" },
  { text: "We didn't give up on each other, and realized that we cannot live without each other", scene: "distance" },
  { text: "We chose to trust each other.", scene: "distance" },

  { text: "Time kept moving…", scene: "time" },
{
  text: "And it's been:\n<span id='live-timer'></span>\nsince we first met.",
  scene: "time"
},
  { text: "Every second,\nquietly adding up.", scene: "time" },

  { text: "And somehow…", scene: "future" },
  { text: "I feel closer to you\nthan ever.\n pulls wifey into the bed for cuddling", scene: "future" },
  { text: "If this is one month…", scene: "future" },
  { text: "I can't wait to see\nwhat comes next 🌱", scene: "future" },

  { text: "Happy First Monthiversary, My Wifey 💖", scene: "merge" },
  { text: "Why did you tap again??\n You were supposed to stop earlier, smh", scene: "merge" },
  { text: "Seriously? Again? Come back to home, hmph,\n me waiting for you, me sad, hurry up!!", scene: "merge" },
  { text: "This is the final page, stop it now,\n come back or me punish you in the bed, hihihihi", scene: "merge" },
  { text: "So, you really want to get punished huh", scene: "merge" },
  { text: "Forget it, it's our first monthiversary today,\n I'll just forgive you and just bites your lips hard and let you go, come back now.", scene: "merge" },
  { text: "Hubby loves you a lot.", scene: "merge" },
];

let storyIndex = 0;

/* ================== TEXT REVEAL ================== */

function revealText(content) {
  textEl.innerHTML = "";
  const raw = typeof content === "function" ? content() : content;

  const temp = document.createElement("div");
  temp.innerHTML = raw;

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      [...node.textContent].forEach(char => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.opacity = 0;
        textEl.appendChild(span);

        requestAnimationFrame(() => {
          span.style.transition = "opacity 0.4s ease";
          span.style.opacity = 1;
        });
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = document.createElement(node.tagName.toLowerCase());
      if (node.id) el.id = node.id;
      textEl.appendChild(el);
    }
  }

  [...temp.childNodes].forEach(walk);
}


/* ================== PARTICLES ================== */
const particles = [];
const PARTICLE_COUNT = 200;

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    r: Math.random() * 2 + 0.5,
    a: Math.random() * 0.5 + 0.2
  });
}

/* ================== CORES ================== */
const coreA = { x: canvas.width * 0.3, y: canvas.height / 2 };
const coreB = { x: canvas.width * 0.7, y: canvas.height / 2 };

let coreTargetDistance = 0.5;
let merging = false;
let mergeProgress = 0;



/* ================== SCENE CONTROL ================== */

function setScene(mode) {
  currentScene = mode;

  // stop timer unless we're in time scene
  if (mode !== "time") {
    stopLiveTimer();
  }

  if (mode === "intro") coreTargetDistance = 0.5;
  if (mode === "love") coreTargetDistance = 0.25;
  if (mode === "distance") coreTargetDistance = 0.75;
  if (mode === "time") {
    coreTargetDistance = 0.45;
    startLiveTimer(); // 🔥 THIS IS THE KEY
  }
  if (mode === "future") coreTargetDistance = 0.2;
  if (mode === "merge") merging = true;
}


/* ================== DRAW LOOP ================== */
function draw() {
  const w = canvas.width;
  const h = canvas.height;

  /* background */
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#ffe3ed");
  bg.addColorStop(0.5, "#f7c1d9");
  bg.addColorStop(1, "#d6c8ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  /* particles */
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  /* core movement */
  if (!merging) {
    const target = w * coreTargetDistance;
    coreA.x += ((w / 2 - target) - coreA.x) * 0.01;
    coreB.x += ((w / 2 + target) - coreB.x) * 0.01;

    drawCore(coreA.x, coreA.y, "rgba(255,105,180,0.45)");
    drawCore(coreB.x, coreB.y, "rgba(160,140,255,0.45)");
} else {
  // advance merge slowly
  mergeProgress = Math.min(mergeProgress + 0.006, 1);

  // positions interpolate toward center
  const ax = coreA.x + (w / 2 - coreA.x) * mergeProgress;
  const bx = coreB.x + (w / 2 - coreB.x) * mergeProgress;

  // phase control
  const overlapPhase = Math.max(0, mergeProgress - 0.4) / 0.3;
  const finalPhase = Math.max(0, mergeProgress - 0.7) / 0.3;

  // draw original cores fading out
  const fadeA = 1 - finalPhase;
  const fadeB = 1 - finalPhase;

  drawCore(
    ax,
    h / 2,
    `rgba(255,105,180,${0.45 * fadeA})`
  );
  drawCore(
    bx,
    h / 2,
    `rgba(160,140,255,${0.45 * fadeB})`
  );

  // shared glow appears during overlap
  if (overlapPhase > 0) {
    drawCore(
      w / 2,
      h / 2,
      `rgba(255,160,200,${0.25 * overlapPhase})`
    );
  }

  // final merged presence
  if (finalPhase > 0) {
    drawCore(
      w / 2,
      h / 2,
      `rgba(255,190,220,${0.5 + finalPhase * 0.4})`
    );
  }
}


  requestAnimationFrame(draw);
}

function drawCore(x, y, color) {
  const outer = 170;
  const inner = 0;

  const glow = ctx.createRadialGradient(x, y, inner, x, y, outer);
  glow.addColorStop(0, color);
  glow.addColorStop(0.6, color.replace("0.45", "0.25"));
  glow.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, outer, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color.replace("0.45", "0.8");
  ctx.beginPath();
  ctx.arc(x, y, inner, 0, Math.PI * 2);
  ctx.fill();
}

draw();

/* ================== TAP ================== */
document.body.addEventListener("click", () => {
  if (storyIndex >= story.length) return;

  const step = story[storyIndex];
  setScene(step.scene);
  revealText(step.text);

  storyIndex++;
});

/* ================== START ================== */
setScene(story[0].scene);
revealText(story[0].text);
storyIndex = 1;
