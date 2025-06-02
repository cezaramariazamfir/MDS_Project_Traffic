let contorMasiniTrecute = 0;

// Referință globală către traffic simulator pentru accesul la route counters
let trafficSimulatorRef = null;

export function setTrafficSimulatorRef(ref) {
    trafficSimulatorRef = ref;
}

export default class Masina {    constructor(traseu, viteza = 5, routeId = null) {
        this.traseu = traseu; // Lista de puncte de urmat
        this.viteza = viteza; // Pixeli per frame
        this.indexPunctCurent = 0; // Indexul punctului curent din traseu
        this.pozitieCurenta = { ...traseu[0] }; // Începe de la primul punct
        this.terminat = false; // Flag pentru a indica dacă a terminat traseul
        this.tipMasina = Math.floor(Math.random() * 8); // 0=sedan, 1=SUV, 2=sport, 3=motocicleta, 4=autobuz, 5=camion, 6=taxi, 7=masina_politie
        this.culoare = this.getCuloareAleatoare(); // Culoare aleatoare pentru mașină
        this.setDimensiuni(); // Setează dimensiunile în funcție de tip
        this.unghi = 0; // Unghiul de rotație în radiani
        this.routeId = routeId; // ID-ul rutei pentru tracking per-rută
        
        
    }

    getTipVehicul() {
        const tipuri = ['Sedan', 'SUV', 'Sport', 'Motocicletă', 'Autobuz', 'Camion', 'Taxi', 'Poliție'];
        return tipuri[this.tipMasina] || 'Necunoscut';
    }

