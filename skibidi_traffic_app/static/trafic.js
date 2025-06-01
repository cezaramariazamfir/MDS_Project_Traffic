import { initAnimatieMasini, adaugaMasina, getMasini, setDrawSceneCallback, genereareMasiniPeTraseeleSalvate, clearMasini } from './masina.js';

// Funcția de inițializare a traficului
export function initTrafic(drawSceneFunc) {
    // Setează funcția de redare
    setDrawSceneCallback(drawSceneFunc);
    
    // Inițializează animația mașinilor
    initAnimatieMasini();
    
    // Adaugă butonul de generare mașini în sidebar
    //adaugaButonGenerareMasini();
}

// Adaugă buton pentru generarea mașinilor
// function adaugaButonGenerareMasini() {
//     document.addEventListener('DOMContentLoaded', function() {
//         const sidebar = document.getElementById('sidebar');
//         if (!sidebar) return;
        
//         // Verifică dacă butonul există deja
//         if (document.getElementById('btnGenerareMasini')) return;
        
//         const btnGenerareMasini = document.createElement("button");
//         btnGenerareMasini.id = "btnGenerareMasini";
//         btnGenerareMasini.textContent = "🚗 Generează mașini";
//         btnGenerareMasini.className = "btn btn-success mt-2";
//         btnGenerareMasini.addEventListener("click", () => {
//             const intersectii = window.intersectii || [];
//             genereareMasiniPeTraseeleSalvate(intersectii, 3);
//         });
        
//         sidebar.appendChild(btnGenerareMasini);
//     });
// }

// Funcție pentru a desena toate mașinile active
export function deseneazaMasini(ctx) {
    const masini = getMasini();
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