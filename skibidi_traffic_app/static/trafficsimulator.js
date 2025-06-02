import { initAnimatieMasini, adaugaMasina, getMasini ,setDrawSceneCallback, genereareMasiniPeTraseeleSalvate, clearMasini, resetContorMasini, setTrafficSimulatorRef } from './masina.js';

/**
 * TrafficSimulator - Clasa pentru controlul avânsat al traficului
 * Permite setarea fluxului de trafic pentru fiecare rută în parte
 */
export class TrafficSimulator {    constructor() {
        this.isSimulationActive = false;
        this.routeFlows = new Map(); // Map cu fluxul pentru fiecare rută
        this.carGenerationIntervals = new Map(); // Intervalele pentru generarea mașinilor
        this.routes = []; // Lista tuturor rutelor disponibile
        this.uiPanel = null; // Panoul UI pentru controlul traficului
        this.intersections = [];
        this.drawSceneCallback = null;
        this.routeCarCounters = new Map(); // Contor pentru mașinile care au trecut prin fiecare rută
        
        // Resetează contorul de mașini trecute la crearea unei noi instanțe
        resetContorMasini();
    }    /**
     * Inițializează simulatorul cu intersecțiile și callback-ul de desenare
     */
    initialize(intersections, drawSceneCallback) {
        this.intersections = intersections;
        this.drawSceneCallback = drawSceneCallback;
        this.extractRoutes();
        setDrawSceneCallback(drawSceneCallback);
        setTrafficSimulatorRef(this); // Set reference for route counters
        initAnimatieMasini();
    }/**
     * Extrage toate rutele din intersecții
     */
    extractRoutes() {
        this.routes = [];
        console.log("🔍 Extragere rute din", this.intersections.length, "intersecții...");
        
        for (let i = 0; i < this.intersections.length; i++) {
            const inter = this.intersections[i];
            
            // Verifică dacă intersecția are trasee definite
            let trasee = [];
            
            // Cazul 1: Intersecție creată dinamic (trasee direct pe obiect)
            if (inter.trasee && Array.isArray(inter.trasee)) {
                trasee = inter.trasee;
                console.log(`   Intersecția ${i} (dinamic): ${trasee.length} trasee`);
            }
            // Cazul 2: Intersecție încărcată din BD (verifică structura JSON)
            else if (inter.data && inter.data.intersectii && inter.data.intersectii[0] && inter.data.intersectii[0].trasee) {
                trasee = inter.data.intersectii[0].trasee;
                console.log(`   Intersecția ${i} (din BD): ${trasee.length} trasee`);
            }
            // Cazul 3: Verifică dacă intersecția este ea însăși partea din data.intersectii
            else if (inter.trasee && Array.isArray(inter.trasee)) {
                trasee = inter.trasee;
                console.log(`   Intersecția ${i} (structură BD directă): ${trasee.length} trasee`);
            }
            else {
                console.log(`   Intersecția ${i}: Nu s-au găsit trasee`);
                console.log("   Structura intersecției:", Object.keys(inter));
                if (inter.data) {
                    console.log("   Structura inter.data:", Object.keys(inter.data));
                }
            }
            
            // Procesează traseele găsite
            if (trasee && trasee.length > 0) {
                for (let j = 0; j < trasee.length; j++) {
                    const traseu = trasee[j];
                    console.log(`     Traseu ${j}: ${traseu.puncte ? traseu.puncte.length : 0} puncte`);
                      // Verifică că traseul are puncte valide
                    if (traseu.puncte && Array.isArray(traseu.puncte) && traseu.puncte.length > 0) {
                        const routeId = `route_${i}_${j}`;
                        this.routes.push({
                            id: routeId,
                            intersectionIndex: i,
                            routeIndex: j,
                            points: traseu.puncte,
                            name: `Ruta ${i + 1}.${j + 1}`,
                            description: this.generateRouteDescription(traseu.puncte),
                            hasExtendedPoints: traseu.hasExtendedPoints || false
                        });
                        
                        // Inițializează contorul pentru această rută
                        this.routeCarCounters.set(routeId, 0);
                    } else {
                        console.warn(`⚠️ Traseu ${j} nu are puncte valide:`, traseu);
                    }
                }
            }
        }
        console.log("✅ Total rute extrase:", this.routes.length);
        
        // Debug: afișează rutele extrase pentru verificare
        if (this.routes.length === 0) {
            console.warn("🚨 Nu s-au găsit rute! Verificați structura intersecțiilor:");
            this.intersections.forEach((inter, idx) => {
                console.log(`Intersecția ${idx}:`, inter);
            });
        }
    }

