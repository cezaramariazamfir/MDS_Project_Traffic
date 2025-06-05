// let contorMasiniTrecute = 0;

// // Referință globală către traffic simulator pentru accesul la route counters
// let trafficSimulatorRef = null;

// export function setTrafficSimulatorRef(ref) {
//     trafficSimulatorRef = ref;
// }

// export default class Masina {    constructor(traseu, viteza = 5, routeId = null) {
//         this.traseu = traseu; // Lista de puncte de urmat
//         this.viteza = viteza; // Pixeli per frame
//         this.indexPunctCurent = 0; // Indexul punctului curent din traseu
//         this.pozitieCurenta = { ...traseu[0] }; // Începe de la primul punct
//         this.terminat = false; // Flag pentru a indica dacă a terminat traseul
//         this.tipMasina = Math.floor(Math.random() * 8); // 0=sedan, 1=SUV, 2=sport, 3=motocicleta, 4=autobuz, 5=camion, 6=taxi, 7=masina_politie
//         this.culoare = this.getCuloareAleatoare(); // Culoare aleatoare pentru mașină
//         this.setDimensiuni(); // Setează dimensiunile în funcție de tip
//         this.unghi = 0; // Unghiul de rotație în radiani
//         this.routeId = routeId; // ID-ul rutei pentru tracking per-rută
        
        
//     }

//     getTipVehicul() {
//         const tipuri = ['Sedan', 'SUV', 'Sport', 'Motocicletă', 'Autobuz', 'Camion', 'Taxi', 'Poliție'];
//         return tipuri[this.tipMasina] || 'Necunoscut';
//     }

//     setDimensiuni() {
//         switch(this.tipMasina) {
//             case 0: // Sedan
//                 this.lungime = 24;
//                 this.latime = 12;
//                 break;
//             case 1: // SUV
//                 this.lungime = 28;
//                 this.latime = 14;
//                 break;
//             case 2: // Sport
//                 this.lungime = 26;
//                 this.latime = 11;
//                 break;            
//             case 3: // Motocicleta
//                 this.lungime = 22;
//                 this.latime = 10;
//                 break;
//             case 4: // Autobuz
//                 this.lungime = 40;
//                 this.latime = 16;
//                 break;
//             case 5: // Camion
//                 this.lungime = 35;
//                 this.latime = 15;
//                 break;
//             case 6: // Taxi
//                 this.lungime = 24;
//                 this.latime = 12;
//                 break;
//             case 7: // Masina politie
//                 this.lungime = 26;
//                 this.latime = 13;
//                 break;
//             default:
//                 this.lungime = 24;
//                 this.latime = 12;
//         }
//     }    updatePozitie() {
//         if (this.indexPunctCurent >= this.traseu.length - 1) {
//             if(!this.terminat){
//                 contorMasiniTrecute++;
//                 console.log(Numar de masini ajunse la destinatie: ${contorMasiniTrecute});
                
//                 // Incrementează contorul pentru ruta specifică dacă este disponibil
//                 if (this.routeId && trafficSimulatorRef && trafficSimulatorRef.incrementRouteCounter) {
//                     trafficSimulatorRef.incrementRouteCounter(this.routeId);
//                 }
                
//                 this.terminat = true; // Mașina a ajuns la destinație
//             }
            
//             return;
//         }

//         const punctUrmator = this.traseu[this.indexPunctCurent + 1];
//         const dx = punctUrmator.x - this.pozitieCurenta.x;
//         const dy = punctUrmator.y - this.pozitieCurenta.y;
//         const distanta = Math.sqrt(dx * dx + dy * dy);
        
//         // Actualizează unghiul de rotație pentru a urmări direcția de deplasare
//         this.unghi = Math.atan2(dy, dx);

//         // Verifică coliziuni cu alte mașini și ajustează viteza
//         let vitezaEfectiva = this.calculezaVitezaEfectiva();

//         if (distanta <= vitezaEfectiva) {
//             // Treci la următorul punct
//             this.pozitieCurenta = { ...punctUrmator };
//             this.indexPunctCurent++;
//         } else {
//             // Actualizează poziția curentă cu viteza efectivă
//             this.pozitieCurenta.x += (dx / distanta) * vitezaEfectiva;
//             this.pozitieCurenta.y += (dy / distanta) * vitezaEfectiva;
//         }
//     }    // Calculează viteza efectivă luând în considerare mașinile din față și semaforurile
//     calculezaVitezaEfectiva() {
//         // Distanța minimă de siguranță ține cont de diferența de dimensiuni
//         const masinaDinFata = this.detecteazaMasinaDinFata(
//             // Folosim distanța de detecție maximă ca înainte
//             (this.lungime + 30) * 5
//         );
//         let distantaMinimaSiguranta = this.lungime + 30;
//         if (masinaDinFata) {
//             // Adaugă jumătate din diferența de lungime între mașini
//             distantaMinimaSiguranta = this.lungime + 0.5 * Math.abs(this.lungime - masinaDinFata.lungime) + 30;
//         } 
//         const distantaDetectie = distantaMinimaSiguranta * 5; // Distanță de detectie mărită pentru reacție mai bună
//           // Verifică semaforurile din față mai întâi
//         console.log(Distanța minimă de siguranță: ${distantaMinimaSiguranta});
//         const semaforAproape = this.detecteazaSemaforDinFata(100); // Detectează semafoare într-un rază mai mare
//         if (semaforAproape) {
//             const distantaLaSemafor = semaforAproape.distanta;
            
//             if (semaforAproape.status === "red") {
//                 // Verifică mai întâi dacă există mașini oprite la semafor
//                 const masiniOprite = this.detecteazaMasiniOpriteLaSemafor(semaforAproape);
                
//                 if (masiniOprite.length > 0) {
//                     // Dacă există mașini oprite, oprește-te în spatele ultimei mașini
//                     // Găsește mașina cea mai apropiată dintre cele oprite
//                     const masinaOpriteaApropiata = masiniOprite.reduce((apropiata, curenta) => {
//                         const d1 = this.calculeazaDistantaLaMasina(apropiata);
//                         const d2 = this.calculeazaDistantaLaMasina(curenta);
//                         return d2 < d1 ? curenta : apropiata;
//                     });
                    
//                     const distantaLaMasinaOprita = this.calculeazaDistantaLaMasina(masinaOpriteaApropiata);
//                     const distantaMinima = this.lungime / 2 + masinaOpriteaApropiata.lungime / 2 + 10; // Spațiu suplimentar între mașini
                    
//                     if (distantaLaMasinaOprita <= distantaMinima) {
//                         return 0; // Oprire completă pentru a evita coliziunea
//                     } else if (distantaLaMasinaOprita <= distantaMinima * 2) {
//                         // Foarte încet când te apropii de mașina din față
//                         return this.viteza * 0.05;
//                     }
//                 } else {
//                     // Nu sunt mașini oprite, oprește-te la semafor
//                     if (distantaLaSemafor <= 20) {
//                         return 0; // Oprește complet cu mai mult spațiu (20px față de 15px)
//                     } else if (distantaLaSemafor <= 50) {
//                         // Încetinește treptat când se apropie de semafor
//                         return this.viteza * 0.15; // Încetinire mai agresivă
//                     } else {
//                         // Începe să încetinească din timp
//                         const factorIncetinire = Math.max(0.25, distantaLaSemafor / 100);
//                         return this.viteza * factorIncetinire;
//                     }
//                 }
//             } else if (semaforAproape.status === "yellow") {
//                 // Comportament pentru galben - încetinește sau accelerează în funcție de distanță
//                 if (distantaLaSemafor <= 30) {
//                     return 0; // Oprește dacă este prea aproape (distanță mărită)
//                 } else if (distantaLaSemafor <= 60) {
//                     return this.viteza * 0.3; // Încetinește mai mult
//                 }
//             }
//             // Pentru verde sau distanțe mari, continuă cu verificarea mașinilor
//         }
        
