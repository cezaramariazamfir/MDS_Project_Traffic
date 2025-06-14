import { initAnimatieMasini, adaugaMasina, getMasini ,setDrawSceneCallback, genereareMasiniPeTraseeleSalvate, clearMasini, resetContorMasini, setTrafficSimulatorRef, canSpawnCarOnRoute } from './masina.js';

/**
 * TrafficSimulator - Clasa pentru controlul avânsat al traficului
 * Permite setarea fluxului de trafic pentru fiecare rută în parte
 */
export class TrafficSimulator {    
    constructor() {
    if (TrafficSimulator.instance) {
        return TrafficSimulator.instance;
    }
    this.isSimulationActive = false;
    this.routeFlows = new Map();
    this.carGenerationIntervals = new Map();
    this.routes = [];
    this.uiPanel = null;
    this.intersections = [];
    this.drawSceneCallback = null;
    this.routeCarCounters = new Map();
    
    resetContorMasini();

    TrafficSimulator.instance = this; // salvează instanța
    }

    static getInstance() {
    if (!TrafficSimulator.instance) {
        TrafficSimulator.instance = new TrafficSimulator();
    }
    return TrafficSimulator.instance;
    }

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
        
        // Debug: afișează rutele extrase pentru verificare
        if (this.routes.length === 0) {
            console.warn("🚨 Nu s-au găsit rute! Verificați structura intersecțiilor:");
            this.intersections.forEach((inter, idx) => {
                console.log(`Intersecția ${idx}:`, inter);
            });
        }
    }
    
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
        
        // Sincronizează cu intersecțiile actuale din window.intersectii
        this.extractRoutes();
        console.log("🔍 Rute extrase în startSimulation:", this.routes.length);
        
        if (this.routes.length === 0) {
            alert("Nu există rute definite pentru simulare!");
            return false;
        }

        this.isSimulationActive = true;
        
        this.hideIntersectionControls();
        this.showTrafficControlUI();
        
        // Inițializează fluxurile cu valori implicite
        this.routes.forEach(route => {
            this.routeFlows.set(route.id, 10); // 10 mașini/minut implicit
        });

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
                                   max="40" 
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
                    
                    // Redirecționează înapoi la pagina de creare/editare cu ID-ul intersecției
                    const intersectieId = this.getIntersectionId();
                    
                    if (intersectieId) {
                        window.location.href = `/Skibidi_traffic/create?id=${intersectieId}`;
                    } else {
                        // Fallback la pagina de creare fără ID
                        window.location.href = '/Skibidi_traffic/create/';
                    }
                });
            }

            const butonVremeRea = document.getElementById('toggleBadWeather');

            if (butonVremeRea) {
                butonVremeRea.addEventListener('click', () => {
                window.vremeReaActivata = !window.vremeReaActivata;

                butonVremeRea.textContent = window.vremeReaActivata
                        ? '🌧️ Vreme Rea: Activata'
                        : '🌤️ Vreme Rea: Dezactivata';

                butonVremeRea.style.background = window.vremeReaActivata ? '#6610f2' : '#6c757d';
                butonVremeRea.style.color = '#fff';            });
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
    const interval = 60000 / flow;
    const intervalId = setInterval(() => {
        if (this.isSimulationActive) {
            // Verifică dacă semaforul pentru această rută este verde înainte de a genera mașină
            if (this.checkTrafficLightForRoute(route)) {
                // Dacă e verde, verifică doar ruta curentă
                if (canSpawnCarOnRoute(route.id, route.points)) { 
                    let vitezaAleatoare = 1 + Math.random()*1.2;
                    if(window.vremeReaActivata) vitezaAleatoare *= 0.5;
                    adaugaMasina(route.points, vitezaAleatoare, routeId);
                }
            } else {
                // Dacă e roșu, verificăm toate rutele care au același punct de start
                const routesWithSameStart = this.routes.filter(r => 
                    r.points.length > 0 && 
                    route.points.length > 0 &&
                    r.points[0].x === route.points[0].x && 
                    r.points[0].y === route.points[0].y
                );

                let canSpawn = true;
                for (const sameStartRoute of routesWithSameStart) {
                    if (!canSpawnCarOnRoute(sameStartRoute.id, sameStartRoute.points)) {
                        canSpawn = false;
                        break;
                    }
                }

                if (canSpawn) {
                    let vitezaAleatoare = 1 + Math.random()*1.2;
                    if(window.vremeReaActivata) vitezaAleatoare *= 0.5;
                    adaugaMasina(route.points, vitezaAleatoare, routeId);
                }
            }
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
        
    }

    /**
     * Inițializează afișarea contorilor după crearea UI-ului
     */
    initializeCounterDisplay() {
        // Initialize the counter display with current values
        this.updateCounterDisplay();
    }

    /**
     * Verifică dacă semaforul pentru o anumită rută permite generarea mașinilor
     * @param {Object} route - Ruta pentru care se verifică semaforul
     * @returns {boolean} - true dacă se pot genera mașini, false altfel
     */
    checkTrafficLightForRoute(route) {
        // Verifică dacă există grupele de semafoare globale
        if (!window.grupeSemafor || !Array.isArray(window.grupeSemafor)) {
            return true; // Permite generarea dacă nu există semafoare
        }
        console.log(`Numărul de grupe de semafoare: ${window.grupeSemafor.length}`);

        // Găsește semaforul care controlează această rută
        for (let grupa of window.grupeSemafor) {
            if (!grupa.semafoare || !Array.isArray(grupa.semafoare)) {
                continue;
            }
            
            for (let semafor of grupa.semafoare) {
                // Verifică dacă semaforul corespunde cu ruta
                if (this.isTrafficLightForRoute(semafor, route)) {
                    // Returnează true doar dacă semaforul este verde
                    return semafor.status === "green";
                }
            }
        }
        
        return true;
    }

    /**
     * Verifică dacă un semafor controlează o anumită rută
     * @param {Object} semafor - Semaforul de verificat
     * @param {Object} route - Ruta de verificat
     * @returns {boolean} - true dacă semaforul controlează ruta
     */
    isTrafficLightForRoute(semafor, route) {
        if (!semafor.banda || !route.points || route.points.length === 0) {
            return false;
        }

        // Verifică dacă primul punct al rutei este aproape de poziția semaforului
        const punctStart = route.points[1];
        const distanta = Math.sqrt(
            Math.pow(semafor.banda.x - punctStart.x, 2) + 
            Math.pow(semafor.banda.y - punctStart.y, 2)
        );
        
        return distanta <= 1;
    }

    /**
     * Extrage ID-ul intersecției din URL sau din datele disponibile
     * @returns {string|null} - ID-ul intersecției sau null dacă nu se găsește
     */
    getIntersectionId() {
        // 1. Încearcă să extragă ID-ul din URL (format: /simuleaza/<id>/)
        const urlPath = window.location.pathname;
        const match = urlPath.match(/\/simuleaza\/(\d+)\//);
        if (match) {
            return match[1];
        }

        // 2. Încearcă să extragă ID-ul din window.data dacă este disponibil
        if (window.data) {
            // Dacă window.data este o intersecție cu ID
            if (window.data.id) {
                return window.data.id;
            }
            // Dacă window.data are o listă de intersecții
            if (window.data.intersectii && window.data.intersectii.length > 0 && window.data.intersectii[0].id) {
                return window.data.intersectii[0].id;
            }
        }

        // 3. Fallback: încearcă să extragă din parametrii URL
        const urlParams = new URLSearchParams(window.location.search);
        const idParam = urlParams.get('id');
        if (idParam) {
            return idParam;
        }

        return null;
    }

    getFlowsGroupedByTrafficLight() {
        if (!window.grupeSemafor || !Array.isArray(window.grupeSemafor)) {
            console.warn("--------> nu exista nimic in variabila -grupe de semafoare-");
            return [];
        }

        const matrix = window.grupeSemafor.map(grupa => {
            const flowsForGroup = [];

            // pentru fiecare ruta verific daca un semafor din grupa o controleaza (fac asta pt toate semafoarele )
            this.routes.forEach(route => {
                const isControlled = grupa.semafoare
                    .some(semafor => this.isTrafficLightForRoute(semafor, route));

                if (isControlled) {
                    flowsForGroup.push(this.routeFlows.get(route.id) ?? 0);
                }
            });

            return flowsForGroup;
        });

        return matrix;
    }
}

// Instanță globală a simulatorului
// export const trafficSimulator = new TrafficSimulator();
export const trafficSimulator = TrafficSimulator.getInstance();


window.vremeReaActivata = false;

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

// export function getFlowPerTrafficGroup(grupeSemafor, trafficSimulator) {
//     const result = [];

//     grupeSemafor.forEach((grupa, index) => {
//         let maxFlow = 0;

//         grupa.semafoare.forEach(semafor => {
//             // Caută toate rutele care pornesc de la acest semafor
//             trafficSimulator.routes.forEach(route => {
//                 const firstPoint = route.points[0];
//                 const dx = semafor.banda.x - firstPoint.x;
//                 const dy = semafor.banda.y - firstPoint.y;
//                 const dist = Math.sqrt(dx * dx + dy * dy);

//                 if (dist <= 50) {
//                     // Sliderul are id-ul flow_route_X_Y
//                     const slider = document.getElementById(`flow_${route.id}`);
//                     if (slider) {
//                         const val = parseInt(slider.value);
//                         if (!isNaN(val)) {
//                             maxFlow = Math.max(maxFlow, val);
//                         }
//                     }
//                 }
//             });
//         });

//         result.push({
//             grupa: grupa,
//             maxFlow: maxFlow
//         });
//     });

//     return result;
// }