    setDimensiuni() {
        switch(this.tipMasina) {
            case 0: // Sedan
                this.lungime = 24;
                this.latime = 12;
                break;
            case 1: // SUV
                this.lungime = 28;
                this.latime = 14;
                break;
            case 2: // Sport
                this.lungime = 26;
                this.latime = 11;
                break;            
            case 3: // Motocicleta
                this.lungime = 22;
                this.latime = 10;
                break;
            case 4: // Autobuz
                this.lungime = 40;
                this.latime = 16;
                break;
            case 5: // Camion
                this.lungime = 35;
                this.latime = 15;
                break;
            case 6: // Taxi
                this.lungime = 24;
                this.latime = 12;
                break;
            case 7: // Masina politie
                this.lungime = 26;
                this.latime = 13;
                break;
            default:
                this.lungime = 24;
                this.latime = 12;
        }
    }    updatePozitie() {
        if (this.indexPunctCurent >= this.traseu.length - 1) {
            if(!this.terminat){
                contorMasiniTrecute++;
                console.log(`Numar de masini ajunse la destinatie: ${contorMasiniTrecute}`);
                
                // Incrementează contorul pentru ruta specifică dacă este disponibil
                if (this.routeId && trafficSimulatorRef && trafficSimulatorRef.incrementRouteCounter) {
                    trafficSimulatorRef.incrementRouteCounter(this.routeId);
                }
                
                this.terminat = true; // Mașina a ajuns la destinație
            }
            
            return;
        }

        const punctUrmator = this.traseu[this.indexPunctCurent + 1];
        const dx = punctUrmator.x - this.pozitieCurenta.x;
        const dy = punctUrmator.y - this.pozitieCurenta.y;
        const distanta = Math.sqrt(dx * dx + dy * dy);
        
        // Actualizează unghiul de rotație pentru a urmări direcția de deplasare
        this.unghi = Math.atan2(dy, dx);

        // Verifică coliziuni cu alte mașini și ajustează viteza
        const vitezaEfectiva = this.calculezaVitezaEfectiva();

        if (distanta <= vitezaEfectiva) {
            // Treci la următorul punct
            this.pozitieCurenta = { ...punctUrmator };
            this.indexPunctCurent++;
        } else {
            // Actualizează poziția curentă cu viteza efectivă
            this.pozitieCurenta.x += (dx / distanta) * vitezaEfectiva;
            this.pozitieCurenta.y += (dy / distanta) * vitezaEfectiva;
        }
    }    // Calculează viteza efectivă luând în considerare mașinile din față și semaforurile
    calculezaVitezaEfectiva() {
        const distantaMinimaSiguranta = this.lungime + 25; // Distanță de siguranță mărită pentru prevenirea suprapunerii
        const distantaDetectie = distantaMinimaSiguranta * 5; // Distanță de detectie mărită pentru reacție mai bună
        
        // Verifică semaforurile din față mai întâi
        const semaforAproape = this.detecteazaSemaforDinFata(100); // Detectează semafoare într-un rază mai mare
        if (semaforAproape) {
            const distantaLaSemafor = semaforAproape.distanta;
            
            if (semaforAproape.status === "red") {
                // Oprește la semafor dacă este roșu - distanță de oprire mărită pentru siguranță
                if (distantaLaSemafor <= 20) {
                    return 0; // Oprește complet cu mai mult spațiu (20px față de 15px)
                } else if (distantaLaSemafor <= 50) {
                    // Încetinește treptat când se apropie de semafor
                    return this.viteza * 0.15; // Încetinire mai agresivă
                } else {
                    // Începe să încetinească din timp
                    const factorIncetinire = Math.max(0.25, distantaLaSemafor / 100);
                    return this.viteza * factorIncetinire;
                }
            } else if (semaforAproape.status === "yellow") {
                // Comportament pentru galben - încetinește sau accelerează în funcție de distanță
                if (distantaLaSemafor <= 30) {
                    return 0; // Oprește dacă este prea aproape (distanță mărită)
                } else if (distantaLaSemafor <= 60) {
                    return this.viteza * 0.3; // Încetinește mai mult
                }
            }
            // Pentru verde sau distanțe mari, continuă cu verificarea mașinilor
        }
        
        const masinaAproape = this.detecteazaMasinaDinFata(distantaDetectie);
        
        if (masinaAproape) {
            const distantaLaMasina = this.calculeazaDistantaLaMasina(masinaAproape);
            
            // Verifică doar dacă sunt într-adevăr în intersecție (mai strict)
            const esteInIntersectie = this.verificaPuncteComune(masinaAproape, 15);
            const distantaAdjustata = esteInIntersectie ? distantaMinimaSiguranta * 1.8 : distantaMinimaSiguranta;
            
            // Oprire completă pentru evitarea suprapunerii
            if (distantaLaMasina <= distantaMinimaSiguranta * 0.9) {
                return 0; // Oprește complet când este prea aproape
            }
            
            if (distantaLaMasina <= distantaAdjustata) {
                // Viteza foarte redusă când este aproape
                const vitezaMinima = esteInIntersectie ? 0.05 : 0.1; 
                return vitezaMinima;
            } else if (distantaLaMasina <= distantaAdjustata * 1.5) {
                // Încetinire graduală în zona de siguranță extinsă
                const factorDistanta = (distantaLaMasina - distantaAdjustata) / (distantaAdjustata * 0.5);
                return this.viteza * Math.max(0.2, factorDistanta * 0.6);
            } else {
                // Adaptarea mai gradată a vitezei pentru distanțe mai mari
                const distantaUtila = distantaDetectie - distantaAdjustata;
                const distantaRamasa = distantaLaMasina - distantaAdjustata;
                
                // Factor de adaptare mai sigur
                let factorAdaptare = Math.min(1.0, distantaRamasa / distantaUtila);
                factorAdaptare = Math.max(0.4, factorAdaptare); // Viteza minimă mărită pentru fluiditate
                
                return this.viteza * factorAdaptare;
            }
        }
        
        return this.viteza; // Viteza normală
    }