//         const masinaAproape = this.detecteazaMasinaDinFata(distantaDetectie);
//         if (masinaAproape) {
//             // Folosește distanța de siguranță ajustată
//             const distantaLaMasina = this.calculeazaDistantaLaMasina(masinaAproape);
//             const distantaSiguranta = this.lungime + 0.5 * Math.abs(this.lungime - masinaAproape.lungime) + 30;
//             // Nu mai permitem depășirea în intersecție: adaptăm viteza la cea din față dacă suntem aproape, indiferent de zonă
//             if (distantaLaMasina <= distantaSiguranta * 0.9) {
//                 return 0;
//             }
//             // Dacă suntem aproape, adaptăm viteza la cea a mașinii din față
//             if (distantaLaMasina <= distantaSiguranta * 2) {
//                 return Math.min(this.viteza, masinaAproape.calculezaVitezaEfectiva());
//             }
//             // Încetinire graduală
//             const factor = Math.max(0.2, (distantaLaMasina - distantaSiguranta) / (distantaDetectie - distantaSiguranta));
//             return this.viteza * factor;
//         }
        
//         return this.viteza; // Viteza normală
//     }

//     // Detectează dacă există o mașină în față pe același traseu
//     detecteazaMasinaDinFata(distantaMaxima) {
//         const masinileActive = getMasini();
//         let masinaCeaMaiAproape = null;
//         let distantaMinima = Infinity;

//         for (let masina of masinileActive) {
//             if (masina === this) continue; // Ignoră mașina curentă
            
//             // Verifică dacă sunt pe același traseu sau trasee similare
//             if (this.suntPeAcelasiTraseu(masina)) {
//                 // Verifică dacă mașina este în față (progres mai mare pe traseu)
//                 if (this.esteMasinaInFata(masina)) {
//                     const distanta = this.calculeazaDistantaLaMasina(masina);
                    
//                     if (distanta < distantaMaxima && distanta < distantaMinima) {
//                         distantaMinima = distanta;
//                         masinaCeaMaiAproape = masina;
//                     }
//                 }
//             }
//         }

//         return masinaCeaMaiAproape;
//     }    // Verifică dacă două mașini sunt pe același traseu sau trasee similare
//     // Verifică dacă două mașini sunt pe același traseu sau trasee similare
// suntPeAcelasiTraseu(altaMasina) {
//     // Verificare rapidă pe routeId: dacă ambele sunt definite și diferite, nu sunt pe același traseu
//     if (this.routeId && altaMasina.routeId && this.routeId !== altaMasina.routeId) {
//         return false;
//     }

//     // Toleranță mult mai strictă pentru a evita opririle false
//     const toleranta = 20; // Redus de la 25 la 20 pentru precizie mai mare

//     // Compară pozițiile actuale
//     const punctulMeuCurent = this.pozitieCurenta;
//     const punctulSauCurent = altaMasina.pozitieCurenta;

//     const distantaIntrePuncte = Math.sqrt(
//         Math.pow(punctulMeuCurent.x - punctulSauCurent.x, 2) +
//         Math.pow(punctulMeuCurent.y - punctulSauCurent.y, 2)
//     );

//     // Dacă sunt prea departe, sigur nu sunt pe același traseu
//     if (distantaIntrePuncte > toleranta * 2.5) return false; // Rază mărită pentru detecție mai bună

//     // Verifică direcția - trebuie să meargă în aceeași direcție
//     const directiaMea = this.unghi;
//     const directiaSa = altaMasina.unghi;
//     let diferentaUnghi = Math.abs(directiaMea - directiaSa);

//     // Normalizează unghiul
//     if (diferentaUnghi > Math.PI) {
//         diferentaUnghi = 2 * Math.PI - diferentaUnghi;
//     }

//     // Verifică doar mașinile care merg în aceeași direcție (±30° în loc de ±45°)
//     const directieSimilara = diferentaUnghi < Math.PI / 6; // 30° toleranță pentru precizie mai mare
//     const pozitieApropiata = distantaIntrePuncte < toleranta;

//     // Verificare suplimentară: mașinile trebuie să fie aproape de același traseu fizic
//     const suntPeTraseuSimilar = this.verificaTraseuSimilar(altaMasina, toleranta);

//     // Returnează true doar dacă toate condițiile sunt îndeplinite
//     return directieSimilara && pozitieApropiata && suntPeTraseuSimilar;
// }

    
//     // Verifică dacă mașinile sunt pe un traseu fizic similar
//     verificaTraseuSimilar(altaMasina, toleranta) {
//         // Verifică câteva puncte din traseul fiecărei mașini pentru a vedea dacă se suprapun
//         const puncteDeVerificat = Math.min(5, this.traseu.length, altaMasina.traseu.length);
//         let puncteComune = 0;
        
//         for (let i = 0; i < puncteDeVerificat; i++) {
//             const indiceMeu = Math.min(this.indexPunctCurent + i, this.traseu.length - 1);
//             const indiceSau = Math.min(altaMasina.indexPunctCurent + i, altaMasina.traseu.length - 1);
            
//             if (indiceMeu < this.traseu.length && indiceSau < altaMasina.traseu.length) {
//                 const punctMeu = this.traseu[indiceMeu];
//                 const punctSau = altaMasina.traseu[indiceSau];
                
//                 const distanta = Math.sqrt(
//                     Math.pow(punctMeu.x - punctSau.x, 2) + 
//                     Math.pow(punctMeu.y - punctSau.y, 2)
//                 );
                
//                 if (distanta < toleranta) {
//                     puncteComune++;
//                 }
//             }
//         }
        
//         // Cel puțin jumătate din punctele verificate trebuie să fie comune
//         return puncteComune >= Math.ceil(puncteDeVerificat / 2);
//     }// Verifică dacă două mașini se află pe puncte comune din trasee (intersecții)
//     verificaPuncteComune(altaMasina, toleranta) {
//         // Verifică doar punctele foarte apropiate și doar dacă mașinile sunt într-adevăr pe acele puncte
//         for (let punctMeu of this.traseu) {
//             for (let punctSau of altaMasina.traseu) {
//                 const distanta = Math.sqrt(
//                     Math.pow(punctMeu.x - punctSau.x, 2) + 
//                     Math.pow(punctMeu.y - punctSau.y, 2)
//                 );
                
//                 if (distanta < toleranta) {
//                     // Verifică dacă AMBELE mașini sunt foarte aproape de acest punct comun
//                     const distantaMeaLaPunct = Math.sqrt(
//                         Math.pow(this.pozitieCurenta.x - punctMeu.x, 2) + 
//                         Math.pow(this.pozitieCurenta.y - punctMeu.y, 2)
//                     );
                    
//                     const distantaSaLaPunct = Math.sqrt(
//                         Math.pow(altaMasina.pozitieCurenta.x - punctSau.x, 2) + 
//                         Math.pow(altaMasina.pozitieCurenta.y - punctSau.y, 2)
//                     );
                    
