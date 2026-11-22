# Vacuum Former Heater Designer
## Project Specification & Development Notes

### Purpose

A browser-based heater design tool intended for vacuum formers, thermoforming machines, hot-wire ovens, and radiant heater arrays.

The calculator allows users to design a heater from panel dimensions, wire parameters, and a target wire temperature — without manually performing electrical calculations.

---

# Design Philosophy

The primary design parameter is:

**Target Wire Temperature**

rather than:

- Resistance
- Wattage
- Current

The tool answers:

> "What wire length and configuration do I need to achieve approximately 800°C?"

The calculator derives:

- Required total wire length
- Per-element wire length
- Resistance
- Current
- Power
- Panel power density
- Circuit requirements

Wire layout (how the wire is routed or coiled over the panel) is left to the builder and is **out of scope**.

---

# Delivery

- Single self-contained HTML file
- Vanilla JavaScript, no frameworks
- Results are computed on button click ("Calculate")

---

# Inputs

## Electrical

### Supply Voltage

Presets:

- 24 VAC
- 48 VAC
- 120 VAC
- 230 VAC
- Custom (numeric input, VAC)

---

## Heating Material

Dropdown

### NiCr 80/20 (default)

Properties:

- Resistivity: 1.09e-6 Ω·m
- Max Temp: 1200°C

### NiCr 60/15

Properties:

- Resistivity: 1.11e-6 Ω·m
- Max Temp: 1150°C

> **Note:** Kanthal alloys are not supported in this version.

---

## Wire Diameter

Dropdown (fixed list, no custom entry)

| Diameter |
|-----------|
| 0.20 mm |
| 0.25 mm |
| 0.32 mm |
| 0.40 mm |
| 0.50 mm |
| 0.64 mm |
| 0.80 mm |
| 1.00 mm |

---

## Target Temperature

Slider

Range:

500°C → 1100°C

Default:

800°C

Display current value beside slider.

---

## Panel Dimensions

Used to calculate surface power density (W/m²). Wire layout is not calculated.

### Panel Width (mm)

Example: 450 mm

### Panel Depth (mm)

Example: 450 mm

---

# Element Configuration

## Topology

Dropdown

### Single Continuous Element

All wire forms one element.

---

### Multiple Elements - Series

```text
Element 1
   +
Element 2
   +
Element 3
```

Formula:

```text
Rtotal = R1 + R2 + R3 + ...
```

---

### Multiple Elements - Parallel

```text
|----Element 1----|
|----Element 2----|
|----Element 3----|
```

Formula:

```text
1/Rtotal = 1/R1 + 1/R2 + 1/R3 ...
```

For N equal elements:

```text
Rtotal = Relement / N
```

---

## Number of Elements

Visible only when topology is Series or Parallel.

Default: 6  
Minimum: 2

---

# Temperature Model

## Temperature → Required Power Density Table

Used to determine required W/m for the target wire temperature.
Based on NiCr 80/20 characteristics; used generically for all supported materials.

```javascript
const tempCurve = [
  [500,  75],
  [600, 120],
  [700, 180],
  [800, 260],
  [900, 350],
  [1000, 450],
  [1100, 580]
];
```

Units: **Watts per meter of wire**

The calculator interpolates linearly between adjacent points.

Example:

```text
800°C → 260 W/m
```

---

# Core Calculations

## Wire Cross-Sectional Area

```javascript
area = Math.PI * Math.pow(diameterMM / 1000 / 2, 2);  // m²
```

---

## Resistance Per Meter

```javascript
rPerMeter = resistivity / area;  // Ω/m
```

---

## Required W/m (from target temperature)

```javascript
wPerMeter = interpolate(tempCurve, targetTemp);
```

---

## Required Wire Length (Topology-Dependent)

### Single Element or Series

Total wire length is independent of N for series (all wire carries the same current):

