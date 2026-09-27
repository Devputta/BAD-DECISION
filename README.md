# BAD DECISION — V1
## 1970s Analog Control Room Consequence Puzzle

A browser-based consequential puzzle game built in the material language of **1970s mechanical laboratory equipment and analog control rooms**.

---

## Core Loop
```text
OBSERVE → UNDERSTAND → PLAN → ACT → SYSTEM RESPONDS → LEARN → RETRY → SOLVE
```

---

## CHAMBER 01 — PRESSURE SYSTEM

### 1. Specification & Behavior
The pressure gauge is connected directly to the game's machine state as the single source of truth (`levelState.pressure`).

- **Initial State**:
  - `pressure`: `800 PSI`
  - `reliefBypass`: `SHUT`
  - `condenserPump`: `STOPPED`
  - `steamExhaust`: `SEALED`
  - `bulkhead`: `DOGGED`
  - `status`: `CRITICAL · 800 PSI. DO NOT ENGAGE HATCH.`
- **Safe Threshold**: `< 50 PSI`
- **Critical Threshold**: `> 750 PSI`

### 2. Physical Actuators
1. **01. RELIEF BYPASS BLEED** (`SHUT` / `BLEED`):
   - Activating to `BLEED` begins continuous pressure bleed with real-time steam hiss sound.
   - Pressure visibly decrements: `800 → 760 → 720 → ... → 40 PSI`.
   - The analog needle physically sweeps downward from critical (+72°) towards the safe zone (-110°).
   - Toggling back to `SHUT` immediately halts the bleed.
2. **02. CONDENSER CHILLER PUMP** (`STOPPED` / `CIRCULATING`):
   - Circulates water to maintain condenser coil temperature.
3. **03. MAIN STEAM EXHAUST** (`SEALED` / `DUMP`):
   - High-pressure dump. If triggered while pressure > 50 PSI, causes `STEAM HAMMER PIPE RUPTURE`.
4. **04. BULKHEAD HATCH RELEASE** (`DOGGED` / `RELEASE`):
   - If pulled while pressure > 50 PSI: Triggers `EXPLOSIVE DECOMPRESSION INCIDENT`.
   - If pulled while pressure < 50 PSI: Bulkhead dogs disengage cleanly and chamber is solved!

### 3. Gauge Mapping Formula
```ts
const minAngle = -120;
const maxAngle = 120;
const pressureRatio = Math.max(0, Math.min(1, state.pressure / 1000));
const angle = minAngle + pressureRatio * (maxAngle - minAngle);
needle.style.transform = `rotate(${angle}deg)`;
```

---

## 5 HANDCRAFTED TEST CHAMBERS

1. **Chamber 01: Pressure** (*Consequences*): Depressurize the 800 PSI steam chamber safely before releasing the bulkhead door dogs.
2. **Chamber 02: Synchronicity** (*Timing*): Balance flywheel friction brake and speed governor to hold line frequency at 60 Hz before connecting the grid bus.
3. **Chamber 03: The Discharge** (*Object Interaction*): Isolate the 440V knife switch and discharge the 600-Joule capacitor bank before replacing the blown ceramic fuse.
4. **Chamber 04: The Bait** (*Misdirection*): Resist the enticing, giant red "EMERGENCY OVERRIDE" button (which dumps suffocating Halon gas) and execute the calibrated nitrogen bleed.
5. **Chamber 05: The Cascade** (*Delayed Consequence*): Balance impeller agitation, nichrome heating, and reactant feed across stages to avoid thermal detonation.

---

## KEYBOARD SHORTCUTS
- `1` – `9`: Actuate respective mechanical switches / valves
- `R`: Instant console apparatus reset
- `ESC`: Return to Main Console