//                     // AMBELE trebuie să fie foarte aproape de punctul comun (toleranță mică)
//                     if (distantaMeaLaPunct < toleranta && distantaSaLaPunct < toleranta) {
//                         return true;
//                     }
//                 }
//             }
//         }
//         return false;
//     }    // Verifică dacă o mașină este în față pe traseu
//     esteMasinaInFata(altaMasina) {
//         // Calculează vectorul către cealaltă mașină
//         const dx = altaMasina.pozitieCurenta.x - this.pozitieCurenta.x;
//         const dy = altaMasina.pozitieCurenta.y - this.pozitieCurenta.y;
//         // Calculează produsul scalar cu direcția de mers
//         const produsScalar = dx * Math.cos(this.unghi) + dy * Math.sin(this.unghi);
//         // Pozitiv înseamnă că este în față, verifică și că nu este prea lateral
//         const distantaLaterala = Math.abs(-dx * Math.sin(this.unghi) + dy * Math.cos(this.unghi));
//         const tolerantaLaterala = this.latime * 1.2;
//         // Verificare suplimentară: mașina în față trebuie să aibă un progres mai mare pe traseu
//         const progresulMeu = this.calculeazaProgresulPeTraseu();
//         const progresulSau = altaMasina.calculeazaProgresulPeTraseu();
//         const estePeAcelasiTraseu = this.suntPeAcelasiTraseu(altaMasina);

//         // --- NOU: Prevenire depășire la colțuri/intersecții L ---
//         // Dacă ambele mașini sunt la același index sau la indexuri consecutive și aproape de același punct, consideră-le în coloană
//         const indexDiff = Math.abs(this.indexPunctCurent - altaMasina.indexPunctCurent);
//         const punctMeu = this.traseu[this.indexPunctCurent];
//         const punctSau = altaMasina.traseu[altaMasina.indexPunctCurent];
//         const distPuncte = Math.sqrt(
//             Math.pow(punctMeu.x - punctSau.x, 2) +
//             Math.pow(punctMeu.y - punctSau.y, 2)
//         );
//         if (indexDiff <= 1 && distPuncte < Math.max(this.lungime, this.latime) * 1.2) {
//             // Consideră că nu se poate depăși, chiar dacă unghiul diferă brusc
//             return progresulSau > progresulMeu;
//         }
//         // ------------------------------------------------------

//         // Condițiile pentru a considera că mașina este în față:
//         // 1. Produsul scalar pozitiv (în direcția de mers)
//         // 2. Distanța laterală mică (pe aceeași bandă)
//         // 3. Progres similar pe traseu (sunt pe același traseu)
//         // 4. Distanță minimă în față pentru a evita detectarea în paralel
//         const esteInFata = produsScalar > 15 &&
//                           distantaLaterala < tolerantaLaterala &&
//                           estePeAcelasiTraseu &&
//                           (Math.abs(progresulMeu - progresulSau) < 0.3 || progresulSau > progresulMeu);
//         return esteInFata;
//     }

//     // Calculează progresul pe traseu (între 0 și 1)
//     calculeazaProgresulPeTraseu() {
//         if (this.traseu.length <= 1) return 1;
        
//         let distantaTotala = 0;
//         let distantaParcursa = 0;
        
//         // Calculează distanța totală a traseului
//         for (let i = 0; i < this.traseu.length - 1; i++) {
//             const punct1 = this.traseu[i];
//             const punct2 = this.traseu[i + 1];
//             distantaTotala += Math.sqrt(
//                 Math.pow(punct2.x - punct1.x, 2) + 
//                 Math.pow(punct2.y - punct1.y, 2)
//             );
//         }
        
//         // Calculează distanța parcursă până la poziția curentă
//         for (let i = 0; i < this.indexPunctCurent; i++) {
//             const punct1 = this.traseu[i];
//             const punct2 = this.traseu[i + 1];
//             distantaParcursa += Math.sqrt(
//                 Math.pow(punct2.x - punct1.x, 2) + 
//                 Math.pow(punct2.y - punct1.y, 2)
//             );
//         }
        
//         // Adaugă distanța de la ultimul punct la poziția curentă
//         if (this.indexPunctCurent < this.traseu.length - 1) {
//             const punctulAnterior = this.traseu[this.indexPunctCurent];
//             distantaParcursa += Math.sqrt(
//                 Math.pow(this.pozitieCurenta.x - punctulAnterior.x, 2) + 
//                 Math.pow(this.pozitieCurenta.y - punctulAnterior.y, 2)
//             );
//         }
        
//         return distantaTotala > 0 ? distantaParcursa / distantaTotala : 1;
//     }    // Calculează distanța reală între două mașini (ținând cont de dimensiuni)
//     calculeazaDistantaLaMasina(altaMasina) {
//         // Distanța euclidiană între centrele mașinilor
//         const distantaCentre = Math.sqrt(
//             Math.pow(this.pozitieCurenta.x - altaMasina.pozitieCurenta.x, 2) + 
//             Math.pow(this.pozitieCurenta.y - altaMasina.pozitieCurenta.y, 2)
//         );
        
        
        
//         // Returnează minimum 0 pentru a evita valorile negative
//         return Math.max(0, distantaCentre);
        
//     }
//     deseneaza(ctx) {
//         ctx.save(); // Salvează starea curentă a contextului
        
//         // Translatează la poziția mașinii
//         ctx.translate(this.pozitieCurenta.x, this.pozitieCurenta.y);
        
//         // Rotește contextul pentru a urmări direcția de deplasare
//         ctx.rotate(this.unghi);
        
//         // Desenează în funcție de tipul vehiculului
//         switch(this.tipMasina) {
//             case 0: // Sedan
//                 this.deseneazaSedan(ctx);
//                 break;
//             case 1: // SUV
//                 this.deseneazaSUV(ctx);
//                 break;
//             case 2: // Sport
//                 this.deseneazaSport(ctx);
//                 break;
//             case 3: // Motocicleta
//                 this.deseneazaMotocicleta(ctx);
//                 break;
//             case 4: // Autobuz
//                 this.deseneazaAutobuz(ctx);
//                 break;
//             case 5: // Camion
//                 this.deseneazaCamion(ctx);
//                 break;
//             case 6: // Taxi
//                 this.deseneazaTaxi(ctx);
//                 break;
//             case 7: // Masina politie
//                 this.deseneazaPolitie(ctx);
//                 break;
//             default:
//                 this.deseneazaSedan(ctx);
//         }

//         ctx.restore(); // Restaurează starea contextului
//     }

//     deseneazaSedan(ctx) {
//         // Caroseria
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
//         ctx.fillStyle = this.culoare;
//         ctx.fill();
//         ctx.strokeStyle = "black";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Parbriz
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2 + 3, -this.latime / 2 + 2, 8, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Luneta
//         ctx.beginPath();
//         ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 2, 7, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Faruri
//         this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
//         this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
//         // Stopuri
//         this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
//         this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
//         // Roți
//         this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
//     }

//     deseneazaSUV(ctx) {
//         // Caroseria
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
//         ctx.fillStyle = this.culoare;
//         ctx.fill();
//         ctx.strokeStyle = "black";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Parbriz
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2 + 2, -this.latime / 2 + 2, 10, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Luneta
//         ctx.beginPath();
//         ctx.rect(this.lungime / 2 - 12, -this.latime / 2 + 2, 10, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Faruri
//         this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 3);
//         this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 4, 2, 3);
        