```javascript
totalLength = voltage / Math.sqrt(rPerMeter * wPerMeter);  // metres
lengthPerElement = totalLength / N;  // N=1 for single element
```

### Parallel

Each element sees the full supply voltage, so required element length is determined independently, then multiplied by N:

```javascript
lengthPerElement = voltage / Math.sqrt(rPerMeter * wPerMeter);  // metres
totalLength = lengthPerElement * N;
```

---

## Element Resistance

```javascript
elementResistance = rPerMeter * lengthPerElement;  // Ω
```

---

# Topology Calculations

## Single Element

```javascript
totalResistance = elementResistance;
supplyCurrent = voltage / totalResistance;
totalPower = voltage * supplyCurrent;
```

---

## Series

```javascript
totalResistance = elementResistance * N;
supplyCurrent = voltage / totalResistance;
totalPower = voltage * supplyCurrent;
```

---

## Parallel

```javascript
totalResistance = elementResistance / N;
branchCurrent = voltage / elementResistance;
supplyCurrent = branchCurrent * N;
totalPower = voltage * supplyCurrent;
```

---

## Panel Power Density

```javascript
panelAreaM2 = (panelWidthMM / 1000) * (panelDepthMM / 1000);
powerDensity = totalPower / panelAreaM2;  // W/m²
```

---

# Results

## Wire

### Total Wire Length

Example: `8.1 m`

### Wire Length Per Element

Shown for all topologies.

Example: `1.35 m`

---

## Electrical

### Element Resistance

Example: `7.2 Ω`

### Total Resistance

Example: `1.2 Ω`

### Branch Current *(Parallel only)*

Example: `15.4 A`

### Total Supply Current

Example: `92 A`

### Total Power

Example: `2100 W`

### Panel Power Density

Example: `10.4 kW/m²`

---

## Temperature

### Target Wire Temperature

Echo of user input.

Example: `800°C`

### Temperature Margin

```javascript
margin = materialMaxTemp - targetTemp;
```

Example: `400°C margin` (for NiCr 80/20 at 800°C)

---

# Safety Analysis

Only shown for mains voltages (120 VAC and 230 VAC). Not shown for 24 V or 48 V supplies.

## 120V Regions

| Current | Status | Message |
|---------|--------|---------|
| < 12 A | 🟢 Green | ✅ Good for 15A circuit |
| 12–16 A | 🟡 Yellow | ⚠ Near 15A breaker limit |
| 16–20 A | 🟠 Orange | ⚠ Dedicated 20A circuit recommended |
| > 20 A | 🔴 Red | ❌ Exceeds typical household circuit |

---

## 230V Regions

| Current | Status | Message |
|---------|--------|---------|
| < 10 A | 🟢 Green | ✅ Typical outlet load |
| 10–16 A | 🟡 Yellow | ✅ Suitable for 16A circuit |
| 16–20 A | 🟠 Orange | ⚠ Heavy household load |
| > 20 A | 🔴 Red | ❌ Industrial circuit recommended |

---

# Feed Wire Recommendation

Based on total supply current. Shows both IEC (mm²) and AWG equivalents.

| Current | mm² | AWG |
|---------|-----|-----|
| < 15 A | 2.5 mm² | AWG 14 |
| 15–25 A | 4 mm² | AWG 12 |
| 25–40 A | 6 mm² | AWG 10 |
| 40–63 A | 10 mm² | AWG 8 |
| 63–100 A | 16 mm² | AWG 6 |
| > 100 A | 25 mm²+ | AWG 4+ |

---

# Primary Goal

Allow a vacuum former designer to enter:

- Panel dimensions (for power density)
- Wire material and diameter
- Target wire temperature
- Supply voltage
- Element topology

and immediately determine:

- Required total wire length
- Per-element wire length
- Electrical feasibility
- Total power and current
- Panel surface power density
- Feed wire sizing (mm² and AWG)
- Safety margins

without manually performing heater calculations.