    // Detectează dacă există o mașină în față pe același traseu
    detecteazaMasinaDinFata(distantaMaxima) {
        const masinileActive = getMasini();
        let masinaCeaMaiAproape = null;
        let distantaMinima = Infinity;

        for (let masina of masinileActive) {
            if (masina === this) continue; // Ignoră mașina curentă
            
            // Verifică dacă sunt pe același traseu sau trasee similare
            if (this.suntPeAcelasiTraseu(masina)) {
                // Verifică dacă mașina este în față (progres mai mare pe traseu)
                if (this.esteMasinaInFata(masina)) {
                    const distanta = this.calculeazaDistantaLaMasina(masina);
                    
                    if (distanta < distantaMaxima && distanta < distantaMinima) {
                        distantaMinima = distanta;
                        masinaCeaMaiAproape = masina;
                    }
                }
            }
        }

        return masinaCeaMaiAproape;
    }    // Verifică dacă două mașini sunt pe același traseu sau trasee similare
    suntPeAcelasiTraseu(altaMasina) {
        // Toleranță mult mai strictă pentru a evita opririle false
        const toleranta = 20; // Redus de la 25 la 20 pentru precizie mai mare
        
        // Compară pozițiile actuale
        const punctulMeuCurent = this.pozitieCurenta;
        const punctulSauCurent = altaMasina.pozitieCurenta;
        
        const distantaIntrePuncte = Math.sqrt(
            Math.pow(punctulMeuCurent.x - punctulSauCurent.x, 2) + 
            Math.pow(punctulMeuCurent.y - punctulSauCurent.y, 2)
        );
        
        // Dacă sunt prea departe, sigur nu sunt pe același traseu
        if (distantaIntrePuncte > toleranta * 2.5) return false; // Rază mărită pentru detecție mai bună
        
        // Verifică direcția - trebuie să meargă în aceeași direcție
        const directiaMea = this.unghi;
        const directiaSa = altaMasina.unghi;
        let diferentaUnghi = Math.abs(directiaMea - directiaSa);
        
        // Normalizează unghiul
        if (diferentaUnghi > Math.PI) {
            diferentaUnghi = 2 * Math.PI - diferentaUnghi;
        }
        
        // Verifică doar mașinile care merg în aceeași direcție (±30 grade în loc de ±45)
        const directieSimilara = diferentaUnghi < Math.PI / 6; // 30 grade toleranță pentru precizie mai mare
        const pozitieApropiata = distantaIntrePuncte < toleranta;
        
        // Verificare suplimentară: mașinile trebuie să fie aproape de același traseu fizic
        const suntPeTraseuSimilar = this.verificaTraseuSimilar(altaMasina, toleranta);
        
        // Returnează true DOAR dacă toate condițiile sunt îndeplinite
        return directieSimilara && pozitieApropiata && suntPeTraseuSimilar;
    }
    
