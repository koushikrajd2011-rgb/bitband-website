const CONFIG = {
  start: "2026-10-12T00:00:00",
  roundDays: 6,
  rounds: 3,
  totalDays: 21,
  themes: ["TBD (vote in Slack)", "TBD (vote in Slack)", "TBD (vote in Slack)"],
  submissions: [],
  drops: [],
  dropChance: 0.35,
  dropSeconds: 45
};
const $ = id => document.getElementById(id);
const DAY = 864e5;

function phase(now) {
  const start = new Date(CONFIG.start), end = new Date(+start + CONFIG.totalDays * DAY);
  if (now < start) return {label: "Starts in", target: start, theme: "Coming soon", round: "Not started yet"};
  if (now >= end) return {label: "Event ended", target: null, theme: "Thanks for coding!", round: "Finished"};
  const i = Math.floor((now - start) / (CONFIG.roundDays * DAY));
  if (i < CONFIG.rounds) {
    return {label: "Round ends in", target: new Date(+start + (i + 1) * CONFIG.roundDays * DAY),
      theme: CONFIG.themes[i], round: `Round ${i + 1} of ${CONFIG.rounds}`};
  }
  return {label: "Event ends in", target: end, theme: "Free build: make anything", round: "Free days"};
}

const band = $("band"), g = band.getContext("2d"), cols = ["#6c4bff", "#3ddc97", "#ffd23f", "#ffffff"];
(function drawBand() {
  const W = 180, H = 20, k = band.width / W; band.height = H * k;
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    const v = Math.sin(x * 0.15) + Math.cos(y * 0.5) + Math.sin((x + y) * 0.07);
    g.fillStyle = cols[Math.abs(Math.floor(v * 1.3)) % cols.length];
    g.fillRect(x * k, y * k, k, k);
  }
})();

if (matchMedia("(pointer: fine)").matches) {
  const chip = $("chip"), label = $("chip-label");
  document.body.classList.add("chip-on");
  const move = e => {
    chip.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    chip.style.display = "block";
  };
  addEventListener("pointermove", move, {passive: true});
  addEventListener("pointerdown", move, {passive: true});
  document.documentElement.addEventListener("mouseleave", () => chip.style.display = "none");
  document.documentElement.addEventListener("mouseenter", () => chip.style.display = "block");
  document.addEventListener("pointerover", e => {
    const t = e.target.closest ? e.target.closest("a,button,summary,[data-tip]") : null;
    chip.classList.toggle("hot", !!t);
    label.textContent = t ? (t.dataset.tip || "tap") : "";
  });
  document.addEventListener("pointerdown", e => {
    ["w1", "w2"].forEach(c => {
      const w = document.createElement("div");
      w.className = "wave " + c;
      w.style.left = e.clientX + "px";
      w.style.top = e.clientY + "px";
      document.body.append(w);
      setTimeout(() => w.remove(), 900);
    });
  });
}

const grid = $("gallery-grid");
if (!CONFIG.submissions.length) {
  grid.innerHTML = '<p class="empty">No submissions yet. Be the first to ship!</p>';
} else {
  CONFIG.submissions.forEach(s => {
    const c = document.createElement("div"); c.className = "card";
    const img = document.createElement("img"); img.src = s.art; img.alt = `${s.name}'s band art`; img.style.width = "100%";
    const a = document.createElement("a"); a.href = s.github; a.textContent = s.name;
    c.append(img, a); grid.append(c);
  });
}

if (CONFIG.drops.length && Math.random() < CONFIG.dropChance) {
  setTimeout(() => {
    const d = CONFIG.drops[Math.floor(Math.random() * CONFIG.drops.length)];
    $("drop-text").textContent = d.text; $("drop-link").href = d.link;
    $("bitdrop").hidden = false;
    setTimeout(() => $("bitdrop").hidden = true, CONFIG.dropSeconds * 1000);
  }, 8000 + Math.random() * 20000);
}
$("drop-close").onclick = () => $("bitdrop").hidden = true;