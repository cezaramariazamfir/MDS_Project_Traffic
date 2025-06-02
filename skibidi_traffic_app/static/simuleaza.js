import Punct from "./Punct.js";
import Intersectie from "./Intersectie.js";
import Strada from "./Strada.js";
import { simuleazaTrafic, deseneazaMasini, initTrafic } from "./trafic.js";
import SemaforBanda from "./Semafor.js";
import { calculeazaMatriceCompatibilitate, segmenteSeIntersecteaza} from './logicaSemafoare.js';
import GrupaSemafor from "./GrupaSemafor.js"; // asigură-te că ai importat
import { determinaFazeSemafor } from "./logicaSemafoare.js";
import { TrafficSimulator } from "./trafficsimulator.js";


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let grupeSemafor = [];
let scale = 1, offsetX = 0, offsetY = 0;
let intersectii = [];
let trafficSimulator = null;
let dragStartX = 0, dragStartY = 0;

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  drawScene();
}

function deseneazaTraseeSalvate() {
  for (let inter of intersectii) {
    if (!Array.isArray(inter.trasee)) continue;
    for (let traseu of inter.trasee) {
      if (traseu.puncte.length > 1) {
        ctx.beginPath();
        ctx.moveTo(traseu.puncte[0].x, traseu.puncte[0].y);
        for (let i = 1; i < traseu.puncte.length; i++) {
          ctx.lineTo(traseu.puncte[i].x, traseu.puncte[i].y);
        }
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]); // Linie 5px, spațiu 5px
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
}

window.addEventListener("resize", resizeCanvas);

function drawScene() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  for (let inter of intersectii) {
    inter.deseneaza(ctx);
  }
  deseneazaTraseeSalvate();

  deseneazaMasini(ctx);
}

/**
 * Restabilește sidebar-ul la starea originală
 */
function restoreOriginalSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div id="title_sidebar">Panou de control <br> elemente de simulare</div>
    `;
  }
  
  // Oprește intervalul de actualizare a contorilor
  if (window.counterUpdateInterval) {
    clearInterval(window.counterUpdateInterval);
    window.counterUpdateInterval = null;
  }
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
    console.log("🔍 Date primite din backend:", window.data);
    reconstructFromJSON(window.data);
    console.log("✅ Intersecție încărcată cu succes.");
    console.log("🔍 Intersecții rezultate:", intersectii);

    setTimeout(() => {
        const intersectie = intersectii[0];

        const compatibilitate = calculeazaMatriceCompatibilitate(intersectie);
        const fazeTrasee = determinaFazeSemafor(compatibilitate);

        const vector_semafoare = [];

        // 🔍 1. Construiește semafoarele o singură dată, pentru toate benzile IN din toate traseele
        const trasee = intersectie.trasee || [];
        for (let traseu of trasee) {
            const dejaExista = vector_semafoare.some(
                s => s.stradaIndex === traseu.stradaIndex && s.bandaIndex === traseu.bandaIndex
            );

            if (!dejaExista) {
                vector_semafoare.push(new SemaforBanda(intersectie, traseu.stradaIndex, traseu.bandaIndex));
            }
        }

        let estePrimaFaza = true;
        for (let faza of fazeTrasee) {
            const semafoareSet = new Set();

            for (let idxTraseu of faza) {
                const traseu = intersectie.trasee[idxTraseu];

                const semafor = vector_semafoare.find(
                    s => s.stradaIndex === traseu.stradaIndex && s.bandaIndex === traseu.bandaIndex
                );

                if (semafor) {
                    // Folosim un ID unic pentru fiecare semafor ca cheie în Set
                    const cheieUnica = `${semafor.stradaIndex}_${semafor.bandaIndex}`;
                    semafoareSet.add(cheieUnica);
                }
            }

            // Refacem vectorul de obiecte efective din cheile unice
            const semafoareFaza = [...semafoareSet].map(cheie => {
                const [stradaIndex, bandaIndex] = cheie.split("_").map(Number);
                return vector_semafoare.find(s => s.stradaIndex === stradaIndex && s.bandaIndex === bandaIndex);
            });

            let culoare = estePrimaFaza ? "green" : "red";
            const grupa = new GrupaSemafor(culoare, 10, semafoareFaza);
            grupa.changeColor(culoare);
            grupeSemafor.push(grupa);
            estePrimaFaza = false;
        }

        console.log("✅ Grupe de semafoare generate:", grupeSemafor);

        // 💡 Desenăm semafoarele
        for (let grupa of grupeSemafor) {
            for (let sem of grupa.semafoare) {
                sem.deseneaza(ctx);
            }
        }

        // Opțional, salvează global
        window.grupeSemafor = grupeSemafor;

    }, 1000);    // Inițializează TrafficSimulator
    console.log("🚀 Creez TrafficSimulator...");
    trafficSimulator = new TrafficSimulator();
    console.log("✅ TrafficSimulator creat:", trafficSimulator);
    
    // Inițializează simulatorul cu intersecțiile și callback-ul de desenare
    console.log("✅ Simulator și intersecții verificate, continuăm...");
    trafficSimulator.initialize(intersectii, drawScene);
    console.log("✅ Simulator inițializat cu intersecțiile");
    
    // Expune funcția de restabilire a sidebar-ului la nivel global
    window.restoreOriginalSidebar = restoreOriginalSidebar;
    
    // Inițializează sistemul de trafic pentru animația mașinilor
    console.log("🚀 Inițializez sistemul de trafic...");
    initTrafic(drawScene);
    
    // Așteaptă puțin pentru ca UI-ul să se încarce complet, apoi pornește simularea
    setTimeout(() => {
        console.log("🚀 Pornesc simularea de trafic...");
        const simulationStarted = trafficSimulator.startSimulation();
        if (simulationStarted) {
            console.log("✅ Simularea a fost pornită cu succes!");
            console.log("🔍 isSimulationActive:", trafficSimulator.isSimulationActive);
            
            // Actualizează contoarele la fiecare 2 secunde
            const updateInterval = setInterval(() => {
                if (trafficSimulator && trafficSimulator.isActive()) {
                    trafficSimulator.updateCounterDisplay();
                }
            }, 2000);
            
            // Stochează intervalul pentru a putea fi oprit mai târziu
            window.counterUpdateInterval = updateInterval;
        } else {
            console.error("❌ Nu s-a putut porni simularea!");
        }
    }, 500);

} else {
  console.error("❌ Nu s-au primit date pentru intersecție.");
}





