import Punct from "./Punct.js";
import Intersectie from "./Intersectie.js";
import Strada from "./Strada.js";
import { simuleazaTrafic, deseneazaMasini, initTrafic } from "./trafic.js";
import SemaforBanda from "./Semafor.js";
import { calculeazaMatriceCompatibilitate, segmenteSeIntersecteaza} from './logicaSemafoare.js';
import GrupaSemafor from "./GrupaSemafor.js"; // asigură-te că ai importat
import { determinaFazeSemafor } from "./logicaSemafoare.js";


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let scale = 1, offsetX = 0, offsetY = 0;
let intersectii = [];

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  drawScene();
}

window.addEventListener("resize", resizeCanvas);

function drawScene() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  for (let inter of intersectii) {
    inter.deseneaza(ctx);
  }

  deseneazaMasini(ctx);
}
function reconstructFromJSON(data) {
    console.log(data);
  intersectii = [];

  const inter = data;
  const puncte = inter.listaVarfuri.map(p => new Punct(p.x, p.y));
  const intersectie = new Intersectie(puncte);

  intersectie.listaStrazi = inter.listaStrazi.map(s => {
    const strada = new Strada(intersectie, s.indexLatura, s.pozitiePeLatura);
    strada.benziIn = s.benziIn;
    strada.benziOut = s.benziOut;
    strada.lungime = s.lungime;
    strada.trecerePietoni = s.trecerePietoni;
    strada.semafoare = s.semafoare;
    return strada;
  });

  intersectie.trasee = inter.trasee.map(t => ({
    stradaIndex: t.stradaIndex,
    bandaIndex: t.bandaIndex,
    puncte: t.puncte.map(p => new Punct(p.x, p.y))
  }));

  intersectii.push(intersectie);

  // 🔍 Calculăm bounding box-ul intersecției
  const puncteTotale = intersectie.listaVarfuri;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  puncteTotale.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  const latime = maxX - minX;
  const inaltime = maxY - minY;

  const padding = 300; // spațiu liber în jur
  const scaleX = (canvas.width - padding) / latime;
  const scaleY = (canvas.height - padding) / inaltime;
  scale = Math.min(scaleX, scaleY);

  // 🔄 Calculăm centrul intersecției și poziționăm în centrul canvasului
  const centruX = minX + latime / 2;
  const centruY = minY + inaltime / 2;

  offsetX = canvas.width / 2 - centruX * scale;
  offsetY = canvas.height / 2 - centruY * scale;

  drawScene();
}

// Suport zoom
canvas.addEventListener('wheel', function (e) {
  if (!e.ctrlKey) return;
  e.preventDefault();

  const zoomFactor = 1.1;
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const wx = (mouseX - offsetX) / scale;
  const wy = (mouseY - offsetY) / scale;

  scale *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
  offsetX = mouseX - wx * scale;
  offsetY = mouseY - wy * scale;
  drawScene();
}, { passive: false });

// Drag cu click-dreapta
let isDragging = false;
canvas.addEventListener('mousedown', e => {
  if (e.button === 2) {
    isDragging = true;
    dragStartX = e.offsetX;
    dragStartY = e.offsetY;
  }
});
canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);
canvas.addEventListener('mousemove', e => {
  if (isDragging) {
    const dx = e.offsetX - dragStartX;
    const dy = e.offsetY - dragStartY;
    offsetX += dx;
    offsetY += dy;
    dragStartX = e.offsetX;
    dragStartY = e.offsetY;
    drawScene();
  }
});
canvas.addEventListener('contextmenu', e => e.preventDefault());

// Inițializează
if (window.data) {
    console.log(data);
  reconstructFromJSON(window.data);
    console.log("✅ Intersecție încărcată cu succes.");
    console.log(data);

    const semafoareSerializate = window.data.intersectii[0].strazi[0].semafoare; // tu le-ai pus acolo
    let intersectie = intersectii[0]; // presupunem că avem doar o intersecție

    const grupeSemafor = semafoareSerializate.map(grupa => {
    const semafoare = grupa.semafoare.map(s =>
        new SemaforBanda(intersectie, s.stradaIndex, s.bandaIndex)
    );
    const g = new GrupaSemafor(grupa.culoare, grupa.durata, semafoare);
    g.changeColor(grupa.culoare);
    return g;
    });
      
      // 💡 Desenăm semafoarele
      for (let grupa of grupeSemafor) {
  for (let sem of grupa.semafoare) {
    sem.deseneaza(ctx);
    console.log(`Semafoar banda ${sem.stradaIndex}-${sem.bandaIndex} desenat.`);
  }
}
    
//   initTrafic(drawScene);
//   simuleazaTrafic(intersectii, 10); // nr. de mașini inițiale

} else {
  console.error("❌ Nu s-au primit date pentru intersecție.");
}





