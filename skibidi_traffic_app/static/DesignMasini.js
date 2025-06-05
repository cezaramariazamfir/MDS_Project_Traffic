// DesignMasini.js
// Toate funcțiile de desenare pentru tipurile de vehicule

// Dimensiuni standard pentru vehicule, conform masinadesignvechi.js
const dimensiuniVehicule = [
    { tip: 0, nume: 'Sedan', lungime: 24, latime: 12 },
    { tip: 1, nume: 'SUV', lungime: 28, latime: 14 },
    { tip: 2, nume: 'Sport', lungime: 26, latime: 11 },
    { tip: 3, nume: 'Motocicleta', lungime: 22, latime: 10 },
    { tip: 4, nume: 'Autobuz', lungime: 40, latime: 16 },
    { tip: 5, nume: 'Camion', lungime: 35, latime: 15 },
    { tip: 6, nume: 'Taxi', lungime: 24, latime: 12 },
    { tip: 7, nume: 'Politie', lungime: 26, latime: 13 },
];

// Functie pentru a obține dimensiunile unui tip de vehicul
export function getDimensiuniVehicul(tipMasina) {
    const dimensiune = dimensiuniVehicule.find(dim => dim.tip === tipMasina) || dimensiuniVehicule[0];
    return { lungime: dimensiune.lungime, latime: dimensiune.latime };
}

export function desenareFar(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = "#FFF9C4";
    ctx.fill();
    ctx.strokeStyle = "#FBC02D";
    ctx.lineWidth = 0.5;
    ctx.stroke();
}

export function desenareStop(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = "#E53935";
    ctx.fill();
    ctx.strokeStyle = "#B71C1C";
    ctx.lineWidth = 0.5;
    ctx.stroke();
}

export function desenareRoata(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = "#212121";
    ctx.fill();
}

export function getCuloareAleatoare(tipMasina) {
    if (tipMasina === 3) {
        const culoriMotocicleta = ["#FF0000", "#FF6600", "#0066FF", "#00CC00", "#FF00FF", "#FFFF00", "#FF3366", "#3366FF"];
        return culoriMotocicleta[Math.floor(Math.random() * culoriMotocicleta.length)];
    } else if (tipMasina === 4) {
        const culoriAutobuz = ["#FFD600", "#FF5722", "#2196F3", "#4CAF50", "#9C27B0"];
        return culoriAutobuz[Math.floor(Math.random() * culoriAutobuz.length)];
    } else if (tipMasina === 5) {
        const culoriCamion = ["#795548", "#607D8B", "#263238", "#424242", "#37474F"];
        return culoriCamion[Math.floor(Math.random() * culoriCamion.length)];
    } else if (tipMasina === 6) {
        return "#FFD600";
    } else if (tipMasina === 7) {
        return "#FFFFFF";
    } else {
        const culori = [
            "#F44336", "#E91E63", "#9C27B0", "#673AB7",
            "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
            "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
            "#FFEB3B", "#FFC107", "#FF9800", "#FF5722",
            "#795548", "#9E9E9E", "#607D8B", "#263238"
        ];
        return culori[Math.floor(Math.random() * culori.length)];
    }
}