    // Verifică dacă mașinile sunt pe un traseu fizic similar
    verificaTraseuSimilar(altaMasina, toleranta) {
        // Verifică câteva puncte din traseul fiecărei mașini pentru a vedea dacă se suprapun
        const puncteDeVerificat = Math.min(5, this.traseu.length, altaMasina.traseu.length);
        let puncteComune = 0;
        
        for (let i = 0; i < puncteDeVerificat; i++) {
            const indiceMeu = Math.min(this.indexPunctCurent + i, this.traseu.length - 1);
            const indiceSau = Math.min(altaMasina.indexPunctCurent + i, altaMasina.traseu.length - 1);
            
            if (indiceMeu < this.traseu.length && indiceSau < altaMasina.traseu.length) {
                const punctMeu = this.traseu[indiceMeu];
                const punctSau = altaMasina.traseu[indiceSau];
                
                const distanta = Math.sqrt(
                    Math.pow(punctMeu.x - punctSau.x, 2) + 
                    Math.pow(punctMeu.y - punctSau.y, 2)
                );
                
                if (distanta < toleranta) {
                    puncteComune++;
                }
            }
        }
        
        // Cel puțin jumătate din punctele verificate trebuie să fie comune
        return puncteComune >= Math.ceil(puncteDeVerificat / 2);
    }// Verifică dacă două mașini se află pe puncte comune din trasee (intersecții)
    verificaPuncteComune(altaMasina, toleranta) {
        // Verifică doar punctele foarte apropiate și doar dacă mașinile sunt într-adevăr pe acele puncte
        for (let punctMeu of this.traseu) {
            for (let punctSau of altaMasina.traseu) {
                const distanta = Math.sqrt(
                    Math.pow(punctMeu.x - punctSau.x, 2) + 
                    Math.pow(punctMeu.y - punctSau.y, 2)
                );
                
                if (distanta < toleranta) {
                    // Verifică dacă AMBELE mașini sunt foarte aproape de acest punct comun
                    const distantaMeaLaPunct = Math.sqrt(
                        Math.pow(this.pozitieCurenta.x - punctMeu.x, 2) + 
                        Math.pow(this.pozitieCurenta.y - punctMeu.y, 2)
                    );
                    
                    const distantaSaLaPunct = Math.sqrt(
                        Math.pow(altaMasina.pozitieCurenta.x - punctSau.x, 2) + 
                        Math.pow(altaMasina.pozitieCurenta.y - punctSau.y, 2)
                    );
                    
                    // AMBELE trebuie să fie foarte aproape de punctul comun (toleranță mică)
                    if (distantaMeaLaPunct < toleranta && distantaSaLaPunct < toleranta) {
                        return true;
                    }
                }
            }
        }
        return false;
    }    // Verifică dacă o mașină este în față pe traseu
    esteMasinaInFata(altaMasina) {
        // Calculează vectorul către cealaltă mașină
        const dx = altaMasina.pozitieCurenta.x - this.pozitieCurenta.x;
        const dy = altaMasina.pozitieCurenta.y - this.pozitieCurenta.y;
        
        // Calculează produsul scalar cu direcția de mers
        const produsScalar = dx * Math.cos(this.unghi) + dy * Math.sin(this.unghi);
        
        // Pozitiv înseamnă că este în față, verifică și că nu este prea lateral
        const distantaLaterala = Math.abs(-dx * Math.sin(this.unghi) + dy * Math.cos(this.unghi));
        const tolerantaLaterala = this.latime * 1.2; // Toleranță redusă pentru detecție mai precisă
        
        // Verificare suplimentară: mașina în față trebuie să aibă un progres mai mare pe traseu
        const progresulMeu = this.calculeazaProgresulPeTraseu();
        const progresulSau = altaMasina.calculeazaProgresulPeTraseu();
        const estePeAcelasiTraseu = this.suntPeAcelasiTraseu(altaMasina);
        
        // Condițiile pentru a considera că mașina este în față:
        // 1. Produsul scalar pozitiv (în direcția de mers)
        // 2. Distanța laterală mică (pe aceeași bandă)
        // 3. Progres similar pe traseu (sunt pe același traseu)
        // 4. Distanță minimă în față pentru a evita detectarea în paralel
        const esteInFata = produsScalar > 15 && // Mărită distanța minimă de la 10px la 15px
                          distantaLaterala < tolerantaLaterala &&
                          estePeAcelasiTraseu &&
                          (Math.abs(progresulMeu - progresulSau) < 0.3 || progresulSau > progresulMeu);
        
        return esteInFata;
    }

