import { 
    getCuloareAleatoare, 
    deseneazaSedan, 
    deseneazaSUV, 
    deseneazaSport, 
    deseneazaMotocicleta,
    deseneazaAutobuz,
    deseneazaCamion,
    deseneazaTaxi,
    deseneazaPolitie,
    getDimensiuniVehicul
} from './DesignMasini.js';

// (înainte de declarația clasei)
// asumăm că window.grupeSemafor este un array de instanțe GrupaSemafor
// iar fiecare semafor are proprietățile: banda: { x, y }, status: "red"/"green"/"yellow"

/**
 * Returnează true dacă semaforul care controlează următorul punct din traseu
 * e roșu/galben și, în următorul pas (viteza curentă), mașina ar trece linia semaforului.
 */
function isRedLightAhead(masina) {
    // 1) Dacă nu există grupă de semafoare, nu oprim.
    if (!window.grupeSemafor || !Array.isArray(window.grupeSemafor)) {
        return false;
    }

    const nextPoint = masina.gasestePunctulUrmator();
    if (!nextPoint) {
        return false;
    }

    let semaforGasit = null;
    for (const grupa of window.grupeSemafor) {
        if (!Array.isArray(grupa.semafoare)) continue;
        for (const semafor of grupa.semafoare) {
            const dx = semafor.banda.x - nextPoint.x;
            const dy = semafor.banda.y - nextPoint.y;
            const distPunctLaSem = Math.hypot(dx, dy);
            if (distPunctLaSem <= 30) {
                semaforGasit = semafor;
                break;
            }
        }
        if (semaforGasit) break;
    }

    if (!semaforGasit) {
        return false;
    }

    // 4) Dacă semaforul e verde, nu oprim
    if (semaforGasit.status === "green") {
        return false;
    }

    // 5) Calculăm distanța de la centrul mașinii la semafor
    const dxS = semaforGasit.banda.x - masina.x;
    const dyS = semaforGasit.banda.y - masina.y;
    const distCenter = Math.hypot(dxS, dyS);

    // 6) Definim stopBuffer
    const stopBuffer = masina.lungime * 0.5 + 5;

    // 7) Debug - decomentează pentru a vedea ce se întâmplă
    // console.log(`Mașina la (${masina.x.toFixed(1)}, ${masina.y.toFixed(1)}), semafor ${semaforGasit.status}, dist: ${distCenter.toFixed(1)}, buffer: ${stopBuffer.toFixed(1)}`);

    // Returnăm true dacă în următorul pas am trece de linia semaforului
    return distCenter <= stopBuffer + masina.viteza;
}

export function checkAllCarsForGreenLight() {
    for (const masina of masini) {
        if (masina.opreste && !isRedLightAhead(masina)) {
            masina.opreste = false;
            masina.viteza = masina.vitezaMaxima;
        }
    }
}


class Masina {
    constructor(x, y, unghi, tipMasina = 0, viteza = 2, routeId = null) {
        // Poziția și orientarea
        this.x = x;
        this.y = y;
        this.unghi = unghi; // în radiani

        this.tipMasina = tipMasina; 
        this.viteza = viteza;
        this.vitezaMaxima = viteza;
        
        // Dimensiuni
        const dimensiuni = getDimensiuniVehicul(tipMasina);
        this.lungime = dimensiuni.lungime;
        this.latime  = dimensiuni.latime;
        
        // Traseu
        this.punctStart = null;
        this.punctEnd = null;
        this.traseu = [];       // lista de puncte (obj. {x, y})
        this.indexTraseu = 0;   // indexul punctului următor de atins
        
        // Stări
        this.activa = true;
        this.opreste = false;

        // Culoare
        this.culoare = getCuloareAleatoare(this.tipMasina);

        // ID-ul rutei (folosit la server sau la notificare)
        this.routeId = routeId || null;
    }
    
    setTraseu(punctStart, punctEnd, traseu) {
        this.punctStart = punctStart;
        this.punctEnd = punctEnd;
        this.traseu = traseu || [punctStart, punctEnd];
        this.indexTraseu = 0;
    }