    /**
     * Generează o descriere pentru o rută bazată pe punctele sale
     */
    generateRouteDescription(points) {
        if (points.length < 2) return "Rută incompletă";
        
        const start = points[0];
        const end = points[points.length - 1];
        
        // Determină direcția aproximativă
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        
        let direction = "";
        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? "Est" : "Vest";
        } else {
            direction = dy > 0 ? "Sud" : "Nord";
        }
        
        return `Spre ${direction} (${points.length} puncte)`;
    }    /**
     * Activează simularea și afișează interfața de control
     */
    startSimulation() {
        console.log("🎯 startSimulation() apelat");
        
        // Sincronizează cu intersecțiile actuale din window.intersectii
        this.extractRoutes();
        console.log("🔍 Rute extrase în startSimulation:", this.routes.length);
        
        if (this.routes.length === 0) {
            console.error("❌ Nu există rute definite pentru simulare!");
            alert("Nu există rute definite pentru simulare!");
            return false;
        }

        this.isSimulationActive = true;
        console.log("✅ isSimulationActive setat la true");
        
        this.hideIntersectionControls();
        this.showTrafficControlUI();
        
        // Inițializează fluxurile cu valori implicite
        this.routes.forEach(route => {
            this.routeFlows.set(route.id, 10); // 10 mașini/minut implicit
        });

        console.log("✅ startSimulation() finalizat cu succes");
        return true;
    }/**
     * Oprește simularea și restabilește interfața normală
     */
    stopSimulation() {
        this.isSimulationActive = false;
        this.clearAllCarGeneration();
        clearMasini();
        this.hideTrafficControlUI();
        this.showIntersectionControls();
        
        // Notifică create.js că simularea s-a oprit
        if (window.onSimulationStopped) {
            window.onSimulationStopped();
        }
    }

    /**
     * Ascunde controalele pentru modificarea intersecțiilor
     */
    hideIntersectionControls() {
        const controlsToHide = [
            'sectiuneIntersectie',
            'lungimeLatura',
            'unghiLaturaOx', 
            'unghiIntreLaturi',
            'sectiuneStrada',
            'laneControlsIN',
            'laneControlsOUT',
            'punctConectareStradaPeLatura',
            'intersectieCustom',
            'adaugaStradaBtn'
        ];

        controlsToHide.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    /**
     * Afișează din nou controalele pentru modificarea intersecțiilor
     */
    showIntersectionControls() {
        const controlsToShow = [
            'sectiuneIntersectie',
            'lungimeLatura',
            'unghiLaturaOx',
            'unghiIntreLaturi', 
            'sectiuneStrada',
            'laneControlsIN',
            'laneControlsOUT',
            'punctConectareStradaPeLatura',
            'intersectieCustom',
            'adaugaStradaBtn'
        ];

        controlsToShow.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'block';
            }
        });
    }    /**
     * Afișează interfața de control al traficului
     */
    showTrafficControlUI() {
        // Nu mai cream panel separat - folosim container-ul din simuleaza.html
        console.log("🎨 showTrafficControlUI - folosim container-ul din HTML");
        
        const trafficContainer = document.getElementById('traffic-control-container');
        if (trafficContainer) {
            trafficContainer.style.display = 'block';
            this.populateTrafficControlUI();
        } else {
            console.error("Nu s-a găsit container-ul traffic-control-container în HTML");
        }
        
        // Setăm flag-ul că UI-ul este activ
        this.uiPanelActive = true;
    }/**
     * Desenează un preview al traseului pe canvas
     */
    drawRoutePreview(route) {
        const canvas = document.getElementById(`preview-canvas-${route.id}`);
        if (!canvas || !route.points || route.points.length < 2) return;
        
        const ctx = canvas.getContext('2d');
        
        // Setează dimensiunile canvas-ului
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Găsește limitele traseului pentru scalare
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const point of route.points) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        
        // Adaugă un mic padding
        const padding = 20;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        // Calculează factorul de scalare pentru a încadra traseul în canvas
        const scaleX = canvas.width / (maxX - minX);
        const scaleY = canvas.height / (maxY - minY);
        const scale = Math.min(scaleX, scaleY);
        
        // Translatează pentru a centra traseul
        const offsetX = (canvas.width - (maxX - minX) * scale) / 2;
        const offsetY = (canvas.height - (maxY - minY) * scale) / 2;
        
        // Desenează traseul
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Desenează linia traseului
        ctx.beginPath();
        for (let i = 0; i < route.points.length; i++) {
            const x = (route.points[i].x - minX) * scale + offsetX;
            const y = (route.points[i].y - minY) * scale + offsetY;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Desenează punctele de start și final
        if (route.points.length > 0) {
            // Punct de start (verde)
            const startX = (route.points[0].x - minX) * scale + offsetX;
            const startY = (route.points[0].y - minY) * scale + offsetY;
            ctx.beginPath();
            ctx.arc(startX, startY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "#2ecc71";
            ctx.fill();
            ctx.strokeStyle = "#27ae60";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Punct de final (roșu)
            const endX = (route.points[route.points.length - 1].x - minX) * scale + offsetX;
            const endY = (route.points[route.points.length - 1].y - minY) * scale + offsetY;
            ctx.beginPath();
            ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "#e74c3c";
            ctx.fill();
            ctx.strokeStyle = "#c0392b";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Desenează mașină pentru a indica direcția
            if (route.points.length > 1) {
                const idx = Math.floor(route.points.length / 2);
                const p1 = route.points[Math.max(0, idx - 1)];
                const p2 = route.points[idx];
                
                const x1 = (p1.x - minX) * scale + offsetX;
                const y1 = (p1.y - minY) * scale + offsetY;
                const x2 = (p2.x - minX) * scale + offsetX;
                const y2 = (p2.y - minY) * scale + offsetY;
                
                const dx = x2 - x1;
                const dy = y2 - y1;
                const angle = Math.atan2(dy, dx);
                
                // Poziția mașinii la mijlocul segmentului
                const carX = (x1 + x2) / 2;
                const carY = (y1 + y2) / 2;
                
                // Desenează mașina
                ctx.save();
                ctx.translate(carX, carY);
                ctx.rotate(angle);
                
                // Caroserie
                ctx.beginPath();
                ctx.rect(-10, -4, 20, 8);
                ctx.fillStyle = "#3498db";
                ctx.fill();
                ctx.strokeStyle = "#2980b9";
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Parbriz
                ctx.beginPath();
                ctx.rect(-7, -3, 5, 6);
                ctx.fillStyle = "#34495e";
                ctx.fill();
                
                // Faruri
                ctx.beginPath();
                ctx.arc(10, -2, 1, 0, 2 * Math.PI);
                ctx.arc(10, 2, 1, 0, 2 * Math.PI);
                ctx.fillStyle = "#f1c40f";
                ctx.fill();
                
                ctx.restore();
            }
        }
    }    /**
     * Populează interfața de control cu datele rutelor
     */
    populateTrafficControlUI() {
        const routesContainer = document.getElementById('routes-container');
        if (!routesContainer) {
            console.error("Nu s-a găsit container-ul routes-container");
            return;
        }

        let html = '';
        
        if (this.routes.length === 0) {
            html = `<div style="text-align: center; color: #888;">Nu există rute definite</div>`;
        } else {
            this.routes.forEach(route => {
                // Inițializează contorul pentru această rută dacă nu există
                if (!this.routeCarCounters.has(route.id)) {
                    this.routeCarCounters.set(route.id, 0);
                }
                
                html += `
                    <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #666; border-radius: 8px; background: #555;">
                        <div style="font-weight: bold; color: #fff; margin-bottom: 8px;">${route.name}</div>
                        <div style="font-size: 12px; color: #ccc; margin-bottom: 10px;">${route.description}</div>
                        
                        <!-- Contor mașini trecute -->
                        <div style="margin: 10px 0; padding: 8px; background: #444; border-radius: 4px; border: 1px solid #666;">
                            <span style="color: #fff; font-size: 12px;">Mașini trecute: </span>
                            <span id="count-${route.id}" style="color: #28a745; font-weight: bold; font-size: 14px;">0 mașini</span>
                        </div>
                        
                        <!-- Preview Canvas pentru traseu -->
                        <div style="margin: 10px 0;">
                            <canvas id="preview-canvas-${route.id}" 
                                    style="width: 100%; height: 120px; border: 1px solid #666; background-color: #f5f5f5; border-radius: 4px;">
                            </canvas>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="font-size: 14px; min-width: 120px; color: #fff;">Mașini/minut:</label>
                            <input type="range" 
                                   id="flow_${route.id}" 
                                   min="0" 
                                   max="60" 
                                   value="10" 
                                   style="flex: 1;">
                            <span id="flow-value-${route.id}" style="min-width: 30px; text-align: center; font-weight: bold; color: #fff;">10</span>
                        </div>
                        <div style="margin-top: 8px;">
                            <button class="startRouteBtn" data-route-id="${route.id}" 
                                    style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-right: 5px; cursor: pointer;">
                                ▶ Start
                            </button>
                            <button class="stopRouteBtn" data-route-id="${route.id}" 
                                    style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                ⏹ Stop
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        routesContainer.innerHTML = html;
        
        // Actualizează contorul total
        this.updateTotalCarsDisplay();
        
        // Atașează event listeners după ce HTML-ul a fost populat
        this.attachTrafficControlEventListeners();
        
        // Desenează preview-urile pentru toate rutele după ce sunt adăugate în DOM
        setTimeout(() => {
            this.routes.forEach(route => {
                this.drawRoutePreview(route);
            });
        }, 100);
    }

    /**
     * Actualizează afișarea contorului total de mașini
     */
    updateTotalCarsDisplay() {
        const totalCars = Array.from(this.routeCarCounters.values()).reduce((sum, count) => sum + count, 0);
        const totalElement = document.getElementById('totalCarsCount');
        if (totalElement) {
            totalElement.textContent = `${totalCars} mașini`;
            totalElement.style.color = totalCars > 0 ? '#28a745' : '#6c757d';
        }
    }

    /**
     * Atașează event listener-ii pentru interfața de control
     */    attachTrafficControlEventListeners() {
        // Delay pentru a se asigura că DOM-ul este complet încărcat
        setTimeout(() => {
            // Slider-ele pentru flux
            this.routes.forEach(route => {
                const slider = document.getElementById(`flow_${route.id}`);
                const valueSpan = document.getElementById(`flow-value-${route.id}`);
                
                if (slider && valueSpan) {
                    // Actualizează atât valoarea din Map cât și textul afișat
                    slider.addEventListener('input', (e) => {
                        const value = parseInt(e.target.value);
                        this.routeFlows.set(route.id, value);
                        valueSpan.textContent = value;
                        
                        // Dacă ruta rulează deja, restart-ează cu noua valoare
                        if (this.carGenerationIntervals.has(route.id)) {
                            this.startRouteGeneration(route.id);
                        }
                    });
                    
                    // Setează valoarea inițială în Map
                    this.routeFlows.set(route.id, parseInt(slider.value));
                } else {
                    console.warn(`Nu s-au găsit elementele pentru ruta ${route.id}`);
                }
            });

            // Butoanele pentru start/stop individual
            document.querySelectorAll('.startRouteBtn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const routeId = e.target.getAttribute('data-route-id');
                    this.startRouteGeneration(routeId);
                });
            });

            document.querySelectorAll('.stopRouteBtn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const routeId = e.target.getAttribute('data-route-id');
                    this.stopRouteGeneration(routeId);
                });
            });            // Butoanele pentru control global
            const startAllBtn = document.getElementById('startAllRoutes');
            const stopAllBtn = document.getElementById('stopAllRoutes');
            const closeBtn = document.getElementById('closeTrafficControl');
            const resetBtn = document.getElementById('resetCounters');
            const exportBtn = document.getElementById('exportStats');
            
            if (startAllBtn) {
                startAllBtn.addEventListener('click', () => {
                    this.startAllRoutes();
                });
            }
            
            if (stopAllBtn) {
                stopAllBtn.addEventListener('click', () => {
                    this.stopAllRoutes();
                });
            }
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    this.resetRouteCounters();
                    this.updateCounterDisplay();
                });
            }
            
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportTrafficStats();
                });
            }
              if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.stopSimulation();
                    // Restabilește sidebar-ul la starea originală
                    if (window.restoreOriginalSidebar) {
                        window.restoreOriginalSidebar();
                    }
                    // Redirecționează înapoi la pagina de creare/editare
                    window.location.href = '/Skibidi_traffic/create/';
                });
            }

            // Redimensionează canvas-urile când se schimbă dimensiunea ferestrei
            window.addEventListener('resize', () => {
                if (this.isSimulationActive) {
                    setTimeout(() => {
                        this.routes.forEach(route => {
                            this.drawRoutePreview(route);
                        });
                    }, 100);
                }
            });
        }, 150); // Delay mai mare pentru siguranță
    }

    /**
     * Pornește generarea de mașini pentru o rută specifică
     */
    startRouteGeneration(routeId) {
        // Oprește generarea existentă pentru această rută
        this.stopRouteGeneration(routeId);

        const route = this.routes.find(r => r.id === routeId);
        const flow = this.routeFlows.get(routeId) || 10;
        
        if (!route || flow === 0) return;

        // Calculează intervalul în milisecunde (60000ms = 1 minut)
        const interval = 60000 / flow;        const intervalId = setInterval(() => {
            console.log("⏰ Timer pentru generare mașini - isSimulationActive:", this.isSimulationActive);
            if (this.isSimulationActive) {
                const vitezaAleatoare = 1 + Math.random() * 3;
                console.log("🚗 Încerc să adaug mașină pe ruta:", routeId, "cu viteza:", vitezaAleatoare);
                adaugaMasina(route.points, vitezaAleatoare, routeId);
            } else {
                console.warn("⚠️ Simularea nu este activă - nu adaug mașină");
            }
        }, interval);

        this.carGenerationIntervals.set(routeId, intervalId);
        console.log(`Started traffic generation for ${route.name}: ${flow} cars/minute`);
    }

    /**
     * Oprește generarea de mașini pentru o rută specifică
     */
    stopRouteGeneration(routeId) {
        const intervalId = this.carGenerationIntervals.get(routeId);
        if (intervalId) {
            clearInterval(intervalId);
            this.carGenerationIntervals.delete(routeId);
            
            const route = this.routes.find(r => r.id === routeId);
            console.log(`Stopped traffic generation for ${route ? route.name : routeId}`);
        }
    }

    /**
     * Pornește toate rutele
     */
    startAllRoutes() {
        this.routes.forEach(route => {
            this.startRouteGeneration(route.id);
        });
    }

    /**
     * Oprește toate rutele
     */
    stopAllRoutes() {
        this.carGenerationIntervals.forEach((intervalId, routeId) => {
            this.stopRouteGeneration(routeId);
        });
    }

    /**
     * Curăță toate intervalele de generare
     */
    clearAllCarGeneration() {
        this.carGenerationIntervals.forEach((intervalId) => {
            clearInterval(intervalId);
        });
        this.carGenerationIntervals.clear();
    }    /**
     * Ascunde interfața de control al traficului
     */
    hideTrafficControlUI() {
        const trafficContainer = document.getElementById('traffic-control-container');
        if (trafficContainer) {
            trafficContainer.style.display = 'none';
        }
        this.uiPanelActive = false;
    }

    /**
     * Verifică dacă simularea este activă
     */
    isActive() {
        return this.isSimulationActive;
    }    /**
     * Obține informații despre rutele curente
     */
    getRoutesInfo() {
        return this.routes.map(route => ({
            id: route.id,
            name: route.name,
            description: route.description,
            flow: this.routeFlows.get(route.id) || 0,
            isGenerating: this.carGenerationIntervals.has(route.id)
        }));
    }    /**
     * Incrementează contorul pentru o rută specifică
     */
    incrementRouteCounter(routeId) {
        if (this.routeCarCounters.has(routeId)) {
            const currentCount = this.routeCarCounters.get(routeId);
            this.routeCarCounters.set(routeId, currentCount + 1);
            console.log(`🚗 Route ${routeId}: ${currentCount + 1} cars completed`);
            
            // Update the UI counter display immediately
            this.updateCounterDisplay();
            
            // Log periodic statistics every 10 cars
            if ((currentCount + 1) % 10 === 0) {
                this.printTrafficStats();
            }
        }
    }/**
     * Resetează toate contoarele de rute
     */
    resetRouteCounters() {
        for (const routeId of this.routeCarCounters.keys()) {
            this.routeCarCounters.set(routeId, 0);
        }
        console.log("🔄 Route counters reset - all counters set to 0");
        this.printTrafficStats();
    }

    /**
     * Obține array cu numărul de mașini pentru fiecare rută
     * Returnează format [2,1,3] unde indexul corespunde cu ordinea rutelor
     */
    getRouteCountersArray() {
        return this.routes.map(route => this.routeCarCounters.get(route.id) || 0);
    }

    /**
     * Obține informații detaliate despre contoarele rutelor
     */
    getRouteCountersInfo() {
        return this.routes.map(route => ({
            routeId: route.id,
            name: route.name,
            count: this.routeCarCounters.get(route.id) || 0
        }));
    }

    /**
     * Afișează statistici despre trafic pe console
     */
    printTrafficStats() {
        console.log("=== TRAFFIC STATISTICS ===");
        const countersArray = this.getRouteCountersArray();
        console.log("Route counters array:", countersArray);
        
        this.routes.forEach((route, index) => {
            const count = this.routeCarCounters.get(route.id) || 0;
            console.log(`${route.name}: ${count} cars`);
        });
        
        const totalCars = countersArray.reduce((sum, count) => sum + count, 0);
        console.log(`Total cars: ${totalCars}`);
    }      /**
     * Actualizează afișarea contorilor în UI
     */
    updateCounterDisplay() {
        // Actualizează contoarele individuale pentru fiecare rută
        this.routes.forEach(route => {
            const count = this.routeCarCounters.get(route.id) || 0;
            
            const countElement = document.getElementById(`count-${route.id}`);
            if (countElement) {
                countElement.textContent = `${count} mașini`;
                
                // Add visual feedback for recent updates
                countElement.style.color = count > 0 ? '#28a745' : '#6c757d';
                if (count > 0) {
                    countElement.style.fontWeight = 'bold';
                }
            }
        });
        
        // Actualizează contorul total
        this.updateTotalCarsDisplay();
    }

    /**
     * Exportă statisticile traficului
     */
    exportTrafficStats() {
        const stats = {
            timestamp: new Date().toISOString(),
            routes: this.getRouteCountersInfo(),
            countersArray: this.getRouteCountersArray(),
            totalCars: this.getRouteCountersArray().reduce((sum, count) => sum + count, 0)
        };
        
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `traffic_stats_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("📊 Traffic statistics exported:", stats);
    }

    /**
     * Inițializează afișarea contorilor după crearea UI-ului
     */
    initializeCounterDisplay() {
        // Initialize the counter display with current values
        this.updateCounterDisplay();
    }
}

// Instanță globală a simulatorului
export const trafficSimulator = new TrafficSimulator();

// Funcții de conveniență pentru integrarea cu create.js
export function startTrafficSimulation(intersections, drawSceneCallback) {
    trafficSimulator.initialize(intersections, drawSceneCallback);
    return trafficSimulator.startSimulation();
}

export function stopTrafficSimulation() {
    trafficSimulator.stopSimulation();
}

export function isTrafficSimulationActive() {
    return trafficSimulator.isActive();
}

// Global functions for accessing route counter data
export function getRouteCountersArray() {
    return trafficSimulator.getRouteCountersArray();
}

export function getRouteCountersInfo() {
    return trafficSimulator.getRouteCountersInfo();
}

export function resetRouteCounters() {
    trafficSimulator.resetRouteCounters();
}

export function printTrafficStats() {
    trafficSimulator.printTrafficStats();
}

// Make functions available globally for debugging
window.getRouteCountersArray = getRouteCountersArray;
window.getRouteCountersInfo = getRouteCountersInfo;
window.resetRouteCounters = resetRouteCounters;
window.printTrafficStats = printTrafficStats;