//         // Stopuri
//         this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 3);
//         this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 4, 2, 3);
        
//         // Bare de portbagaj
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 6, -this.latime / 2 - 1, this.lungime / 3, 1);
//         ctx.rect(this.lungime / 6, -this.latime / 2 - 1, this.lungime / 3, 1);
//         ctx.fillStyle = "#666";
//         ctx.fill();
        
//         // Roți
//         this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
//     }

//     deseneazaSport(ctx) {
//         // Caroseria
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
//         ctx.fillStyle = this.culoare;
//         ctx.fill();
//         ctx.strokeStyle = "black";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Parbriz
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2 + 4, -this.latime / 2 + 3, 6, this.latime - 6);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Luneta
//         ctx.beginPath();
//         ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 3, 6, this.latime - 6);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Faruri
//         this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 2, 3, 1);
//         this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 3, 1);
        
//         // Stopuri
//         this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 2, 2, 1);
//         this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 1);
        
//         // Spoiler
//         ctx.beginPath();
//         ctx.rect(this.lungime / 2, -this.latime / 2 + 1, 2, this.latime - 2);
//         ctx.fillStyle = "#000";
//         ctx.fill();
        
//         // Roți
//         this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
//     }    deseneazaMotocicleta(ctx) {
//         // Corp motocicletă (mai mare și mai vizibil)
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
//         ctx.fillStyle = this.culoare;
//         ctx.fill();
//         ctx.strokeStyle = "black";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Rezervor (mai proeminent)
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 3, -this.latime / 2 + 1, this.lungime / 1.5, this.latime - 2);
//         ctx.fillStyle = "#333";
//         ctx.fill();
//         ctx.stroke();
        
//         // Șa motocicletă
//         ctx.beginPath();
//         ctx.rect(this.lungime / 6, -this.latime / 2 + 2, this.lungime / 4, this.latime - 4);
//         ctx.fillStyle = "#654321"; // Maro pentru șa
//         ctx.fill();
//         ctx.stroke();
        
//         // Far mare și vizibil
//         ctx.beginPath();
//         ctx.arc(-this.lungime / 2 + 2, 0, 2, 0, 2 * Math.PI);
//         ctx.fillStyle = "#FFF9C4";
//         ctx.fill();
//         ctx.strokeStyle = "#FBC02D";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Stop
//         ctx.beginPath();
//         ctx.rect(this.lungime / 2 - 2, -1, 2, 2);
//         ctx.fillStyle = "#E53935";
//         ctx.fill();
//         ctx.strokeStyle = "#B71C1C";
//         ctx.stroke();
        
//         // Roți (mai mari și mai vizibile)
//         ctx.beginPath();
//         ctx.arc(-this.lungime / 2.5, 0, 3, 0, 2 * Math.PI);
//         ctx.fillStyle = "#212121";
//         ctx.fill();
//         ctx.strokeStyle = "#666";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         ctx.beginPath();
//         ctx.arc(this.lungime / 2.5, 0, 3, 0, 2 * Math.PI);
//         ctx.fillStyle = "#212121";
//         ctx.fill();
//         ctx.strokeStyle = "#666";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Ghidon (mai vizibil)
//         ctx.beginPath();
//         ctx.rect(-4, -this.latime / 2 - 2, 8, 2);
//         ctx.fillStyle = "#666";
//         ctx.fill();
//         ctx.stroke();
        
//         // Oglinzi retrovizoare
//         ctx.beginPath();
//         ctx.rect(-2, -this.latime / 2 - 3, 1, 1);
//         ctx.rect(1, -this.latime / 2 - 3, 1, 1);
//         ctx.fillStyle = "#888";
//         ctx.fill();
//     }

//     deseneazaAutobuz(ctx) {
//         // Caroseria
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
//         ctx.fillStyle = this.culoare;
//         ctx.fill();
//         ctx.strokeStyle = "black";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Ferestre (multiple)
//         for(let i = 0; i < 5; i++) {
//             ctx.beginPath();
//             ctx.rect(-this.lungime / 2 + 3 + i * 6, -this.latime / 2 + 2, 4, this.latime - 4);
//             ctx.fillStyle = "#87CEEB";
//             ctx.fill();
//         }
        
//         // Parbriz
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2 + 1, -this.latime / 2 + 3, 3, this.latime - 6);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Ușă
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2 + 6, -this.latime / 2, 2, this.latime);
//         ctx.strokeStyle = "#000";
//         ctx.lineWidth = 2;
//         ctx.stroke();
        
//         // Faruri
//         this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
//         this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
//         // Stopuri
//         this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
//         this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
//         // Roți (mai multe pentru autobuz)
//         this.desenareRoata(ctx, -this.lungime / 2 + 5, -this.latime / 2 - 1, 4, 2);
//         this.desenareRoata(ctx, -this.lungime / 2 + 5, this.latime / 2 - 1, 4, 2);
//         this.desenareRoata(ctx, this.lungime / 2 - 9, -this.latime / 2 - 1, 4, 2);
//         this.desenareRoata(ctx, this.lungime / 2 - 9, this.latime / 2 - 1, 4, 2);
//     }

//     deseneazaCamion(ctx) {
//         // Cabina
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime / 3, this.latime);
//         ctx.fillStyle = this.culoare;
//         ctx.fill();
//         ctx.strokeStyle = "black";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Remorca
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 6, -this.latime / 2, 2 * this.lungime / 3, this.latime);
//         ctx.fillStyle = "#E0E0E0";
//         ctx.fill();
//         ctx.stroke();
        
//         // Parbriz cabină
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2 + 2, -this.latime / 2 + 2, 6, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Faruri
//         this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
//         this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
//         // Stopuri
//         this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
//         this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
//         // Roți cabină
//         this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
        
//         // Roți remorcă
//         this.desenareRoata(ctx, this.lungime / 6, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 6, this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
//     }

//     deseneazaTaxi(ctx) {
//         // Caroseria (similară cu sedan)
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
//         ctx.fillStyle = "#FFD600"; // Galben taxi
//         ctx.fill();
//         ctx.strokeStyle = "black";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Semnul TAXI pe capotă
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 4, -this.latime / 2 - 2, this.lungime / 2, 2);
//         ctx.fillStyle = "#000";
//         ctx.fill();
        
//         ctx.fillStyle = "#FFF";
//         ctx.font = "3px Arial";
//         ctx.textAlign = "center";
//         ctx.fillText("TAXI", 0, -this.latime / 2);
        
//         // Parbriz
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2 + 3, -this.latime / 2 + 2, 8, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Luneta
//         ctx.beginPath();
//         ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 2, 7, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Faruri
//         this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
//         this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
//         // Stopuri
//         this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
//         this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
//         // Roți
//         this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
//     }

//     deseneazaPolitie(ctx) {
//         // Caroseria
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
//         ctx.fillStyle = "#FFF"; // Alb pentru mașina de poliție
//         ctx.fill();
//         ctx.strokeStyle = "black";
//         ctx.lineWidth = 1;
//         ctx.stroke();
        
//         // Bandă albastră
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2, -2, this.lungime, 4);
//         ctx.fillStyle = "#0000FF";
//         ctx.fill();
        