    // Calculează progresul pe traseu (între 0 și 1)
    calculeazaProgresulPeTraseu() {
        if (this.traseu.length <= 1) return 1;
        
        let distantaTotala = 0;
        let distantaParcursa = 0;
        
        // Calculează distanța totală a traseului
        for (let i = 0; i < this.traseu.length - 1; i++) {
            const punct1 = this.traseu[i];
            const punct2 = this.traseu[i + 1];
            distantaTotala += Math.sqrt(
                Math.pow(punct2.x - punct1.x, 2) + 
                Math.pow(punct2.y - punct1.y, 2)
            );
        }
        
        // Calculează distanța parcursă până la poziția curentă
        for (let i = 0; i < this.indexPunctCurent; i++) {
            const punct1 = this.traseu[i];
            const punct2 = this.traseu[i + 1];
            distantaParcursa += Math.sqrt(
                Math.pow(punct2.x - punct1.x, 2) + 
                Math.pow(punct2.y - punct1.y, 2)
            );
        }
        
        // Adaugă distanța de la ultimul punct la poziția curentă
        if (this.indexPunctCurent < this.traseu.length - 1) {
            const punctulAnterior = this.traseu[this.indexPunctCurent];
            distantaParcursa += Math.sqrt(
                Math.pow(this.pozitieCurenta.x - punctulAnterior.x, 2) + 
                Math.pow(this.pozitieCurenta.y - punctulAnterior.y, 2)
            );
        }
        
        return distantaTotala > 0 ? distantaParcursa / distantaTotala : 1;
    }    // Calculează distanța reală între două mașini (ținând cont de dimensiuni)
    calculeazaDistantaLaMasina(altaMasina) {
        // Distanța euclidiană între centrele mașinilor
        const distantaCentre = Math.sqrt(
            Math.pow(this.pozitieCurenta.x - altaMasina.pozitieCurenta.x, 2) + 
            Math.pow(this.pozitieCurenta.y - altaMasina.pozitieCurenta.y, 2)
        );
        
        // Scade lungimea ambelor mașini pentru a obține distanța reală dintre ele
        const distantaReala = distantaCentre - (this.lungime / 2) - (altaMasina.lungime / 2);
        
        // Returnează minimum 0 pentru a evita valorile negative
        return Math.max(0, distantaReala);
    }deseneaza(ctx) {
        ctx.save(); // Salvează starea curentă a contextului
        
        // Translatează la poziția mașinii
        ctx.translate(this.pozitieCurenta.x, this.pozitieCurenta.y);
        
        // Rotește contextul pentru a urmări direcția de deplasare
        ctx.rotate(this.unghi);
        
        // Desenează în funcție de tipul vehiculului
        switch(this.tipMasina) {
            case 0: // Sedan
                this.deseneazaSedan(ctx);
                break;
            case 1: // SUV
                this.deseneazaSUV(ctx);
                break;
            case 2: // Sport
                this.deseneazaSport(ctx);
                break;
            case 3: // Motocicleta
                this.deseneazaMotocicleta(ctx);
                break;
            case 4: // Autobuz
                this.deseneazaAutobuz(ctx);
                break;
            case 5: // Camion
                this.deseneazaCamion(ctx);
                break;
            case 6: // Taxi
                this.deseneazaTaxi(ctx);
                break;
            case 7: // Masina politie
                this.deseneazaPolitie(ctx);
                break;
            default:
                this.deseneazaSedan(ctx);
        }

        ctx.restore(); // Restaurează starea contextului
    }