export function deseneazaSedan(ctx, masina) {
    // Folosim dimensiunile din configurație (24x12)
    const { lungime, latime } = getDimensiuniVehicul(0);
    
    // Caroseria
    ctx.beginPath();
    ctx.rect(-lungime / 2, -latime / 2, lungime, latime);
    ctx.fillStyle = masina.culoare;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Parbriz
    ctx.beginPath();
    ctx.rect(-lungime / 2 + 3, -latime / 2 + 2, 8, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    // Luneta
    ctx.beginPath();
    ctx.rect(lungime / 2 - 10, -latime / 2 + 2, 7, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    // Faruri
    desenareFar(ctx, -lungime / 2 + 1, -latime / 2 + 1, 2, 2);
    desenareFar(ctx, -lungime / 2 + 1, latime / 2 - 3, 2, 2);
    // Stopuri
    desenareStop(ctx, lungime / 2 - 3, -latime / 2 + 1, 2, 2);
    desenareStop(ctx, lungime / 2 - 3, latime / 2 - 3, 2, 2);
    // Roți
    desenareRoata(ctx, -lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, -lungime / 3, latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, latime / 2 - 1, 3, 2);
}

export function deseneazaSUV(ctx, masina) {
    // Folosim dimensiunile din configurație (28x14)
    const { lungime, latime } = getDimensiuniVehicul(1);
    
    // Caroseria
    ctx.beginPath();
    ctx.rect(-lungime / 2, -latime / 2, lungime, latime);
    ctx.fillStyle = masina.culoare;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Parbriz
    ctx.beginPath();
    ctx.rect(-lungime / 2 + 2, -latime / 2 + 2, 10, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    // Luneta
    ctx.beginPath();
    ctx.rect(lungime / 2 - 12, -latime / 2 + 2, 10, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    // Faruri
    desenareFar(ctx, -lungime / 2 + 1, -latime / 2 + 1, 2, 3);
    desenareFar(ctx, -lungime / 2 + 1, latime / 2 - 4, 2, 3);
    // Stopuri
    desenareStop(ctx, lungime / 2 - 3, -latime / 2 + 1, 2, 3);
    desenareStop(ctx, lungime / 2 - 3, latime / 2 - 4, 2, 3);
    // Bare de portbagaj
    ctx.beginPath();
    ctx.rect(-lungime / 6, -latime / 2 - 1, lungime / 3, 1);
    ctx.rect(lungime / 6, -latime / 2 - 1, lungime / 3, 1);
    ctx.fillStyle = "#666";
    ctx.fill();
    // Roți
    desenareRoata(ctx, -lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, -lungime / 3, latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, latime / 2 - 1, 3, 2);
}

export function deseneazaSport(ctx, masina) {
    // Folosim dimensiunile din configurație (26x11)
    const { lungime, latime } = getDimensiuniVehicul(2);
    
    // Caroseria
    ctx.beginPath();
    ctx.rect(-lungime / 2, -latime / 2, lungime, latime);
    ctx.fillStyle = masina.culoare;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Parbriz
    ctx.beginPath();
    ctx.rect(-lungime / 2 + 4, -latime / 2 + 3, 6, latime - 6);
    ctx.fillStyle = "#333";
    ctx.fill();
    // Luneta
    ctx.beginPath();
    ctx.rect(lungime / 2 - 10, -latime / 2 + 3, 6, latime - 6);
    ctx.fillStyle = "#333";
    ctx.fill();
    // Faruri
    desenareFar(ctx, -lungime / 2 + 1, -latime / 2 + 2, 3, 1);
    desenareFar(ctx, -lungime / 2 + 1, latime / 2 - 3, 3, 1);
    // Stopuri
    desenareStop(ctx, lungime / 2 - 3, -latime / 2 + 2, 2, 1);
    desenareStop(ctx, lungime / 2 - 3, latime / 2 - 3, 2, 1);
    // Spoiler
    ctx.beginPath();
    ctx.rect(lungime / 2, -latime / 2 + 1, 2, latime - 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    // Roți
    desenareRoata(ctx, -lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, -lungime / 3, latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, latime / 2 - 1, 3, 2);
}

export function deseneazaMotocicleta(ctx, masina) {
    // Folosim dimensiunile din configurație (22x10)
    const { lungime, latime } = getDimensiuniVehicul(3);
    
    // Corp motocicletă (mai mare și mai vizibil)
    ctx.beginPath();
    ctx.rect(-lungime / 2, -latime / 2, lungime, latime);
    ctx.fillStyle = masina.culoare;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Rezervor (mai proeminent)
    ctx.beginPath();
    ctx.rect(-lungime / 3, -latime / 2 + 1, lungime / 1.5, latime - 2);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.stroke();
    
    // Șa motocicletă
    ctx.beginPath();
    ctx.rect(lungime / 6, -latime / 2 + 2, lungime / 4, latime - 4);
    ctx.fillStyle = "#654321"; // Maro pentru șa
    ctx.fill();
    ctx.stroke();
    
    // Far mare și vizibil
    ctx.beginPath();
    ctx.arc(-lungime / 2 + 2, 0, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFF9C4";
    ctx.fill();
    ctx.strokeStyle = "#FBC02D";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Stop
    ctx.beginPath();
    ctx.rect(lungime / 2 - 2, -1, 2, 2);
    ctx.fillStyle = "#E53935";
    ctx.fill();
    ctx.strokeStyle = "#B71C1C";
    ctx.stroke();
    
    // Roți (mai mari și mai vizibile)
    ctx.beginPath();
    ctx.arc(-lungime / 2.5, 0, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#212121";
    ctx.fill();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(lungime / 2.5, 0, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#212121";
    ctx.fill();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Ghidon (mai vizibil)
    ctx.beginPath();
    ctx.rect(-4, -latime / 2 - 2, 8, 2);
    ctx.fillStyle = "#666";
    ctx.fill();
    ctx.stroke();
    
    // Oglinzi retrovizoare
    ctx.beginPath();
    ctx.rect(-2, -latime / 2 - 3, 1, 1);
    ctx.rect(1, -latime / 2 - 3, 1, 1);
    ctx.fillStyle = "#888";
    ctx.fill();
}

export function deseneazaAutobuz(ctx, masina) {
    // Folosim dimensiunile din configurație (40x16)
    const { lungime, latime } = getDimensiuniVehicul(4);
    
    // Caroseria
    ctx.beginPath();
    ctx.rect(-lungime / 2, -latime / 2, lungime, latime);
    ctx.fillStyle = masina.culoare;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Ferestre (multiple)
    for(let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.rect(-lungime / 2 + 4 + i * (lungime / 6), -latime / 2 + 2, lungime / 10, latime - 4);
        ctx.fillStyle = "#87CEEB";
        ctx.fill();
    }
    
    // Parbriz
    ctx.beginPath();
    ctx.rect(-lungime / 2 + 1, -latime / 2 + 3, 3, latime - 6);
    ctx.fillStyle = "#333";
    ctx.fill();
    
    // Ușă
    ctx.beginPath();
    ctx.rect(-lungime / 2 + 6, -latime / 2, 2, latime);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Faruri
    desenareFar(ctx, -lungime / 2 + 1, -latime / 2 + 1, 2, 2);
    desenareFar(ctx, -lungime / 2 + 1, latime / 2 - 3, 2, 2);
    
    // Stopuri
    desenareStop(ctx, lungime / 2 - 3, -latime / 2 + 1, 2, 2);
    desenareStop(ctx, lungime / 2 - 3, latime / 2 - 3, 2, 2);
    
    // Roți (mai multe pentru autobuz)
    desenareRoata(ctx, -lungime / 2 + 5, -latime / 2 - 1, 4, 2);
    desenareRoata(ctx, -lungime / 2 + 5, latime / 2 - 1, 4, 2);
    desenareRoata(ctx, lungime / 2 - 9, -latime / 2 - 1, 4, 2);
    desenareRoata(ctx, lungime / 2 - 9, latime / 2 - 1, 4, 2);
}

export function deseneazaCamion(ctx, masina) {
    // Folosim dimensiunile din configurație (35x15)
    const { lungime, latime } = getDimensiuniVehicul(5);
    
    // Cabina
    ctx.beginPath();
    ctx.rect(-lungime / 2, -latime / 2, lungime / 3, latime);
    ctx.fillStyle = masina.culoare;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Remorca
    ctx.beginPath();
    ctx.rect(-lungime / 6, -latime / 2, 2 * lungime / 3, latime);
    ctx.fillStyle = "#E0E0E0";
    ctx.fill();
    ctx.stroke();
    
    // Parbriz cabină
    ctx.beginPath();
    ctx.rect(-lungime / 2 + 2, -latime / 2 + 2, 6, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    
    // Faruri
    desenareFar(ctx, -lungime / 2 + 1, -latime / 2 + 1, 2, 2);
    desenareFar(ctx, -lungime / 2 + 1, latime / 2 - 3, 2, 2);
    
    // Stopuri
    desenareStop(ctx, lungime / 2 - 3, -latime / 2 + 1, 2, 2);
    desenareStop(ctx, lungime / 2 - 3, latime / 2 - 3, 2, 2);
    
    // Roți cabină
    desenareRoata(ctx, -lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, -lungime / 3, latime / 2 - 1, 3, 2);
    
    // Roți remorcă
    desenareRoata(ctx, lungime / 6, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 6, latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, latime / 2 - 1, 3, 2);
}

export function deseneazaTaxi(ctx, masina) {
    // Folosim dimensiunile din configurație (24x12)
    const { lungime, latime } = getDimensiuniVehicul(6);
    
    // Caroseria (similară cu sedan)
    ctx.beginPath();
    ctx.rect(-lungime / 2, -latime / 2, lungime, latime);
    ctx.fillStyle = "#FFD600"; // Galben taxi
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Semnul TAXI pe capotă
    ctx.beginPath();
    ctx.rect(-lungime / 4, -latime / 2 - 2, lungime / 2, 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    
    ctx.fillStyle = "#FFF";
    ctx.font = "3px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TAXI", 0, -latime / 2);
    
    // Parbriz
    ctx.beginPath();
    ctx.rect(-lungime / 2 + 3, -latime / 2 + 2, 8, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    
    // Luneta
    ctx.beginPath();
    ctx.rect(lungime / 2 - 10, -latime / 2 + 2, 7, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    // Faruri
    desenareFar(ctx, -lungime / 2 + 1, -latime / 2 + 1, 2, 2);
    desenareFar(ctx, -lungime / 2 + 1, latime / 2 - 3, 2, 2);
    // Stopuri
    desenareStop(ctx, lungime / 2 - 3, -latime / 2 + 1, 2, 2);
    desenareStop(ctx, lungime / 2 - 3, latime / 2 - 3, 2, 2);
    // Roți
    desenareRoata(ctx, -lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, -lungime / 3, latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, latime / 2 - 1, 3, 2);
}

export function deseneazaPolitie(ctx, masina) {
    // Folosim dimensiunile din configurație (26x13)
    const { lungime, latime } = getDimensiuniVehicul(7);
    
    // Caroseria
    ctx.beginPath();
    ctx.rect(-lungime / 2, -latime / 2, lungime, latime);
    ctx.fillStyle = "#FFF"; // Alb pentru mașina de poliție
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Bandă albastră
    ctx.beginPath();
    ctx.rect(-lungime / 2, -2, lungime, 4);
    ctx.fillStyle = "#0000FF";
    ctx.fill();
    
    // Girofar
    ctx.beginPath();
    ctx.rect(-2, -latime / 2 - 3, 4, 2);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    
    // Parbriz
    ctx.beginPath();
    ctx.rect(-lungime / 2 + 3, -latime / 2 + 2, 8, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    
    // Luneta
    ctx.beginPath();
    ctx.rect(lungime / 2 - 10, -latime / 2 + 2, 7, latime - 4);
    ctx.fillStyle = "#333";
    ctx.fill();
    
    // Faruri
    desenareFar(ctx, -lungime / 2 + 1, -latime / 2 + 1, 2, 2);
    desenareFar(ctx, -lungime / 2 + 1, latime / 2 - 3, 2, 2);
    
    // Stopuri
    desenareStop(ctx, lungime / 2 - 3, -latime / 2 + 1, 2, 2);
    desenareStop(ctx, lungime / 2 - 3, latime / 2 - 3, 2, 2);
    
    // Roți
    desenareRoata(ctx, -lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, -lungime / 3, latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, -latime / 2 - 1, 3, 2);
    desenareRoata(ctx, lungime / 3, latime / 2 - 1, 3, 2);
}