//         // Girofar
//         ctx.beginPath();
//         ctx.rect(-2, -this.latime / 2 - 3, 4, 2);
//         ctx.fillStyle = "#FF0000";
//         ctx.fill();
        
//         // Parbriz
//         ctx.beginPath();
//         ctx.rect(-this.lungime / 2 + 3, -this.latime / 2 + 2, 8, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Luneta
//         ctx.beginPath();
//         ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 2, 7, this.latime - 4);
//         ctx.fillStyle = "#333";
//         ctx.fill();
        
//         // Faruri
//         this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
//         this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
//         // Stopuri
//         this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
//         this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
//         // Roți
//         this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
//         this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
//     }
    
//     desenareFar(ctx, x, y, width, height) {
//         ctx.beginPath();
//         ctx.rect(x, y, width, height);
//         ctx.fillStyle = "#FFF9C4"; // Galben deschis pentru faruri
//         ctx.fill();
//         ctx.strokeStyle = "#FBC02D"; // Contur galben închis
//         ctx.lineWidth = 0.5;
//         ctx.stroke();
//     }
    
//     desenareStop(ctx, x, y, width, height) {
//         ctx.beginPath();
//         ctx.rect(x, y, width, height);
//         ctx.fillStyle = "#E53935"; // Roșu pentru stopuri
//         ctx.fill();
//         ctx.strokeStyle = "#B71C1C"; // Contur roșu închis
//         ctx.lineWidth = 0.5;
//         ctx.stroke();
//     }
    
//     desenareRoata(ctx, x, y, width, height) {
//         ctx.beginPath();
//         ctx.rect(x, y, width, height);
//         ctx.fillStyle = "#212121"; // Negru pentru roți
//         ctx.fill();
//     }      getCuloareAleatoare() {
//         // Culori specifice pentru anumite tipuri de vehicule
//         if (this.tipMasina === 3) { // Motocicleta - culori vii și vizibile
//             const culoriMotocicleta = ["#FF0000", "#FF6600", "#0066FF", "#00CC00", "#FF00FF", "#FFFF00", "#FF3366", "#3366FF"];
//             return culoriMotocicleta[Math.floor(Math.random() * culoriMotocicleta.length)];
//         } else if (this.tipMasina === 4) { // Autobuz
//             const culoriAutobuz = ["#FFD600", "#FF5722", "#2196F3", "#4CAF50", "#9C27B0"];
//             return culoriAutobuz[Math.floor(Math.random() * culoriAutobuz.length)];
//         } else if (this.tipMasina === 5) { // Camion
//             const culoriCamion = ["#795548", "#607D8B", "#263238", "#424242", "#37474F"];
//             return culoriCamion[Math.floor(Math.random() * culoriCamion.length)];
//         } else if (this.tipMasina === 6) { // Taxi
//             return "#FFD600"; // Galben taxi standard
//         } else if (this.tipMasina === 7) { // Mașină de poliție
//             return "#FFFFFF"; // Alb pentru poliție
//         } else {
//             // Culori generale pentru celelalte vehicule
//             const culori = [
//                 "#F44336", "#E91E63", "#9C27B0", "#673AB7", // roșu, roz, mov
//                 "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", // albastru, cyan
//                 "#009688", "#4CAF50", "#8BC34A", "#CDDC39", // verde
//                 "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", // galben, portocaliu
//                 "#795548", "#9E9E9E", "#607D8B", "#263238"  // maro, gri, albastru-gri
//             ];
//             return culori[Math.floor(Math.random() * culori.length)];        }
//     }
    
//     // Detectează semaforurile din față pe traseul curent
//     detecteazaSemaforDinFata(distantaMaxima) {
//         // Verifică dacă există grupele de semafoare globale
//         if (!window.grupeSemafor || !Array.isArray(window.grupeSemafor)) {
//             return null;
//         }
        
//         let semaforCelMaiAproape = null;
//         let distantaMinima = Infinity;
        
//         // Iterează prin toate grupele de semafoare
//         for (let grupa of window.grupeSemafor) {
//             if (!grupa.semafoare || !Array.isArray(grupa.semafoare)) {
//                 continue;
//             }
            
//             // Verifică fiecare semafor din grupă
//             for (let semafor of grupa.semafoare) {
//                 if (!semafor.banda) {
//                     continue;
//                 }
                
//                 const distantaLaSemafor = this.calculeazaDistantaLaSemafor(semafor);
                
//                 // Verifică dacă semaforul este în față pe traseu
//                 if (this.esteSemaforInFata(semafor, distantaMaxima) && distantaLaSemafor < distantaMinima) {
//                     distantaMinima = distantaLaSemafor;
//                     semaforCelMaiAproape = {
//                         semafor: semafor,
//                         status: semafor.status,
//                         distanta: distantaLaSemafor
//                     };
//                 }
//             }
//         }
        
//         return semaforCelMaiAproape;
//     }
    
//     // Calculează distanța până la un semafor
//     calculeazaDistantaLaSemafor(semafor) {
//         const dx = semafor.banda.x - this.pozitieCurenta.x;
//         const dy = semafor.banda.y - this.pozitieCurenta.y;
//         return Math.sqrt(dx * dx + dy * dy);
//     }
    
//     // Verifică dacă semaforul este în fața mașinii pe traseu
//     esteSemaforInFata(semafor, distantaMaxima) {
//         const distantaLaSemafor = this.calculeazaDistantaLaSemafor(semafor);
        
//         // Prea departe
//         if (distantaLaSemafor > distantaMaxima) {
//             return false;
//         }
        
//         // Verifică dacă semaforul este pe traseul mașinii
//         // Caută punctul cel mai apropiat din traseu la semafor
//         for (let i = this.indexPunctCurent; i < this.traseu.length; i++) {
//             const punctTraseu = this.traseu[i];
//             const distantaSemaforLaPunct = Math.sqrt(
//                 Math.pow(semafor.banda.x - punctTraseu.x, 2) + 
//                 Math.pow(semafor.banda.y - punctTraseu.y, 2)
//             );
            
//             // Dacă semaforul este foarte aproape de un punct din traseu (toleranță de 30 pixeli)
//             if (distantaSemaforLaPunct <= 30) {
//                 // Verifică dacă punctul din traseu este în față (indexul mai mare decât cel curent)
//                 return i >= this.indexPunctCurent;
//             }
//         }
        
//         return false;
//     }
    
//     // Detectează mașinile oprite la un semafor
//     detecteazaMasiniOpriteLaSemafor(semaforInfo) {
//         // Verifică dacă există mașini oprite între această mașină și semafor
//         const masiniActive = getMasini();
//         const masiniOpriteLaSemafor = [];
        
//         for (const masina of masiniActive) {
//             // Ignoră mașina curentă
//             if (masina === this) continue;
            
//             // Verifică doar mașinile care sunt pe același traseu și în aceeași direcție
//             if (!this.suntPeAcelasiTraseu(masina)) continue;
            
//             // Verifică dacă mașina este aproape de semafor
//             const distantaMasinaLaSemafor = masina.calculeazaDistantaLaSemafor(semaforInfo.semafor);
            
//             // Verifică dacă mașina este între această mașină și semafor
//             if (distantaMasinaLaSemafor < semaforInfo.distanta && 
//                 distantaMasinaLaSemafor < 60 && 
//                 this.esteMasinaInFata(masina)) {
                
