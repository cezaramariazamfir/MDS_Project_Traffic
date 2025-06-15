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
let indexxx = null;


const json = localStorage.getItem("intersectie_simulare");

if (json) {
    const inter = JSON.parse(json);

    // ✅ Dacă vrei să îl atașezi la `window.data`, o poți face:
    window.data = inter;

    // ✅ Apelezi reconstructFromJSON() cu obiectul primit
    reconstructFromJSON(inter);

    // ✅ Ștergi din localStorage ca să nu rămână pentru totdeauna
    localStorage.removeItem("intersectie_simulare");

    initSimulare();
} else {
    initSimulare(); // dacă nu există date, pornește simularea fără intersecție
}

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

let currentGrupaIndex = 0;

function startSemafoareCycle() {
  if (grupeSemafor.length === 0) return;

  // Setează toate semafoarele pe roșu
  grupeSemafor.forEach(grupa => {
    grupa.changeColor("red");
  });

  // Activează grupa curentă
    const grupaCurenta = grupeSemafor[currentGrupaIndex];
    grupaCurenta.changeColor("green");

  // Re-desenează scena
  drawScene();

  // Așteaptă durata grupei curente, apoi trece la următoarea
  const durata = grupaCurenta.time || 10; // secunde
  setTimeout(() => {
    currentGrupaIndex = (currentGrupaIndex + 1) % grupeSemafor.length;
    startSemafoareCycle();
  }, durata * 1000);
}



function drawScene(fazaIndex = indexxx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0,scale, offsetX, offsetY);

  // Desenează intersecțiile
  for (let inter of intersectii) {
    inter.deseneaza(ctx);
  }

  // Dacă s-a transmis un index de fază valid
  if (fazaIndex !== null && grupeSemafor[fazaIndex]) {
    const grupa = grupeSemafor[fazaIndex];
    
    // Desenează doar traseele asociate semafoarelor din acea grupă
    for (let semafor of grupa.semafoare) {
      const trasee = intersectii[0].trasee.filter(t =>
        t.stradaIndex === semafor.stradaIndex &&
        t.bandaIndex === semafor.bandaIndex
      );

      for (let traseu of trasee) {
        if (traseu.puncte.length > 1) {
          ctx.beginPath();
          ctx.moveTo(traseu.puncte[0].x, traseu.puncte[0].y);
          for (let i = 1; i < traseu.puncte.length; i++) {
            ctx.lineTo(traseu.puncte[i].x, traseu.puncte[i].y);
          }
          ctx.strokeStyle = "orange";
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          ctx.stroke();
        }
      }
    }

    // Desenează doar semafoarele din acea grupă
    for (let semafor of grupa.semafoare) {
      semafor.deseneaza(ctx);
    }

  } else {
    // Desenează toate traseele și semafoarele
    deseneazaTraseeSalvate();

    for (let grupa of grupeSemafor) {
      for (let sem of grupa.semafoare) {
        sem.deseneaza(ctx);
      }
    }
  }

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

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
const latime = maxX - minX;
const inaltime = maxY - minY;

const padding = 300;
const scaleX = (canvas.width - padding) / latime;
const scaleY = (canvas.height - padding) / inaltime;
scale = Math.min(scaleX, scaleY);

const centruX = minX + latime / 2;
const centruY = minY + inaltime / 2;

