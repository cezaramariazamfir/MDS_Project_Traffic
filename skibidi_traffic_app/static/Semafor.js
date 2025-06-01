import Punct from "./Punct.js";
import Strada from "./Strada.js";

export default class SemaforBanda {
  constructor(intersectie, stradaIndex, bandaIndex) {
    this.intersectie = intersectie;
    this.stradaIndex = stradaIndex;
    this.bandaIndex = bandaIndex;

    this.strada = intersectie.listaStrazi[stradaIndex];

    // Coordonatele centrului benzii
    this.banda = this.calculeazaCoordonateSemaforPeBanda();

    // Selectează toate traseele care pornesc de pe această bandă
    this.trasee_de_pe_banda = (intersectie.trasee || []).filter(
      t => t.stradaIndex === stradaIndex && t.bandaIndex === bandaIndex
    );

    this.status = "red"; // sau "green", "yellow"
  }

  calculeazaCoordonateSemaforPeBanda() {
    const dir = this.strada.getVectorDirectie();
    const perp = { x: -dir.y, y: dir.x };
    const start = this.strada.getPunctConectare();

    const offset = -this.strada.latimeBanda * (this.bandaIndex + 0.5) - this.strada.spatiuVerde / 2;
    const x = start.x + perp.x * offset;
    const y = start.y + perp.y * offset;

    return new Punct(x, y);
  }

  deseneaza(ctx) {
    const culori = {
      red: "red",
      green: "green",
      yellow: "yellow"
    };

    ctx.beginPath();
    ctx.arc(this.banda.x, this.banda.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = culori[this.status] || "gray";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}