    actualizeaza() {
    // 1. ÎNTOTDEAUNA verificăm starea semaforului
    const redLight = isRedLightAhead(this);
    
    if (redLight && !this.opreste) {
        // Semafor roșu/galben și nu suntem deja opriți -> oprim
        this.viteza = 0;
        this.opreste = true;
        return;
    } else if (!redLight && this.opreste) {
        // Semafor verde și suntem opriți -> repornim
        
        this.opreste = false;
        this.viteza = this.vitezaMaxima;
        // Nu returnăm aici - continuăm cu restul logicii
    }
    
    // Dacă suntem încă opriți din cauza semaforului, nu facem nimic altceva
    if (this.opreste && redLight) {
        return;
    }

    let punctTinta = this.gasestePunctulUrmator();
    if (!punctTinta) {
        this.activa = false;
        return;
    }
    const dx = punctTinta.x - this.x;
    const dy = punctTinta.y - this.y;
    const distanta = Math.hypot(dx, dy);

    // 3. FIX: Verificăm coliziuni doar cu mașinile care sunt pe aceeași rută (routeId)
    // și în fața noastră (mai aproape de destinație)
    const distantaSiguranta = this.lungime + 15; 
    let blocked = false;
    
    for (const m of getMasini()) {
        if (m === this) continue;
        
        // Verificăm doar mașinile de pe aceeași rută
        if (this.routeId && m.routeId && this.routeId === m.routeId) {
            const dxM = m.x - this.x;
            const dyM = m.y - this.y;
            const distanteLaMasina = Math.hypot(dxM, dyM);
            
            // Verificăm dacă mașina e în fața noastră (mai aproape de destinație)
            const distantaNoastraLaDestinatie = Math.hypot(
                this.punctEnd.x - this.x, 
                this.punctEnd.y - this.y
            );
            const distantaEiLaDestinatie = Math.hypot(
                m.punctEnd.x - m.x, 
                m.punctEnd.y - m.y
            );
            
            // Doar dacă e în fața noastră și prea aproape
            if (distantaEiLaDestinatie < distantaNoastraLaDestinatie && 
                distanteLaMasina < distantaSiguranta) {
                
                // Oprire completă dacă sunt foarte aproape
                if (distanteLaMasina < this.lungime * 0.6) {
                    this.viteza = 0;
                    blocked = true;
                    break;
                }
                // Încetinire dacă sunt în zona de siguranță
                else if (distanteLaMasina < distantaSiguranta) {
                    if (m.viteza > 0) {
                        this.viteza = Math.min(this.vitezaMaxima, m.viteza * 0.8);
                    } else {
                        this.viteza = Math.max(0, this.viteza - 0.2);
                    }
                    blocked = true;
                    break;
                }
            }
        }
    }
    
    if (blocked) {
        return;
    }

    // 4. Dacă nu e blocaj, accelerăm până la viteza maximă
    this.viteza = Math.min(this.vitezaMaxima, this.viteza + 0.1);

    // 5. Dacă suntem aproape de punctul țintă, trecem la următorul
    if (distanta < 10) {
        this.indexTraseu++;
        return;
    }

    // 6. Rotează și deplasează mașina către punctul țintă
    const unghiTinta = Math.atan2(dy, dx);
    this.unghi = unghiTinta;
    this.x += Math.cos(this.unghi) * this.viteza;
    this.y += Math.sin(this.unghi) * this.viteza;
}

// FIX 2: Îmbunătățește funcția isRedLightAhead pentru debugging

    
    gasestePunctulUrmator() {
        if (this.indexTraseu >= this.traseu.length) {
            return null;
        }
        return this.traseu[this.indexTraseu];
    }
    
    deseneaza(ctx) {
        if (!this.activa) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.unghi);
        
        switch(this.tipMasina) {
            case 0: deseneazaSedan(ctx, this); break;
            case 1: deseneazaSUV(ctx, this); break;
            case 2: deseneazaSport(ctx, this); break;
            case 3: deseneazaMotocicleta(ctx, this); break;
            case 4: deseneazaAutobuz(ctx, this); break;
            case 5: deseneazaCamion(ctx, this); break;
            case 6: deseneazaTaxi(ctx, this); break;
            case 7: deseneazaPolitie(ctx, this); break;
            default: deseneazaSedan(ctx, this); break;
        }
        
        ctx.restore();
    }
    
    aAjunsLaDestinatie() {
        if (!this.punctEnd) return false;
        const dx = this.punctEnd.x - this.x;
        const dy = this.punctEnd.y - this.y;
        const distanta = Math.hypot(dx, dy);
        return distanta < 15;
    }
    
    opreste() {
        this.opreste = true;
        this.viteza = 0;
    }
    
    porneste() {
        this.opreste = false;
        this.viteza = this.vitezaMaxima;
    }
    
    setViteza(vitezaNoua) {
        this.viteza = vitezaNoua;
        this.vitezaMaxima = vitezaNoua;
    }
    
    reset(x, y, unghi) {
        this.x = x;
        this.y = y;
        this.unghi = unghi;
        this.indexTraseu = 0;
        this.activa = true;
        this.opreste = false;
        this.viteza = this.vitezaMaxima;
    }
}

// Helper pentru a crea o mașină nouă cu traseu
export function creazaMasinaNoua(xStart, yStart, xEnd, yEnd, tipMasina = 0, viteza = 1.5) {
    viteza = Math.min(viteza, 1.5);
    const unghi = Math.atan2(yEnd - yStart, xEnd - xStart);
    const masina = new Masina(xStart, yStart, unghi, tipMasina, viteza);
    const punctStart = { x: xStart, y: yStart };
    const punctEnd   = { x: xEnd,   y: yEnd   };
    masina.setTraseu(punctStart, punctEnd, [punctStart, punctEnd]);
    return masina;
}