offsetX = canvas.width / 2 - centruX * scale; 
offsetY = canvas.height / 2 - centruY * scale;
window.intersectii = intersectii;
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
function initSimulare() {
  if (window.data) {
      reconstructFromJSON(window.data);

      setTimeout(() => {
          const intersectie = intersectii[0];

          const compatibilitate = calculeazaMatriceCompatibilitate(intersectie);
          const fazeTrasee = determinaFazeSemafor(compatibilitate, intersectie.trasee);

          const vector_semafoare = [];

          // 🔍 1. Construiește semafoarele o singură dată, pentru toate benzile IN din toate traseele
          // const trasee = intersectie.trasee || [];
          // for (let traseu of trasee) {
          //     const dejaExista = vector_semafoare.some(
          //         s => s.stradaIndex === traseu.stradaIndex && s.bandaIndex === traseu.bandaIndex
          //     );

          //     if (!dejaExista) {
          //         vector_semafoare.push(new SemaforBanda(intersectie, traseu.stradaIndex, traseu.bandaIndex));
          //     }
          // }

          // let estePrimaFaza = true;
          // for (let faza of fazeTrasee) {
          //     const semafoareSet = new Set();

          //     for (let idxTraseu of faza) {
          //         const traseu = intersectie.trasee[idxTraseu];

          //         const semafor = vector_semafoare.find(
          //             s => s.stradaIndex === traseu.stradaIndex && s.bandaIndex === traseu.bandaIndex
          //         );

          //         if (semafor) {
          //             // Folosim un ID unic pentru fiecare semafor ca cheie în Set
          //             const cheieUnica = `${semafor.stradaIndex}_${semafor.bandaIndex}`;
          //             semafoareSet.add(cheieUnica);
          //         }
          //     }

          //     // Refacem vectorul de obiecte efective din cheile unice
          //     const semafoareFaza = [...semafoareSet].map(cheie => {
          //         const [stradaIndex, bandaIndex] = cheie.split("_").map(Number);
          //         return vector_semafoare.find(s => s.stradaIndex === stradaIndex && s.bandaIndex === bandaIndex);
          //     });

          //     let culoare = estePrimaFaza ? "green" : "red";
          //     const grupa = new GrupaSemafor(culoare, 10, semafoareFaza);
          //     grupa.changeColor(culoare);
          //     grupeSemafor.push(grupa);
          //     estePrimaFaza = false;
          // }

        const trasee = intersectie.trasee || [];

        // 1. Grupare trasee pe bandă și inițializare semafoare
        const bandaToTrasee = new Map();
        const benziUnice = new Set();

        for (let i = 0; i < trasee.length; i++) {
            const t = trasee[i];
            const cheie = `${t.stradaIndex}_${t.bandaIndex}`;

            if (!bandaToTrasee.has(cheie)) bandaToTrasee.set(cheie, []);
            bandaToTrasee.get(cheie).push(i);

            if (!benziUnice.has(cheie)) {
                benziUnice.add(cheie);
                vector_semafoare.push(new SemaforBanda(intersectie, t.stradaIndex, t.bandaIndex));
            }
        }

        // 2. Calculăm ultima fază în care apare fiecare bandă
        const bandaUltimaFaza = new Map();

        for (let i = 0; i < fazeTrasee.length; i++) {
            const faza = fazeTrasee[i];
            for (let idx of faza) {
                const t = trasee[idx];
                const cheie = `${t.stradaIndex}_${t.bandaIndex}`;
                bandaUltimaFaza.set(cheie, i); // suprascriem pentru a reține ultima fază
            }
        }

        // 3. Construim grupele de semafoare pentru fiecare fază
        let estePrimaFaza = true;

        for (let faza of fazeTrasee) {
            const semafoareSet = new Set();
            const fazaIndex = fazeTrasee.indexOf(faza);

            for (let [cheie, traseeIdxList] of bandaToTrasee.entries()) {
                const existaCelPutinUnul = traseeIdxList.some(idx => faza.includes(idx));
                const esteUltimaFaza = bandaUltimaFaza.get(cheie) === fazaIndex;

                // ✅ punem semaforul doar în ultima fază în care apare traseu de pe bandă
                if (existaCelPutinUnul && esteUltimaFaza) {
                    const [stradaIndex, bandaIndex] = cheie.split("_").map(Number);
                    const semafor = vector_semafoare.find(s =>
                        s.stradaIndex === stradaIndex && s.bandaIndex === bandaIndex
                    );
                    if (semafor) {
                        semafoareSet.add(cheie);
                    }
                }
            }

            // Transformăm cheile în obiecte semafor
            const semafoareFaza = [...semafoareSet].map(cheie => {
                const [stradaIndex, bandaIndex] = cheie.split("_").map(Number);
                return vector_semafoare.find(s => s.stradaIndex === stradaIndex && s.bandaIndex === bandaIndex);
            });

            const culoare = estePrimaFaza ? "green" : "red";
            const grupa = new GrupaSemafor(culoare, 10, semafoareFaza);
            grupa.changeColor(culoare);
            grupeSemafor.push(grupa);

            estePrimaFaza = false;
        }

          


          // Adaugă inputuri pentru durată faze
          const fazeInputContainer = document.getElementById("faze-inputuri");
          fazeInputContainer.innerHTML = ""; // curăță dacă e re-generat

          grupeSemafor.forEach((grupa, index) => {
              const wrapper = document.createElement("div");
              wrapper.style.marginBottom = "10px";

              const label = document.createElement("label");
              label.textContent = `Faza ${index + 1}: `;
              label.style.color = "#fff";
              label.style.marginRight = "10px";

              const input = document.createElement("input");
              input.type = "number";
              input.min = 1;
              input.value = grupa.time || 10; // folosește durata existentă
              input.style.padding = "5px";
              input.style.borderRadius = "5px";
              input.style.border = "1px solid #ccc";
              input.style.width = "80px";

              // Actualizează obiectul grupa când se modifică inputul
              input.addEventListener("input", () => {
                  const valoare = parseInt(input.value, 10);
                  if (!isNaN(valoare) && valoare > 0) {
                      grupa.time = valoare;
                  }
              });
              input.addEventListener("mouseenter", () => {
                drawScene(index);
                indexxx = index; 
              });

              input.addEventListener("mouseleave", () => {
                indexxx = null;
              });

              wrapper.appendChild(label);
              wrapper.appendChild(input);
              fazeInputContainer.appendChild(wrapper);
          });        console.log("grupe semafoare", grupeSemafor);
          
          // Setează grupele de semafoare la nivel global pentru ca mașinile să le poată accesa
          window.grupeSemafor = grupeSemafor;
          
          startSemafoareCycle();

      }, 1000);    // Inițializează TrafficSimulator
      trafficSimulator = new TrafficSimulator();
      
      // Inițializează simulatorul cu intersecțiile și callback-ul de desenare
      trafficSimulator.initialize(intersectii, drawScene);
      
      // Expune funcția de restabilire a sidebar-ului la nivel global
      window.restoreOriginalSidebar = restoreOriginalSidebar;
      
      // Inițializează sistemul de trafic pentru animația mașinilor
      initTrafic(drawScene);
      
      // Așteaptă puțin pentru ca UI-ul să se încarce complet, apoi pornește simularea
      setTimeout(() => {
          const flowsMatrix = trafficSimulator.getFlowsGroupedByTrafficLight();
          console.log("---------------------->Fluxuri grupate pe grupe de semafoare:", flowsMatrix);
          const simulationStarted = trafficSimulator.startSimulation();
          if (simulationStarted) {
              
              // Actualizează contoarele la fiecare 2 secunde
              const updateInterval = setInterval(() => {
                  if (trafficSimulator && trafficSimulator.isActive()) {
                      trafficSimulator.updateCounterDisplay();
                  }
              }, 2000);
              
              // Stochează intervalul pentru a putea fi oprit mai târziu
              window.counterUpdateInterval = updateInterval;
          }else {
              console.error("❌ Nu s-a putut porni simularea!");
          }
      }, 2000);

    // porneşte imediat după ce trafficSimulator este iniţializat
    let lastFlowsString = null;  // variabilă globală pentru comparație

    const flowInterval = setInterval(() => {
      if (!trafficSimulator || !trafficSimulator.isActive()) {
        clearInterval(flowInterval);
        console.log("--------> Flow-logger oprit - simularea nu mai rulează.");
        return;
      }

      const flowsMatrix = trafficSimulator.getFlowsGroupedByTrafficLight();
      const currentFlowsString = JSON.stringify(flowsMatrix);  // serializat pt. comparație

      if (currentFlowsString !== lastFlowsString) {
        lastFlowsString = currentFlowsString;  // actualizez cache-ul

        const cleanedNested = flowsMatrix.map(group =>
          group.map(v => parseInt(v))
        );


        console.log(
          "---------------------->Fluxuri grupate pe grupe de semafoare:",
          cleanedNested
        );

        function getCSRFToken() {
            const el = document.querySelector('meta[name="csrf-token"]');
            return el ? el.getAttribute('content') : '';
        }

        fetch("/Skibidi_traffic/js_to_py",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
          },
          body: JSON.stringify({ flows: cleanedNested })
        })
        .then(response => response.json())
        .then(data => {
          console.log("✅ Răspuns primit de la backend:");

          if (data.results && Array.isArray(data.results)) {
            const container = document.getElementById("faze-inputuri");
            container.innerHTML = ""; // curățăm inputurile vechi

            data.results.forEach((durata, index) => {
              const wrapper = document.createElement("div");
              wrapper.style.marginBottom = "10px";

              const label = document.createElement("label");
              label.textContent = `Faza ${index + 1}: `;
              label.style.color = "#fff";
              label.style.marginRight = "10px";

              const input = document.createElement("input");
              input.type = "number";
              input.min = 1;
              input.value = durata;
              input.style.padding = "5px";
              input.style.borderRadius = "5px";
              input.style.border = "1px solid #ccc";
              input.style.width = "80px";

              // 🔁 Dacă există grupeSemafor, actualizează și în memorie
              if (window.grupeSemafor && window.grupeSemafor[index]) {
                window.grupeSemafor[index].time = durata;
              }

              input.addEventListener("input", () => {
                const val = parseInt(input.value, 10);
                if (!isNaN(val) && val > 0 && window.grupeSemafor[index]) {
                  window.grupeSemafor[index].time = val;
                }
              });

              input.addEventListener("mouseenter", () => {
                drawScene(index);
                indexxx = index;
              });

              input.addEventListener("mouseleave", () => {
                indexxx = null;
              });

              wrapper.appendChild(label);
              wrapper.appendChild(input);
              container.appendChild(wrapper);
            });
          } else {
            console.warn("⚠️ Nu am primit rezultate valide pentru faze.");
          }
        })


        .catch(error => {
          console.error("Eroare la trimiterea către backend:", error);
        });
      } 

    }, 2000);
    // rulează la fiecare 2 s; ajustează după nevoie

    // (opţional) îl facem accesibil global pentru debugging
    window.flowInterval = flowInterval;


  } else {
    console.error(" Nu s-au primit date pentru intersecție.");
  }
}