//                 // Verifică dacă mașina este oprită sau aproape oprită
//                 if (masina.calculezaVitezaEfectiva() < 0.2) {
//                     masiniOpriteLaSemafor.push(masina);
//                 }
//             }
//         }
        
//         return masiniOpriteLaSemafor;
//     }
// }

// // Funcții pentru gestionarea animației mașinilor
// let masini = [];
// let animatieRuleaza = false;

// export function initAnimatieMasini() {
//     masini = [];
//     contorMasiniTrecute = 0;
//     animatieRuleaza = false;
// }

// export function adaugaMasina(traseu, viteza = 2, routeId = null) {
//     const masinaNoua = new Masina(traseu, viteza, routeId);
//     masini.push(masinaNoua);
    
//     // Pornește animația dacă nu rulează deja
//     if (!animatieRuleaza) {
//         animatieRuleaza = true;
//         requestAnimationFrame(updateAnimatieMasini);
//     }
    
//     return masinaNoua;
// }

// export function getMasini() {
//     return masini;
// }

// export function clearMasini() {
//     contorMasiniTrecute = 0;
//     masini = [];
// }

// // Funcție pentru resetarea contorului de mașini trecute
// export function resetContorMasini() {
//     contorMasiniTrecute = 0;
// }

// // Funcție pentru obținerea valorii curente a contorului
// export function getContorMasiniTrecute() {
//     return contorMasiniTrecute;
// }

// export function setContorMasiniTrecute(val) {
//     contorMasiniTrecute=val;
// }

// let drawSceneCallback = null;

// export function setDrawSceneCallback(callback) {
//     //console.log("📋 Setez drawSceneCallback:", callback ? "✅ funcție validă" : "❌ null/undefined");
//     drawSceneCallback = callback;
// }

// function updateAnimatieMasini() {
//     //console.log("🔄 updateAnimatieMasini - mașini active:", masini.length);
    
//     // Actualizează poziția fiecărei mașini
//     for (let i = 0; i < masini.length; i++) {
//         masini[i].updatePozitie();
        
//         // Elimină mașinile care au ajuns la destinație
//         if (masini[i].terminat) {
//             masini.splice(i, 1);
//             i--;
//         }
//     }
    
//     // Redesenează scena dacă este disponibil callback-ul
//     if (drawSceneCallback) 
//         drawSceneCallback();
    
    
//     // IMPORTANT: Continuă animația întotdeauna dacă este rulând
//     // Nu o opri doar pentru că nu sunt mașini momentan
//     if (animatieRuleaza) {
//         requestAnimationFrame(updateAnimatieMasini);
//         if (masini.length === 0) {
//             //console.log("⏱ Nu sunt mașini momentan, dar animația continuă...");
//         }
//     } else {
//         //console.log("🛑 Animația a fost oprită explicit");
//     }
// }

// export function genereareMasiniPeTraseeleSalvate(intersectii, numarMasini = 3) {
//     const traseeTotale = [];
    
//     // Colectează toate traseele disponibile
//     for (let inter of intersectii) {
//         if (inter.trasee && inter.trasee.length > 0) {
//             for (let traseu of inter.trasee) {
//                 traseeTotale.push(traseu.puncte);
//             }
//         }
//     }
    
//     if (traseeTotale.length === 0) {
//         alert("Nu există trasee definite pentru simulare!");
//         return false;
//     }
    
//     // Generează mașini aleatorii pe trasee
//     for (let i = 0; i < numarMasini; i++) {
//         const traseAleator = traseeTotale[Math.floor(Math.random() * traseeTotale.length)];
        
//         // Viteza aleatoare între 1 și 4 pixeli pe frame
//         const vitezaAleatoare = 1 + Math.random() * 3;
        
//         adaugaMasina(traseAleator, vitezaAleatoare);
//     }
    
//     return true;
// }

// // Pentru debug - face contorul accesibil din consola browser-ului
// window.getContorMasini = function() {
//     console.log('Contor mașini trecute:', contorMasiniTrecute);
//     console.log('Mașini active:', masini.length);
//     return contorMasiniTrecute;
// };

// window.afiseazaStatisticMasini = function() {
//     console.log('=== STATISTICI MAȘINI ===');
//     console.log('Mașini active:', masini.length);
//     console.log('Mașini ajunse la destinație:', contorMasiniTrecute);
//     console.log('Total mașini procesate:', masini.length + contorMasiniTrecute);
// };

// // Verifică dacă se poate spawna o mașină pe ruta dată (nu există deja o mașină prea aproape de start)
// export function canSpawnCarOnRoute(routeId, routePoints, minDist = 40) {
//     if (!routeId || !routePoints || routePoints.length === 0) return true;
//     const masiniActive = getMasini();
//     const start = routePoints[0];
//     for (let masina of masiniActive) {
//         if (masina.routeId === routeId && !masina.terminat) {
//             // Distanța de la începutul rutei la poziția mașinii
//             const dx = masina.pozitieCurenta.x - start.x;
//             const dy = masina.pozitieCurenta.y - start.y;
//             const dist = Math.sqrt(dx * dx + dy * dy);
//             if (dist < minDist) {
//                 return false; // Există deja o mașină prea aproape de start
//             }
//         }
//     }
//     return true;
// }

// import { 
//     getCuloareAleatoare, 
//     deseneazaSedan, 
//     deseneazaSUV, 
//     deseneazaSport, 
//     deseneazaMotocicleta,
//     deseneazaAutobuz,
//     deseneazaCamion,
//     deseneazaTaxi,
//     deseneazaPolitie,
//     getDimensiuniVehicul
// } from './DesignMasini.js';

// class Masina {
//     constructor(x, y, unghi, tipMasina = 0, viteza = 2, routeId = null) {
//         // Poziția și orientarea
//         this.x = x;
//         this.y = y;
//         this.unghi = unghi; // în radiani

//         this.tipMasina = tipMasina; 
//         this.viteza = viteza;
//         this.vitezaMaxima = viteza;
        
//         // Dimensiuni
//         const dimensiuni = getDimensiuniVehicul(tipMasina);
//         this.lungime = dimensiuni.lungime;
//         this.latime  = dimensiuni.latime;
        
//         // Traseu
//         this.punctStart = null;
//         this.punctEnd = null;
//         this.traseu = [];       // lista de puncte (obj. {x, y})
//         this.indexTraseu = 0;   // indexul punctului următor de atins
        
//         // Stări
//         this.activa = true;
//         this.opreste = false;
//         this.opritLaSemafor = false;
//         this.vitezaAnterioara = this.viteza;

//         this.distantaDetectieSemafor = 20; // raza inițială de detecție

//         // Culoare
//         this.culoare = getCuloareAleatoare(this.tipMasina);

//         // ID-ul rutei (folosit la server sau la notificare)
//         this.routeId = routeId || null;
//     }
    
//     setTraseu(punctStart, punctEnd, traseu) {
//         this.punctStart = punctStart;
//         this.punctEnd = punctEnd;
//         this.traseu = traseu || [punctStart, punctEnd];
//         this.indexTraseu = 0;
//     }
    
//     // Calculează distanța între poziția curentă și banda semaforului
//     calculeazaDistantaLaSemafor(semafor) {
//         const dx = semafor.banda.x - this.x;
//         const dy = semafor.banda.y - this.y;
//         return Math.hypot(dx, dy);
//     }

