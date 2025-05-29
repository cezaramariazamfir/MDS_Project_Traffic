import { initAnimatieMasini, adaugaMasina, getMasini, setDrawSceneCallback, genereareMasiniPeTraseeleSalvate, clearMasini } from './masina.js';

/**
 * TrafficSimulator - Clasa pentru controlul avânsat al traficului
 * Permite setarea fluxului de trafic pentru fiecare rută în parte
 */
export class TrafficSimulator {
    constructor() {
        this.isSimulationActive = false;
        this.routeFlows = new Map(); // Map cu fluxul pentru fiecare rută
        this.carGenerationIntervals = new Map(); // Intervalele pentru generarea mașinilor
        this.routes = []; // Lista tuturor rutelor disponibile
        this.uiPanel = null; // Panoul UI pentru controlul traficului
        this.intersections = [];
        this.drawSceneCallback = null;
    }

    /**
     * Inițializează simulatorul cu intersecțiile și callback-ul de desenare
     */
    initialize(intersections, drawSceneCallback) {
        this.intersections = intersections;
        this.drawSceneCallback = drawSceneCallback;
        this.extractRoutes();
        setDrawSceneCallback(drawSceneCallback);
        initAnimatieMasini();
    }

    /**
     * Extrage toate rutele din intersecții
     */
    extractRoutes() {
        this.routes = [];
        for (let i = 0; i < this.intersections.length; i++) {
            const inter = this.intersections[i];
            if (inter.trasee && inter.trasee.length > 0) {
                for (let j = 0; j < inter.trasee.length; j++) {
                    const traseu = inter.trasee[j];
                    this.routes.push({
                        id: `route_${i}_${j}`,
                        intersectionIndex: i,
                        routeIndex: j,
                        points: traseu.puncte,
                        name: `Ruta ${i + 1}.${j + 1}`,
                        description: this.generateRouteDescription(traseu.puncte)
                    });
                }
            }
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
    }

    /**
     * Activează simularea și afișează interfața de control
     */
    startSimulation() {
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
    }    /**
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
    }

    /**
     * Afișează interfața de control al traficului
     */
    showTrafficControlUI() {
        if (this.uiPanel) {
            this.uiPanel.style.display = 'block';
            return;
        }

        // Creează panoul UI
        this.uiPanel = document.createElement('div');
        this.uiPanel.id = 'trafficControlPanel';
        this.uiPanel.innerHTML = this.generateTrafficControlHTML();
        
        // Stilizează panoul
        this.uiPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: white;
            border: 2px solid #333;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            overflow-y: auto;
            font-family: Arial, sans-serif;
        `;

        document.body.appendChild(this.uiPanel);
        this.attachTrafficControlEventListeners();
    }

    /**
     * Generează HTML-ul pentru interfața de control
     */
    generateTrafficControlHTML() {
        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #2c5aa0; margin: 0 0 10px 0;">🚦 Control Flux Trafic</h3>
                <p style="color: #666; font-size: 14px; margin: 0;">Setează numărul de mașini pe minut pentru fiecare rută</p>
            </div>
        `;

        if (this.routes.length === 0) {
            html += `<div style="text-align: center; color: #888;">Nu există rute definite</div>`;
        } else {
            this.routes.forEach(route => {
                html += `
                    <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
                        <div style="font-weight: bold; color: #333; margin-bottom: 8px;">${route.name}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 10px;">${route.description}</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="font-size: 14px; min-width: 120px;">Mașini/minut:</label>
                            <input type="range" 
                                   id="flow_${route.id}" 
                                   min="0" 
                                   max="60" 
                                   value="10" 
                                   style="flex: 1;"
                                   oninput="this.nextElementSibling.textContent = this.value">
                            <span style="min-width: 30px; text-align: center; font-weight: bold;">10</span>
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

        html += `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee;">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button id="startAllRoutes" 
                            style="flex: 1; background: #007bff; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        🚀 Pornește Tot Traficul
                    </button>
                    <button id="stopAllRoutes" 
                            style="flex: 1; background: #6c757d; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        🛑 Oprește Tot Traficul
                    </button>
                </div>
                <button id="closeTrafficControl" 
                        style="width: 100%; background: #333; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">
                    ✖ Închide Simularea
                </button>
            </div>
        `;

        return html;
    }

    /**
     * Atașează event listener-ii pentru interfața de control
     */
    attachTrafficControlEventListeners() {
        // Slider-ele pentru flux
        this.routes.forEach(route => {
            const slider = document.getElementById(`flow_${route.id}`);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.routeFlows.set(route.id, parseInt(e.target.value));
                });
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
        });

        // Butoanele pentru control global
        document.getElementById('startAllRoutes').addEventListener('click', () => {
            this.startAllRoutes();
        });

        document.getElementById('stopAllRoutes').addEventListener('click', () => {
            this.stopAllRoutes();
        });

        document.getElementById('closeTrafficControl').addEventListener('click', () => {
            this.stopSimulation();
        });
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
                const vitezaAleatoare = 1 + Math.random() * 3;
                adaugaMasina(route.points, vitezaAleatoare);
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
    }

    /**
     * Ascunde interfața de control al traficului
     */
    hideTrafficControlUI() {
        if (this.uiPanel) {
            this.uiPanel.style.display = 'none';
        }
    }

    /**
     * Verifică dacă simularea este activă
     */
    isActive() {
        return this.isSimulationActive;
    }

    /**
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