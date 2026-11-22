// Test: NiCr 80/20, 0.5mm dia, 230V, 800C, parallel/6
const resistivity = 1.09e-6;
const diamMM = 0.5;
const voltage = 230;
const N = 6;

const radiusM = (diamMM/1000)/2;
const area = Math.PI * radiusM * radiusM;
const rPerMeter = resistivity / area;

// W/m at 800C from curve = 260
const wPerMeter = 260;

// Parallel topology
const lenPerElement = voltage / Math.sqrt(rPerMeter * wPerMeter);
const totalLength = lenPerElement * N;
const elemR = rPerMeter * lenPerElement;
const totalR = elemR / N;
const branchI = voltage / elemR;
const supplyI = branchI * N;
const totalPower = voltage * supplyI;
const panelAreaM2 = 0.45 * 0.45;
const density = totalPower / panelAreaM2;

console.log('rPerMeter:', rPerMeter.toFixed(2), 'Ohm/m');
console.log('lenPerElement:', lenPerElement.toFixed(3), 'm');
console.log('totalLength:', totalLength.toFixed(2), 'm');
console.log('elemR:', elemR.toFixed(3), 'Ohm');
console.log('totalR:', totalR.toFixed(4), 'Ohm');
console.log('branchI:', branchI.toFixed(2), 'A');
console.log('supplyI:', supplyI.toFixed(1), 'A');
console.log('totalPower:', totalPower.toFixed(0), 'W');
console.log('density:', (density/1000).toFixed(2), 'kW/m2');
console.log('margin: 1200-800 =', 400, 'C');