//     /**
//      * Verifică dacă semaforul se află efectiv pe traseul mașinii, 
//      * într-un punct cu index >= indexTraseu (adică în față), 
//      * și totodată distanța lui la mașină <= distantaMaxima.
//      */
//     esteSemaforInFata(semafor, distantaMaxima = 60) {
//         // 1. Mai întâi, distanța directă la semafor
//         const distantaLaSemafor = this.calculeazaDistantaLaSemafor(semafor);
//         if (distantaLaSemafor > distantaMaxima) {
//             return false; // prea departe
//         }

//         // 2. Verificăm dacă semaforul e aproape de unul dintre punctele 
//         // traseului, începând de la indexTraseu
//         for (let i = this.indexTraseu; i < this.traseu.length; i++) {
//             const punctTraseu = this.traseu[i];
//             const dx = semafor.banda.x - punctTraseu.x;
//             const dy = semafor.banda.y - punctTraseu.y;
//             const distPt = Math.hypot(dx, dy);
//             // Toleranță: 30 pixeli (sau ajustați după cum aveți nevoie)
//             if (distPt <= 30) {
//                 // Dacă semaforul se găsește pe acel punct (sau aproape),
//                 // înseamnă că e „pe traseu, la în față”
//                 return true;
//             }
//         }

//         return false;
//     }

//     /**
//      * Caută în window.grupeSemafor semaforul din față, folosind noua funcție
//      * de detecție bazată pe traseu.
//      */
//     detecteazaSemaforDinFata(distantaMaxima = 60) {
//         if (!window.grupeSemafor || !Array.isArray(window.grupeSemafor)) {
//             return null;
//         }
//         let semaforCelMaiAproape = null;
//         let distantaMinima = Infinity;

//         for (let grupa of window.grupeSemafor) {
//             if (!grupa.semafoare || !Array.isArray(grupa.semafoare)) continue;
//             for (let semafor of grupa.semafoare) {
//                 if (!semafor.banda) continue;
//                 // Folosim noua funcție ca filtru „pe traseu”
//                 if (!this.esteSemaforInFata(semafor, distantaMaxima)) {
//                     continue;
//                 }
//                 // Distanța geometrică, ca să alegem cel mai apropiat
//                 const d = this.calculeazaDistantaLaSemafor(semafor);
//                 if (d < distantaMinima) {
//                     distantaMinima = d;
//                     semaforCelMaiAproape = semafor;
//                 }
//             }
//         }
//         return semaforCelMaiAproape;
//     }

//     actualizeaza() {
//         // 0. Dacă mașina nu e activă sau e oprită manual sau n-are traseu, ieșim
//         if (!this.activa || this.opreste || this.traseu.length === 0) {
//             return;
//         }

//         // 1. Detectăm semaforul "în față"
//         const semafor = this.detecteazaSemaforDinFata(this.distantaDetectieSemafor);

//         if (semafor) {
//             const distLaSemafor = this.calculeazaDistantaLaSemafor(semafor);

//             // 2.a. Dacă semaforul e roșu și e aproape (<= lungime*1.2), oprește mașina
//             if (semafor.status === 'red' && distLaSemafor < this.lungime * 1.2) {
//                 if (!this.opritLaSemafor) {
//                     this.opritLaSemafor = true;
//                     this.vitezaAnterioara = this.viteza;
//                     this.viteza = 0;
//                 }
//                 // ieșim din actualizare (rămâne oprită)
//                 return;
//             }

//             // 2.b. Dacă semaforul e verde și mașina era oprită, pornește-o
//             if (semafor.status === 'green' && this.opritLaSemafor) {
//                 this.opritLaSemafor = false;
//                 this.viteza = this.vitezaAnterioara || this.vitezaMaxima;
//             }
//         }

//         // 3. Dacă nu e blocată la semafor, continuă deplasarea normală pe traseu

//         let punctTinta = this.gasestePunctulUrmator();
//         if (!punctTinta) {
//             this.activa = false;
//             return;
//         }
//         const dx = punctTinta.x - this.x;
//         const dy = punctTinta.y - this.y;
//         const distanta = Math.hypot(dx, dy);

//         // 4. Coliziuni cu alte mașini (codul vostru existent)
//         const distantaSiguranta = this.lungime * 0.5;
//         for (const m of getMasini()) {
//             if (m === this) continue;
//             if (m.traseu === this.traseu && m.indexTraseu >= this.indexTraseu) {
//                 const dxM = m.x - this.x;
//                 const dyM = m.y - this.y;
//                 const d = Math.hypot(dxM, dyM);

//                 // oprire dacă sunt prea aproape
//                 if (d < this.lungime * 0.8) {
//                     this.viteza = 0;
//                     return;
//                 }
//                 // încetinire dacă sunt în zona de siguranță + lungime
//                 if (d < distantaSiguranta + m.lungime) {
//                     if (m.viteza > 0) {
//                         this.viteza = Math.min(this.vitezaMaxima, m.viteza * 0.9);
//                     } else {
//                         this.viteza = Math.max(0, this.viteza - 0.1);
//                     }
//                     return;
//                 }
//             }
//         }

//         // 5. Dacă nu e blocaj, accelerează până la viteza maximă
//         this.viteza = Math.min(this.vitezaMaxima, this.viteza + 0.05);

//         // 6. Dacă e aproape de punctul curent, incrementăm indexTraseu
//         if (distanta < 10) {
//             this.indexTraseu++;
//             return;
//         }

//         // 7. Rotează și deplasează mașina spre punct
//         const unghiTinta = Math.atan2(dy, dx);
//         this.unghi = unghiTinta;
//         this.x += Math.cos(this.unghi) * this.viteza;
//         this.y += Math.sin(this.unghi) * this.viteza;
//     }
    
//     gasestePunctulUrmator() {
//         if (this.indexTraseu >= this.traseu.length) {
//             return null;
//         }
//         return this.traseu[this.indexTraseu];
//     }
    
//     deseneaza(ctx) {
//         if (!this.activa) return;
        
//         ctx.save();
//         ctx.translate(this.x, this.y);
//         ctx.rotate(this.unghi);
        
//         switch(this.tipMasina) {
//             case 0: deseneazaSedan(ctx, this); break;
//             case 1: deseneazaSUV(ctx, this); break;
//             case 2: deseneazaSport(ctx, this); break;
//             case 3: deseneazaMotocicleta(ctx, this); break;
//             case 4: deseneazaAutobuz(ctx, this); break;
//             case 5: deseneazaCamion(ctx, this); break;
//             case 6: deseneazaTaxi(ctx, this); break;
//             case 7: deseneazaPolitie(ctx, this); break;
//             default: deseneazaSedan(ctx, this); break;
//         }
        
//         ctx.restore();
//     }
    
//     aAjunsLaDestinatie() {
//         if (!this.punctEnd) return false;
//         const dx = this.punctEnd.x - this.x;
//         const dy = this.punctEnd.y - this.y;
//         const distanta = Math.hypot(dx, dy);
//         return distanta < 15;
//     }
    
//     opreste() {
//         this.opreste = true;
//         this.viteza = 0;
//     }
    
//     porneste() {
//         this.opreste = false;
//         this.viteza = this.vitezaMaxima;
//     }
    
//     setViteza(vitezaNoua) {
//         this.viteza = vitezaNoua;
//         this.vitezaMaxima = vitezaNoua;
//     }
    