export let masini = [];
let drawSceneCallback = null;
let trafficSimulatorRef = null;

export function adaugaMasina(traseu, viteza = 1.5, routeId = null) {
    if (!traseu || traseu.length < 2) return null;
    viteza = Math.min(viteza, 1.5);
    const start = traseu[0];
    const end   = traseu[traseu.length - 1];
    const tipMasina = Math.floor(Math.random() * 8);
    const masina = new Masina(
        start.x,
        start.y,
        Math.atan2(end.y - start.y, end.x - start.x),
        tipMasina,
        viteza,
        routeId
    );
    masina.setTraseu(start, end, traseu);
    masini.push(masina);
    return masina;
}

export function getMasini() {
    return masini;
}

export function clearMasini() {
    masini = [];
}

export function resetContorMasini() {
    // (opțional de implementat)
}

export function setDrawSceneCallback(cb) {
    drawSceneCallback = cb;
}

export function setTrafficSimulatorRef(ref) {
    trafficSimulatorRef = ref;
}

export function initAnimatieMasini() {
    window.verificaMasiniOprite = function() {
        let oprite = 0,
            total = masini.length;
        
        for (const m of masini) {
            if (m.viteza === 0) {
                oprite++;
            }
        }
        //console.log(`Status mașini: ${oprite}/${total} oprite`);
    };
    setInterval(window.verificaMasiniOprite, 3000);

    function animLoop() {
        for (let i = 0; i < masini.length; i++) {
            const masina = masini[i];
            masina.actualizeaza();
            if (masina.aAjunsLaDestinatie()) {
                if (
                    masina.routeId &&
                    trafficSimulatorRef &&
                    typeof trafficSimulatorRef.incrementRouteCounter === 'function'
                ) {
                    trafficSimulatorRef.incrementRouteCounter(masina.routeId);
                }
                masini.splice(i, 1);
                i--;
            }
        }
        if (drawSceneCallback) drawSceneCallback();
        requestAnimationFrame(animLoop);
    }
    requestAnimationFrame(animLoop);
}

export function genereareMasiniPeTraseeleSalvate(intersectii, numarMasini = 5) {
    if (!intersectii) return;
    intersectii.forEach(inter => {
        let trasee =
            inter.trasee ||
            (inter.data &&
                inter.data.intersectii &&
                inter.data.intersectii[0] &&
                inter.data.intersectii[0].trasee) ||
            [];
        trasee.forEach(traseu => {
            if (traseu.puncte && Array.isArray(traseu.puncte) && traseu.puncte.length > 1) {
                for (let i = 0; i < numarMasini; i++) {
                    adaugaMasina(traseu.puncte, 0.8 + Math.random() * 0.7);
                }
            }
        });
    });
}

export function canSpawnCarOnRoute(routeId, points, tipMasinaNoua = null) {
  if (!points || points.length < 2) return true;
  const start = points[0];

  let halfDiagNoua = null;
  if (tipMasinaNoua !== null) {
    // Obținem dimensiunile (lungime, lățime) pentru noua mașină
    const dimNoua = getDimensiuniVehicul(tipMasinaNoua);
    const lungNoua = dimNoua.lungime;
    const latNoua = dimNoua.latime;
    // Calculăm jumătatea diagonalei dreptunghiului care încadrează mașina: sqrt(l^2 + w^2) / 2
    halfDiagNoua = Math.hypot(lungNoua, latNoua) / 2;
  }

  for (const masina of masini) {
    if (masina.routeId !== routeId) continue;

    // 1) Coordonatele centrului mașinii existente (ms.x, ms.y).
    // 2) Coordonatele punctului de spawn (start.x, start.y).
    const dx = masina.x - start.x;
    const dy = masina.y - start.y;
    const distCentri = Math.hypot(dx, dy);

    // Calculăm jumătatea diagonalei pentru mașina existentă
    const lungExist = masina.lungime;
    const latExist = masina.latime;
    const halfDiagExist = Math.hypot(lungExist, latExist) / 2;

    // Pragul minim de distanță = halfDiagExist + halfDiagNoua (+ un mic buffer, opțional)
    let prag;
    if (halfDiagNoua !== null) {
      prag = halfDiagExist + halfDiagNoua + 5; 
      // +5px extra buffer de siguranță
    } else {
      // Dacă nu avem tipMasinaNoua, revenim la comportamentul vechi (≈40px),
      // dar tot ținem cont de dimensiunea mașinii existente, ca să nu 
      // generăm prea aproape de ea:
      prag = halfDiagExist + 40;
    }

    if (distCentri < prag) {
      // Există suprapunere (sau apropriere prea mare), deci nu putem da spawn
      return false;
    }
  }

  return true;
}

export default Masina;
