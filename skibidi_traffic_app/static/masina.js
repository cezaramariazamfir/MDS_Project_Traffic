export default class Masina {    constructor(traseu, viteza = 2) {
        this.traseu = traseu; // Lista de puncte de urmat
        this.viteza = viteza; // Pixeli per frame
        this.indexPunctCurent = 0; // Indexul punctului curent din traseu
        this.pozitieCurenta = { ...traseu[0] }; // Începe de la primul punct
        this.terminat = false; // Flag pentru a indica dacă a terminat traseul
        this.tipMasina = Math.floor(Math.random() * 8); // 0=sedan, 1=SUV, 2=sport, 3=motocicleta, 4=autobuz, 5=camion, 6=taxi, 7=masina_politie
        this.culoare = this.getCuloareAleatoare(); // Culoare aleatoare pentru mașină
        this.setDimensiuni(); // Setează dimensiunile în funcție de tip
        this.unghi = 0; // Unghiul de rotație în radiani
        
        // Debug: afișează tipul vehiculului creat
        console.log(`Mașină creată: tip ${this.tipMasina} (${this.getTipVehicul()}), culoare: ${this.culoare}`);
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
                break;            case 3: // Motocicleta
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
            this.terminat = true; // Mașina a ajuns la destinație
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
    }    // Calculează viteza efectivă luând în considerare mașinile din față
    calculezaVitezaEfectiva() {
        const distantaMinimaSiguranta = this.lungime + 8; // Distanța minimă de siguranță
        const masinaAproape = this.detecteazaMasinaDinFata(distantaMinimaSiguranta * 2);
        
        if (masinaAproape) {
            const distantaLaMasina = this.calculeazaDistantaLaMasina(masinaAproape);
            
            if (distantaLaMasina < distantaMinimaSiguranta) {
                // Oprește complet dacă este prea aproape
                console.log(`${this.getTipVehicul()} oprește - prea aproape de altă mașină (${distantaLaMasina.toFixed(1)}px)`);
                return 0;
            } else if (distantaLaMasina < distantaMinimaSiguranta * 1.5) {
                // Încetinește progresiv
                const factorIncetinire = (distantaLaMasina - distantaMinimaSiguranta) / (distantaMinimaSiguranta * 0.5);
                const vitezaRedusa = this.viteza * factorIncetinire * 0.3;
                console.log(`${this.getTipVehicul()} încetinește - distanță ${distantaLaMasina.toFixed(1)}px, viteză redusă la ${vitezaRedusa.toFixed(2)}`);
                return vitezaRedusa;
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
    }

    // Verifică dacă două mașini sunt pe același traseu sau trasee similare
    suntPeAcelasiTraseu(altaMasina) {
        // Verifică dacă traseele au puncte comune sau sunt foarte aproape
        const toleranta = 15; // Pixeli de toleranță pentru trasee paralele
        
        // Compară punctele actuale și următoarele
        const punctulMeuCurent = this.pozitieCurenta;
        const punctulSauCurent = altaMasina.pozitieCurenta;
        
        const distantaIntrePuncte = Math.sqrt(
            Math.pow(punctulMeuCurent.x - punctulSauCurent.x, 2) + 
            Math.pow(punctulMeuCurent.y - punctulSauCurent.y, 2)
        );
        
        if (distantaIntrePuncte > toleranta * 3) return false;
        
        // Verifică direcția - dacă merg în aceeași direcție
        const directiaMea = this.unghi;
        const directiaSa = altaMasina.unghi;
        const diferentaUnghi = Math.abs(directiaMea - directiaSa);
        
        // Consideră că sunt pe același traseu dacă direcțiile sunt similare (±30 grade)
        return diferentaUnghi < Math.PI / 6 || diferentaUnghi > (2 * Math.PI - Math.PI / 6);
    }

    // Verifică dacă o mașină este în față pe traseu
    esteMasinaInFata(altaMasina) {
        // Calculează progresul pe traseu pentru ambele mașini
        const progresulMeu = this.calculeazaProgresulPeTraseu();
        const progresulSau = altaMasina.calculeazaProgresulPeTraseu();
        
        // Dacă sunt pe trasee diferite, compară pozițiile în direcția de mers
        const dx = altaMasina.pozitieCurenta.x - this.pozitieCurenta.x;
        const dy = altaMasina.pozitieCurenta.y - this.pozitieCurenta.y;
        
        // Produsul scalar cu direcția de mers
        const produsScalar = dx * Math.cos(this.unghi) + dy * Math.sin(this.unghi);
        
        return produsScalar > 0; // Pozitiv înseamnă că este în față
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
    }

    // Calculează distanța euclidiană până la o altă mașină
    calculeazaDistantaLaMasina(altaMasina) {
        return Math.sqrt(
            Math.pow(this.pozitieCurenta.x - altaMasina.pozitieCurenta.x, 2) + 
            Math.pow(this.pozitieCurenta.y - altaMasina.pozitieCurenta.y, 2)
        );
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
            return culori[Math.floor(Math.random() * culori.length)];
        }
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