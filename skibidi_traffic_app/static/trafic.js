import { initAnimatieMasini, adaugaMasina, getMasini, setDrawSceneCallback, genereareMasiniPeTraseeleSalvate, clearMasini } from './masina.js';

// Funcția de inițializare a traficului
export function initTrafic(drawSceneFunc) {
    console.log("🚀 initTrafic apelat cu drawSceneFunc:", drawSceneFunc ? "✅ funcție validă" : "❌ null/undefined");
    
    // Setează funcția de redare
    setDrawSceneCallback(drawSceneFunc);
    
    // Inițializează animația mașinilor
    initAnimatieMasini();
    console.log("✅ initTrafic finalizat - animația și callback-ul sunt setate");
      // Nota: Butonul de generare mașini a fost eliminat
}

export function deseneazaMasini(ctx) {
    const masini = getMasini();
    // Reduced logging - only log when number of cars changes significantly
    if (masini.length > 0 && masini.length % 5 === 0) {
        console.log("🎨 deseneazaMasini - mașini active:", masini.length);
    }
    for (let masina of masini) {
        masina.deseneaza(ctx);
    }
}

// Funcție pentru a adăuga o mașină pe un traseu specific
export function adaugaMasinaPeTraseu(traseu, viteza = 2) {
    return adaugaMasina(traseu, viteza);
}

// Funcție pentru a curăța toate mașinile
export function stergeMasini() {
    clearMasini();
}

// Exportă funcția pentru simulare
export function simuleazaTrafic(intersectii, numarMasini = 5) {
    return genereareMasiniPeTraseeleSalvate(intersectii, numarMasini);
}