//     reset(x, y, unghi) {
//         this.x = x;
//         this.y = y;
//         this.unghi = unghi;
//         this.indexTraseu = 0;
//         this.activa = true;
//         this.opreste = false;
//         this.viteza = this.vitezaMaxima;
//         this.opritLaSemafor = false;
//         this.vitezaAnterioara = this.viteza;
//     }
// }

// // Helper pentru a crea o mașină nouă cu traseu
// export function creazaMasinaNoua(xStart, yStart, xEnd, yEnd, tipMasina = 0, viteza = 1.5) {
//     viteza = Math.min(viteza, 1.5);
//     const unghi = Math.atan2(yEnd - yStart, xEnd - xStart);
//     const masina = new Masina(xStart, yStart, unghi, tipMasina, viteza);
//     const punctStart = { x: xStart, y: yStart };
//     const punctEnd   = { x: xEnd,   y: yEnd   };
//     masina.setTraseu(punctStart, punctEnd, [punctStart, punctEnd]);
//     return masina;
// }

// export let masini = [];
// let drawSceneCallback = null;
// let trafficSimulatorRef = null;

// export function adaugaMasina(traseu, viteza = 1.5, routeId = null) {
//     if (!traseu || traseu.length < 2) return null;
//     viteza = Math.min(viteza, 1.5);
//     const start = traseu[0];
//     const end   = traseu[traseu.length - 1];
//     const tipMasina = Math.floor(Math.random() * 8);
//     const masina = new Masina(
//         start.x,
//         start.y,
//         Math.atan2(end.y - start.y, end.x - start.x),
//         tipMasina,
//         viteza,
//         routeId
//     );
//     masina.setTraseu(start, end, traseu);
//     masini.push(masina);
//     return masina;
// }

// export function getMasini() {
//     return masini;
// }

// export function clearMasini() {
//     masini = [];
// }

// export function resetContorMasini() {
//     // (opțional de implementat)
// }

// export function setDrawSceneCallback(cb) {
//     drawSceneCallback = cb;
// }

// export function setTrafficSimulatorRef(ref) {
//     trafficSimulatorRef = ref;
// }

// export function initAnimatieMasini() {
//     window.verificaMasiniOprite = function() {
//         let oprite = 0,
//             total = masini.length,
//             laSemafor = 0;
        
//         for (const m of masini) {
//             if (m.viteza === 0) {
//                 oprite++;
//                 if (m.opritLaSemafor) laSemafor++;
//             }
//         }
//         console.log(`Status mașini: ${oprite}/${total} oprite, ${laSemafor} la semafoare`);
//     };
//     setInterval(window.verificaMasiniOprite, 3000);

//     function animLoop() {
//         for (let i = 0; i < masini.length; i++) {
//             const masina = masini[i];
//             masina.actualizeaza();
//             if (masina.aAjunsLaDestinatie()) {
//                 if (
//                     masina.routeId &&
//                     trafficSimulatorRef &&
//                     typeof trafficSimulatorRef.incrementRouteCounter === 'function'
//                 ) {
//                     trafficSimulatorRef.incrementRouteCounter(masina.routeId);
//                 }
//                 masini.splice(i, 1);
//                 i--;
//             }
//         }
//         if (drawSceneCallback) drawSceneCallback();
//         requestAnimationFrame(animLoop);
//     }
//     requestAnimationFrame(animLoop);
// }

// export function genereareMasiniPeTraseeleSalvate(intersectii, numarMasini = 5) {
//     if (!intersectii) return;
//     intersectii.forEach(inter => {
//         let trasee =
//             inter.trasee ||
//             (inter.data &&
//                 inter.data.intersectii &&
//                 inter.data.intersectii[0] &&
//                 inter.data.intersectii[0].trasee) ||
//             [];
//         trasee.forEach(traseu => {
//             if (traseu.puncte && Array.isArray(traseu.puncte) && traseu.puncte.length > 1) {
//                 for (let i = 0; i < numarMasini; i++) {
//                     adaugaMasina(traseu.puncte, 0.8 + Math.random() * 0.7);
//                 }
//             }
//         });
//     });
// }

// export function canSpawnCarOnRoute(routeId, points) {
//     if (!points || points.length < 2) return true;
//     const start = points[0];
//     for (const masina of masini) {
//         if (masina.routeId === routeId) {
//             const dx = masina.x - start.x;
//             const dy = masina.y - start.y;
//             if (Math.hypot(dx, dy) < 40) {
//                 return false;
//             }
//         }
//     }
//     return true;
// }

// // --- Funcție globală pentru a găsi semaforul la o poziție ---
// if (typeof window.getSemaforLaPozitie !== 'function') {
//     window.getSemaforLaPozitie = function(x, y) {
//         if (window.semafoare && Array.isArray(window.semafoare)) {
//             let minDist = 50;
//             let semaforGasit = null;
//             for (const sem of window.semafoare) {
//                 if (sem && sem.banda && sem.banda.x !== undefined && sem.banda.y !== undefined) {
//                     const d = Math.hypot(sem.banda.x - x, sem.banda.y - y);
//                     if (d < minDist) {
//                         minDist = d;
//                         semaforGasit = sem;
//                     }
//                 }
//             }
//             if (semaforGasit && typeof semaforGasit.status === 'string') {
//                 return semaforGasit;
//             }
//         }
//         return null;
//     };
// }

// // =====================================================
// // Funcție globală pentru notificarea schimbării semafoarelor
// // Când un semafor se face verde, pornește toate mașinile cu viteza 0 de pe ruta respectivă
// // =====================================================

// window.notificareSemaforSchimbat = function(semafoareVerzi) {
//     if (!Array.isArray(semafoareVerzi) || semafoareVerzi.length === 0) {
//         console.log("❌ Nu există semafoare verzi pentru notificare");
//         return;
//     }
//     let masiniPornite = 0;
//     // Construiește un set cu routeId‐urile rutele verzi
//     const ruteVerzi = new Set();
//     for (const semaforVerde of semafoareVerzi) {
//         const ruteControlate = obtineRuteControlateDeSemanfor(semaforVerde);
//         ruteControlate.forEach(routeId => ruteVerzi.add(routeId));
//     }
//     // Pentru fiecare mașină, dacă viteza == 0 și ruta e în rutele verzi => o pornește
//     for (const masina of masini) {
//         if (!masina.activa) continue;
//         if (masina.viteza === 0 && masina.routeId && ruteVerzi.has(masina.routeId)) {
//             masina.viteza = masina.vitezaMaxima * 0.8;
//             masina.opritLaSemafor = false;
//             masiniPornite++;
//         }
//     }
//     if (masiniPornite > 0) {
//         console.log(`✅ ${masiniPornite} mașini au pornit SIMULTAN la semafor verde!`);
//     }
// };

// // Returnează array cu routeId‐urile rutelor controlate de un semafor
// function obtineRuteControlateDeSemanfor(semafor) {
//     const ruteControlate = [];
//     if (window.trafficSimulator && window.trafficSimulator.routes) {
//         for (const route of window.trafficSimulator.routes) {
//             if (route.points && route.points.length > 0 && semafor.banda) {
//                 const punctStart = route.points[0];
//                 const dist = Math.hypot(semafor.banda.x - punctStart.x, semafor.banda.y - punctStart.y);
//                 if (dist <= 80) {
//                     ruteControlate.push(route.id);
//                 }
//             }
//         }
//     }
//     return ruteControlate;
// }

// export default Masina;
