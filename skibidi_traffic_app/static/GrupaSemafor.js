export default class GrupaSemafor {
  constructor(status = "red", time = 10, semafoare = []) {
    this.status = status;            // Culoarea curentă: "red", "green", "yellow"
    this.time = time;                // Durata culorii curente (în secunde)
    this.semafoare = semafoare;      // Vector de SemaforBanda
  }

  // Metodă pentru a schimba culoarea tuturor semafoarelor din grupă
  changeColor(nouStatus) {
    this.status = nouStatus;
    for (let semafor of this.semafoare) {
        semafor.status = nouStatus;
    }
    if (nouStatus === 'green' && typeof window.notificareSemaforSchimbat === 'function') {
        window.notificareSemaforSchimbat(this.semafoare);
    }
}

  // Opțional: Adaugă un semafor în grupă
  adaugaSemafor(semaforBanda) {
    this.semafoare.push(semaforBanda);
    semaforBanda.status = this.status; // setează culoarea semaforului nou după statusul grupei
  }
}