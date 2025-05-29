export default class Masina {
    constructor(traseu, viteza = 2) {
        this.traseu = traseu; // Lista de puncte de urmat
        this.viteza = viteza; // Pixeli per frame
        this.indexPunctCurent = 0; // Indexul punctului curent din traseu
        this.pozitieCurenta = { ...traseu[0] }; // Începe de la primul punct
        this.terminat = false; // Flag pentru a indica dacă a terminat traseul
        this.culoare = this.getCuloareAleatoare(); // Culoare aleatoare pentru mașină
        this.lungime = 24; // Lungimea mașinii în pixeli
        this.latime = 12;  // Lățimea mașinii în pixeli
        this.unghi = 0;    // Unghiul de rotație în radiani
        this.tipMasina = Math.floor(Math.random() * 3); // 0=sedan, 1=SUV, 2=sport
    }

    updatePozitie() {
        if (this.indexPunctCurent >= this.traseu.length - 1) {
            this.terminat = true; // Mașina a ajuns la destinație
            return;
        }

        const punctUrmator = this.traseu[this.indexPunctCurent + 1];
        const dx = punctUrmator.x - this.pozitieCurenta.x;
        const dy = punctUrmator.y - this.pozitieCurenta.y;
        const distanta = Math.sqrt(dx * dx + dy * dy);
        
        // Actualizează unghiul de rotație pentru a urmări direcția de deplasare
        this.unghi = Math.atan2(dy, dx);

        if (distanta <= this.viteza) {
            // Treci la următorul punct
            this.pozitieCurenta = { ...punctUrmator };
            this.indexPunctCurent++;
        } else {
            // Actualizează poziția curentă
            this.pozitieCurenta.x += (dx / distanta) * this.viteza;
            this.pozitieCurenta.y += (dy / distanta) * this.viteza;
        }
    }

    deseneaza(ctx) {
        ctx.save(); // Salvează starea curentă a contextului
        
        // Translatează la poziția mașinii
        ctx.translate(this.pozitieCurenta.x, this.pozitieCurenta.y);
        
        // Rotește contextul pentru a urmări direcția de deplasare
        ctx.rotate(this.unghi);
        
        // Desenează caroseria mașinii
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
        ctx.fillStyle = this.culoare;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Desenează parbrizul (în față)
        ctx.beginPath();
        if (this.tipMasina === 0) { // Sedan
            ctx.rect(-this.lungime / 2 + 3, -this.latime / 2 + 2, 8, this.latime - 4);
        } else if (this.tipMasina === 1) { // SUV
            ctx.rect(-this.lungime / 2 + 2, -this.latime / 2 + 2, 10, this.latime - 4);
        } else { // Sport
            ctx.rect(-this.lungime / 2 + 4, -this.latime / 2 + 3, 6, this.latime - 6);
        }
        ctx.fillStyle = "#333"; // Parbriz închis la culoare
        ctx.fill();
        
        // Desenează luneta (în spate)
        ctx.beginPath();
        if (this.tipMasina === 0) { // Sedan
            ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 2, 7, this.latime - 4);
        } else if (this.tipMasina === 1) { // SUV
            ctx.rect(this.lungime / 2 - 12, -this.latime / 2 + 2, 10, this.latime - 4);
        } else { // Sport
            ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 3, 6, this.latime - 6);
        }
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Adaugă detalii specifice tipului de mașină
        if (this.tipMasina === 0) { // Sedan
            // Faruri
            this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
            this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
            
            // Stopuri
            this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
            this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
            
        } else if (this.tipMasina === 1) { // SUV - mai înalt și cu detalii specifice
            // Faruri
            this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 3);
            this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 4, 2, 3);
            
            // Stopuri
            this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 3);
            this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 4, 2, 3);
            
            // Bare de portbagaj
            ctx.beginPath();
            ctx.rect(-this.lungime / 6, -this.latime / 2 - 1, this.lungime / 3, 1);
            ctx.rect(this.lungime / 6, -this.latime / 2 - 1, this.lungime / 3, 1);
            ctx.fillStyle = "#666";
            ctx.fill();
            
        } else { // Sport - mai joasă și cu spoiler
            // Faruri
            this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 2, 3, 1);
            this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 3, 1);
            
            // Stopuri
            this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 2, 2, 1);
            this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 1);
            
            // Spoiler
            ctx.beginPath();
            ctx.rect(this.lungime / 2, -this.latime / 2 + 1, 2, this.latime - 2);
            ctx.fillStyle = "#000";
            ctx.fill();
        }
        
        // Roți
        this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);

        ctx.restore(); // Restaurează starea contextului
    }
    
    desenareFar(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = "#FFF9C4"; // Galben deschis pentru faruri
        ctx.fill();
        ctx.strokeStyle = "#FBC02D"; // Contur galben închis
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    
    desenareStop(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = "#E53935"; // Roșu pentru stopuri
        ctx.fill();
        ctx.strokeStyle = "#B71C1C"; // Contur roșu închis
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    
    desenareRoata(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = "#212121"; // Negru pentru roți
        ctx.fill();
    }
    
    getCuloareAleatoare() {
        const culori = [
            "#F44336", "#E91E63", "#9C27B0", "#673AB7", // roșu, roz, mov
            "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", // albastru, cyan
            "#009688", "#4CAF50", "#8BC34A", "#CDDC39", // verde
            "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", // galben, portocaliu
            "#795548", "#9E9E9E", "#607D8B", "#263238"  // maro, gri, albastru-gri
        ];
        return culori[Math.floor(Math.random() * culori.length)];
    }
}

// Funcții pentru gestionarea animației mașinilor
let masini = [];
let animatieRuleaza = false;

export function initAnimatieMasini() {
    masini = [];
    animatieRuleaza = false;
}

export function adaugaMasina(traseu, viteza = 2) {
    const masinaNoua = new Masina(traseu, viteza);
    masini.push(masinaNoua);
    
    // Pornește animația dacă nu rulează deja
    if (!animatieRuleaza) {
        animatieRuleaza = true;
        requestAnimationFrame(updateAnimatieMasini);
    }
    
    return masinaNoua;
}

export function getMasini() {
    return masini;
}

export function clearMasini() {
    masini = [];
}

let drawSceneCallback = null;

export function setDrawSceneCallback(callback) {
    drawSceneCallback = callback;
}

function updateAnimatieMasini() {
    // Actualizează poziția fiecărei mașini
    for (let i = 0; i < masini.length; i++) {
        masini[i].updatePozitie();
        
        // Elimină mașinile care au ajuns la destinație
        if (masini[i].terminat) {
            masini.splice(i, 1);
            i--;
        }
    }
    
    // Redesenează scena dacă este disponibil callback-ul
    if (drawSceneCallback) {
        drawSceneCallback();
    }
    
    // Continuă animația dacă mai sunt mașini
    if (masini.length > 0) {
        requestAnimationFrame(updateAnimatieMasini);
    } else {
        animatieRuleaza = false;
    }
}

export function genereareMasiniPeTraseeleSalvate(intersectii, numarMasini = 3) {
    const traseeTotale = [];
    
    // Colectează toate traseele disponibile
    for (let inter of intersectii) {
        if (inter.trasee && inter.trasee.length > 0) {
            for (let traseu of inter.trasee) {
                traseeTotale.push(traseu.puncte);
            }
        }
    }
    
    if (traseeTotale.length === 0) {
        alert("Nu există trasee definite pentru simulare!");
        return false;
    }
    
    // Generează mașini aleatorii pe trasee
    for (let i = 0; i < numarMasini; i++) {
        const traseAleator = traseeTotale[Math.floor(Math.random() * traseeTotale.length)];
        
        // Viteza aleatoare între 1 și 4 pixeli pe frame
        const vitezaAleatoare = 1 + Math.random() * 3;
        
        adaugaMasina(traseAleator, vitezaAleatoare);
    }
    
    return true;
}