    deseneazaSedan(ctx) {
        // Caroseria
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
        ctx.fillStyle = this.culoare;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Parbriz
        ctx.beginPath();
        ctx.rect(-this.lungime / 2 + 3, -this.latime / 2 + 2, 8, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Luneta
        ctx.beginPath();
        ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 2, 7, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Faruri
        this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
        this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
        // Stopuri
        this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
        this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
        // Roți
        this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
    }

    deseneazaSUV(ctx) {
        // Caroseria
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
        ctx.fillStyle = this.culoare;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Parbriz
        ctx.beginPath();
        ctx.rect(-this.lungime / 2 + 2, -this.latime / 2 + 2, 10, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Luneta
        ctx.beginPath();
        ctx.rect(this.lungime / 2 - 12, -this.latime / 2 + 2, 10, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
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
        
        // Roți
        this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
    }

    deseneazaSport(ctx) {
        // Caroseria
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
        ctx.fillStyle = this.culoare;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Parbriz
        ctx.beginPath();
        ctx.rect(-this.lungime / 2 + 4, -this.latime / 2 + 3, 6, this.latime - 6);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Luneta
        ctx.beginPath();
        ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 3, 6, this.latime - 6);
        ctx.fillStyle = "#333";
        ctx.fill();
        
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
        
        // Roți
        this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
    }    deseneazaMotocicleta(ctx) {
        // Corp motocicletă (mai mare și mai vizibil)
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
        ctx.fillStyle = this.culoare;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Rezervor (mai proeminent)
        ctx.beginPath();
        ctx.rect(-this.lungime / 3, -this.latime / 2 + 1, this.lungime / 1.5, this.latime - 2);
        ctx.fillStyle = "#333";
        ctx.fill();
        ctx.stroke();
        
        // Șa motocicletă
        ctx.beginPath();
        ctx.rect(this.lungime / 6, -this.latime / 2 + 2, this.lungime / 4, this.latime - 4);
        ctx.fillStyle = "#654321"; // Maro pentru șa
        ctx.fill();
        ctx.stroke();
        
        // Far mare și vizibil
        ctx.beginPath();
        ctx.arc(-this.lungime / 2 + 2, 0, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFF9C4";
        ctx.fill();
        ctx.strokeStyle = "#FBC02D";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Stop
        ctx.beginPath();
        ctx.rect(this.lungime / 2 - 2, -1, 2, 2);
        ctx.fillStyle = "#E53935";
        ctx.fill();
        ctx.strokeStyle = "#B71C1C";
        ctx.stroke();
        
        // Roți (mai mari și mai vizibile)
        ctx.beginPath();
        ctx.arc(-this.lungime / 2.5, 0, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#212121";
        ctx.fill();
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(this.lungime / 2.5, 0, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#212121";
        ctx.fill();
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Ghidon (mai vizibil)
        ctx.beginPath();
        ctx.rect(-4, -this.latime / 2 - 2, 8, 2);
        ctx.fillStyle = "#666";
        ctx.fill();
        ctx.stroke();
        
        // Oglinzi retrovizoare
        ctx.beginPath();
        ctx.rect(-2, -this.latime / 2 - 3, 1, 1);
        ctx.rect(1, -this.latime / 2 - 3, 1, 1);
        ctx.fillStyle = "#888";
        ctx.fill();
    }

    deseneazaAutobuz(ctx) {
        // Caroseria
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
        ctx.fillStyle = this.culoare;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Ferestre (multiple)
        for(let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.rect(-this.lungime / 2 + 3 + i * 6, -this.latime / 2 + 2, 4, this.latime - 4);
            ctx.fillStyle = "#87CEEB";
            ctx.fill();
        }
        
        // Parbriz
        ctx.beginPath();
        ctx.rect(-this.lungime / 2 + 1, -this.latime / 2 + 3, 3, this.latime - 6);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Ușă
        ctx.beginPath();
        ctx.rect(-this.lungime / 2 + 6, -this.latime / 2, 2, this.latime);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Faruri
        this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
        this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
        // Stopuri
        this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
        this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
        // Roți (mai multe pentru autobuz)
        this.desenareRoata(ctx, -this.lungime / 2 + 5, -this.latime / 2 - 1, 4, 2);
        this.desenareRoata(ctx, -this.lungime / 2 + 5, this.latime / 2 - 1, 4, 2);
        this.desenareRoata(ctx, this.lungime / 2 - 9, -this.latime / 2 - 1, 4, 2);
        this.desenareRoata(ctx, this.lungime / 2 - 9, this.latime / 2 - 1, 4, 2);
    }

    deseneazaCamion(ctx) {
        // Cabina
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime / 3, this.latime);
        ctx.fillStyle = this.culoare;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Remorca
        ctx.beginPath();
        ctx.rect(-this.lungime / 6, -this.latime / 2, 2 * this.lungime / 3, this.latime);
        ctx.fillStyle = "#E0E0E0";
        ctx.fill();
        ctx.stroke();
        
        // Parbriz cabină
        ctx.beginPath();
        ctx.rect(-this.lungime / 2 + 2, -this.latime / 2 + 2, 6, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Faruri
        this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
        this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
        // Stopuri
        this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
        this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
        // Roți cabină
        this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
        
        // Roți remorcă
        this.desenareRoata(ctx, this.lungime / 6, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 6, this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
    }

    deseneazaTaxi(ctx) {
        // Caroseria (similară cu sedan)
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
        ctx.fillStyle = "#FFD600"; // Galben taxi
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Semnul TAXI pe capotă
        ctx.beginPath();
        ctx.rect(-this.lungime / 4, -this.latime / 2 - 2, this.lungime / 2, 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        
        ctx.fillStyle = "#FFF";
        ctx.font = "3px Arial";
        ctx.textAlign = "center";
        ctx.fillText("TAXI", 0, -this.latime / 2);
        
        // Parbriz
        ctx.beginPath();
        ctx.rect(-this.lungime / 2 + 3, -this.latime / 2 + 2, 8, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Luneta
        ctx.beginPath();
        ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 2, 7, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Faruri
        this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
        this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
        // Stopuri
        this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
        this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
        // Roți
        this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
    }

    deseneazaPolitie(ctx) {
        // Caroseria
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -this.latime / 2, this.lungime, this.latime);
        ctx.fillStyle = "#FFF"; // Alb pentru mașina de poliție
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Bandă albastră
        ctx.beginPath();
        ctx.rect(-this.lungime / 2, -2, this.lungime, 4);
        ctx.fillStyle = "#0000FF";
        ctx.fill();
        
        // Girofar
        ctx.beginPath();
        ctx.rect(-2, -this.latime / 2 - 3, 4, 2);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        
        // Parbriz
        ctx.beginPath();
        ctx.rect(-this.lungime / 2 + 3, -this.latime / 2 + 2, 8, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Luneta
        ctx.beginPath();
        ctx.rect(this.lungime / 2 - 10, -this.latime / 2 + 2, 7, this.latime - 4);
        ctx.fillStyle = "#333";
        ctx.fill();
        
        // Faruri
        this.desenareFar(ctx, -this.lungime / 2 + 1, -this.latime / 2 + 1, 2, 2);
        this.desenareFar(ctx, -this.lungime / 2 + 1, this.latime / 2 - 3, 2, 2);
        
        // Stopuri
        this.desenareStop(ctx, this.lungime / 2 - 3, -this.latime / 2 + 1, 2, 2);
        this.desenareStop(ctx, this.lungime / 2 - 3, this.latime / 2 - 3, 2, 2);
        
        // Roți
        this.desenareRoata(ctx, -this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, -this.lungime / 3, this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, -this.latime / 2 - 1, 3, 2);
        this.desenareRoata(ctx, this.lungime / 3, this.latime / 2 - 1, 3, 2);
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
    }      getCuloareAleatoare() {
        // Culori specifice pentru anumite tipuri de vehicule
        if (this.tipMasina === 3) { // Motocicleta - culori vii și vizibile
            const culoriMotocicleta = ["#FF0000", "#FF6600", "#0066FF", "#00CC00", "#FF00FF", "#FFFF00", "#FF3366", "#3366FF"];
            return culoriMotocicleta[Math.floor(Math.random() * culoriMotocicleta.length)];
        } else if (this.tipMasina === 4) { // Autobuz
            const culoriAutobuz = ["#FFD600", "#FF5722", "#2196F3", "#4CAF50", "#9C27B0"];
            return culoriAutobuz[Math.floor(Math.random() * culoriAutobuz.length)];
        } else if (this.tipMasina === 5) { // Camion
            const culoriCamion = ["#795548", "#607D8B", "#263238", "#424242", "#37474F"];
            return culoriCamion[Math.floor(Math.random() * culoriCamion.length)];
        } else if (this.tipMasina === 6) { // Taxi
            return "#FFD600"; // Galben taxi standard
        } else if (this.tipMasina === 7) { // Mașină de poliție
            return "#FFFFFF"; // Alb pentru poliție
        } else {
            // Culori generale pentru celelalte vehicule
            const culori = [
                "#F44336", "#E91E63", "#9C27B0", "#673AB7", // roșu, roz, mov
                "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", // albastru, cyan
                "#009688", "#4CAF50", "#8BC34A", "#CDDC39", // verde
                "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", // galben, portocaliu
                "#795548", "#9E9E9E", "#607D8B", "#263238"  // maro, gri, albastru-gri
            ];
            return culori[Math.floor(Math.random() * culori.length)];        }
    }
    
    // Detectează semaforurile din față pe traseul curent
    detecteazaSemaforDinFata(distantaMaxima) {
        // Verifică dacă există grupele de semafoare globale
        if (!window.grupeSemafor || !Array.isArray(window.grupeSemafor)) {
            return null;
        }
        
        let semaforCelMaiAproape = null;
        let distantaMinima = Infinity;
        
        // Iterează prin toate grupele de semafoare
        for (let grupa of window.grupeSemafor) {
            if (!grupa.semafoare || !Array.isArray(grupa.semafoare)) {
                continue;
            }
            
            // Verifică fiecare semafor din grupă
            for (let semafor of grupa.semafoare) {
                if (!semafor.banda) {
                    continue;
                }
                
                const distantaLaSemafor = this.calculeazaDistantaLaSemafor(semafor);
                
                // Verifică dacă semaforul este în față pe traseu
                if (this.esteSemaforInFata(semafor, distantaMaxima) && distantaLaSemafor < distantaMinima) {
                    distantaMinima = distantaLaSemafor;
                    semaforCelMaiAproape = {
                        semafor: semafor,
                        status: semafor.status,
                        distanta: distantaLaSemafor
                    };
                }
            }
        }
        
        return semaforCelMaiAproape;
    }
    
    // Calculează distanța până la un semafor
    calculeazaDistantaLaSemafor(semafor) {
        const dx = semafor.banda.x - this.pozitieCurenta.x;
        const dy = semafor.banda.y - this.pozitieCurenta.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Verifică dacă semaforul este în fața mașinii pe traseu
    esteSemaforInFata(semafor, distantaMaxima) {
        const distantaLaSemafor = this.calculeazaDistantaLaSemafor(semafor);
        
        // Prea departe
        if (distantaLaSemafor > distantaMaxima) {
            return false;
        }
        
        // Verifică dacă semaforul este pe traseul mașinii
        // Caută punctul cel mai apropiat din traseu la semafor
        for (let i = this.indexPunctCurent; i < this.traseu.length; i++) {
            const punctTraseu = this.traseu[i];
            const distantaSemaforLaPunct = Math.sqrt(
                Math.pow(semafor.banda.x - punctTraseu.x, 2) + 
                Math.pow(semafor.banda.y - punctTraseu.y, 2)
            );
            
            // Dacă semaforul este foarte aproape de un punct din traseu (toleranță de 30 pixeli)
            if (distantaSemaforLaPunct <= 30) {
                // Verifică dacă punctul din traseu este în față (indexul mai mare decât cel curent)
                return i >= this.indexPunctCurent;
            }
        }
        
        return false;
    }
}

// Funcții pentru gestionarea animației mașinilor
let masini = [];
let animatieRuleaza = false;

export function initAnimatieMasini() {
    masini = [];
    contorMasiniTrecute = 0;
    animatieRuleaza = false;
}

export function adaugaMasina(traseu, viteza = 2, routeId = null) {
    const masinaNoua = new Masina(traseu, viteza, routeId);
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
    contorMasiniTrecute = 0;
    masini = [];
}

// Funcție pentru resetarea contorului de mașini trecute
export function resetContorMasini() {
    contorMasiniTrecute = 0;
}

// Funcție pentru obținerea valorii curente a contorului
export function getContorMasiniTrecute() {
    return contorMasiniTrecute;
}

export function setContorMasiniTrecute(val) {
    contorMasiniTrecute=val;
}

let drawSceneCallback = null;

export function setDrawSceneCallback(callback) {
    //console.log("📋 Setez drawSceneCallback:", callback ? "✅ funcție validă" : "❌ null/undefined");
    drawSceneCallback = callback;
}

function updateAnimatieMasini() {
    //console.log("🔄 updateAnimatieMasini - mașini active:", masini.length);
    
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
    if (drawSceneCallback) 
        drawSceneCallback();
    
    
    // IMPORTANT: Continuă animația întotdeauna dacă este rulând
    // Nu o opri doar pentru că nu sunt mașini momentan
    if (animatieRuleaza) {
        requestAnimationFrame(updateAnimatieMasini);
        if (masini.length === 0) {
            //console.log("⏱️ Nu sunt mașini momentan, dar animația continuă...");
        }
    } else {
        //console.log("🛑 Animația a fost oprită explicit");
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

// Pentru debug - face contorul accesibil din consola browser-ului
window.getContorMasini = function() {
    console.log('Contor mașini trecute:', contorMasiniTrecute);
    console.log('Mașini active:', masini.length);
    return contorMasiniTrecute;
};

window.afiseazaStatisticMasini = function() {
    console.log('=== STATISTICI MAȘINI ===');
    console.log('Mașini active:', masini.length);
    console.log('Mașini ajunse la destinație:', contorMasiniTrecute);
    console.log('Total mașini procesate:', masini.length + contorMasiniTrecute);
};