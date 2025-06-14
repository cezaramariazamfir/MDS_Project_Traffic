export function segmenteSeIntersecteaza(A, B, C, D) {
  function orientare(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;  // coliniare
    return val > 0 ? 1 : 2;   // oriențări diferite
  }

  function peSegment(p, q, r) {
    return Math.min(p.x, r.x) <= q.x && q.x <= Math.max(p.x, r.x) &&
           Math.min(p.y, r.y) <= q.y && q.y <= Math.max(p.y, r.y);
  }

  const o1 = orientare(A, B, C);
  const o2 = orientare(A, B, D);
  const o3 = orientare(C, D, A);
  const o4 = orientare(C, D, B);

  if (o1 !== o2 && o3 !== o4) return true;

  // Coliniare
  if (o1 === 0 && peSegment(A, C, B)) return true;
  if (o2 === 0 && peSegment(A, D, B)) return true;
  if (o3 === 0 && peSegment(C, A, D)) return true;
  if (o4 === 0 && peSegment(C, B, D)) return true;

  return false;
}

export function calculeazaMatriceCompatibilitate(intersectie) {
  const trasee = intersectie.trasee || [];
  const n = trasee.length;
  const matrice = Array.from({ length: n }, () => Array(n).fill(true));

  for (let i = 0; i < n; i++) {
    const t1 = trasee[i].puncte;

    for (let j = i + 1; j < n; j++) {
      const t2 = trasee[j].puncte;

      // ✅ Shortcut: Dacă pleacă de pe aceeași bandă, sunt compatibile
      if (
        trasee[i].stradaIndex === trasee[j].stradaIndex &&
        trasee[i].bandaIndex === trasee[j].bandaIndex
      ) {
        matrice[i][j] = matrice[j][i] = true;
        continue;
      }

      let compatibile = true;

      for (let k = 0; k < t1.length - 1 && compatibile; k++) {
        const A = t1[k];
        const B = t1[k + 1];

        for (let l = 0; l < t2.length - 1 && compatibile; l++) {
          const C = t2[l];
          const D = t2[l + 1];

          const esteMargineT1 = k === 0 || k + 1 === t1.length - 1;
          const esteMargineT2 = l === 0 || l + 1 === t2.length - 1;

          if (segmenteSeIntersecteaza(A, B, C, D)) {
            if (esteMargineT1 && esteMargineT2) continue;
            compatibile = false;
          }
        }
      }

      matrice[i][j] = matrice[j][i] = compatibile;
    }
  }

  return matrice;
}


export function determinaFazeSemafor(matrice) { //construieste precursorii gruparilor de semafoare
  const n = matrice.length;
  const asignat = Array(n).fill(false);
  const faze = [];

  for (let i = 0; i < n; i++) {
    if (asignat[i]) continue;

    const fazaCurenta = [i];
    asignat[i] = true;

    for (let j = i+1; j < n; j++) {
      if (i === j || asignat[j]) continue;

      // Verificăm dacă traseul j este compatibil cu toate din fazaCurenta
      const compatibilCuTot = fazaCurenta.every(k => matrice[j][k]);
      if (compatibilCuTot) {
        fazaCurenta.push(j);
        asignat[j] = true;
      }
    }

    faze.push(fazaCurenta); // vector de indici de trasee compatibile între ele
  }
    console.log("FAZE GASITE:", faze);


  return faze; // ex: [[0, 3, 6], [1, 2], [4, 5]]
}

