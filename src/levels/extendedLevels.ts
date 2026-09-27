import { LevelDefinition, InteractiveObject, TelemetryGauge, LevelConsequence } from '../types/game';

interface LevelTemplate {
  title: string;
  subtitle: string;
  theme: string;
  objective: string;
  briefing: string;
  warningNote: string;
  solutionHint: string;
  solutionSteps: string[];
  diagnostic: string;
  advice: string;
  verification: string;
  actuatorA: { name: string; label: string; off: string; on: string; hint: string };
  actuatorB: { name: string; label: string; off: string; on: string; hint: string };
  actuatorC: { name: string; label: string; off: string; on: string; hint: string };
  gaugeA: { label: string; unit: string; initial: number; safeMin: number; safeMax: number; dangerHigh: number };
  gaugeB: { label: string; unit: string; initial: number; safeMin: number; safeMax: number; dangerHigh: number };
  failureTitle: string;
  failureCause: string;
  failureReport: string;
}

const EXTENDED_TEMPLATES: LevelTemplate[] = [
  // 6 - 10: Fluid Dynamics & High Pressure
  {
    title: 'HYDRAULIC SIPHON',
    subtitle: 'High-Ram Counterweight Equalization',
    theme: 'hydraulics',
    objective: 'Vent hydraulic return reservoir before unseating the primary ram valve',
    briefing: 'Chamber elevator ram is charged to 750 PSI hydraulic fluid. Opening the ram line under static head pressure causes burst seal blow-out.',
    warningNote: 'RESERVOIR VENT MUST BE OPEN BEFORE RAM DISCHARGE.',
    solutionHint: 'Open Reservoir Vent 01, depress Bypass Bleed 02, then shift Ram Lever 03 to RETRACT.',
    solutionSteps: ['Open Valve 01 (Reservoir Vent) to OPEN.', 'Depress Valve 02 (Bypass Bleed) to BLEED.', 'Shift Lever 03 (Ram Control) to RETRACT.'],
    diagnostic: 'Main hydraulic cylinder holds 750 PSI static head; reservoir backpressure is sealed.',
    advice: 'Never force fluid through an unvented reservoir or burst seals will drench the floor.',
    verification: 'Confirm reservoir backpressure reads below 20 PSI before releasing ram control.',
    actuatorA: { name: 'Reservoir Breather Vent', label: 'VALVE 01 — RESERVOIR VENT', off: 'SHUT', on: 'OPEN', hint: 'Vents air blanket in oil reservoir.' },
    actuatorB: { name: 'Equalizer Bypass Bleed', label: 'VALVE 02 — BYPASS BLEED', off: 'LOCKED', on: 'BLEED', hint: 'Bleeds line fluid into tank.' },
    actuatorC: { name: 'Master Ram Control', label: 'LEVER 03 — RAM POSITION', off: 'HOLD', on: 'RETRACT', hint: 'Engages cylinder return stroke.' },
    gaugeA: { label: 'RAM PRESSURE', unit: 'PSI', initial: 750, safeMin: 0, safeMax: 50, dangerHigh: 700 },
    gaugeB: { label: 'RESERVOIR BACKPRESSURE', unit: 'PSI', initial: 120, safeMin: 0, safeMax: 20, dangerHigh: 100 },
    failureTitle: 'HYDRAULIC LINE DETONATION',
    failureCause: 'Ram lever was shifted before the reservoir vent was unsealed.',
    failureReport: 'Overpressurized mineral oil fractured the high-pressure braided sleeve, atomizing flammable mist across the console.',
  },
  {
    title: 'CAPACITOR DISCHARGE',
    subtitle: 'Step-Down Resistor & Bus Bleed',
    theme: 'voltage',
    objective: 'Bleed high-voltage bank through thermal sinks before bus isolation',
    briefing: 'Pulse discharge capacitors store 900V DC. Touching main contactors without resistor shunt creates lethal plasma flash.',
    warningNote: 'ENGAGE THERMAL SHUNT RESISTOR BEFORE OPENING CONTACTOR.',
    solutionHint: 'Close Shunt Resistor 01, verify voltage bleeds to zero, then open Main Contactor 02, and latch Safety Ground 03.',
    solutionSteps: ['Engage Switch 01 (Thermal Shunt) to ACTIVE.', 'Open Breaker 02 (Main Contactor) to OPEN.', 'Lock Lever 03 (Safety Ground) to GROUNDED.'],
    diagnostic: 'Electrolytic capacitor bank holds 900 Volts DC across bus terminals.',
    advice: 'Capacitor stored energy does not vanish when breakers open; always bleed to earth.',
    verification: 'Bus voltage must read 0V before the safety ground bar is clamped.',
    actuatorA: { name: 'Thermal Shunt Resistor', label: 'SWITCH 01 — SHUNT LOAD', off: 'ISOLATED', on: 'ACTIVE', hint: 'Dumps energy into ceramic resistors.' },
    actuatorB: { name: 'Main Bus Contactor', label: 'BREAKER 02 — BUS CONTACTOR', off: 'CLOSED', on: 'OPEN', hint: 'High-current mechanical contactor.' },
    actuatorC: { name: 'Bus Grounding Bar', label: 'LEVER 03 — SAFETY GROUND', off: 'FREE', on: 'GROUNDED', hint: 'Physical copper earthing strap.' },
    gaugeA: { label: 'BUS POTENTIAL', unit: 'VOLTS', initial: 900, safeMin: 0, safeMax: 12, dangerHigh: 600 },
    gaugeB: { label: 'SHUNT TEMP', unit: '°C', initial: 22, safeMin: 20, safeMax: 85, dangerHigh: 110 },
    failureTitle: 'LETHAL PLASMA DISCHARGE',
    failureCause: 'Contactor was pulled or grounded while the 900V capacitor bank remained charged.',
    failureReport: 'An intense 900V arc vaporized terminal lugs, showering copper spatter across the technician station.',
  },
  {
    title: 'SPARK GAP QUENCH',
    subtitle: 'Resonance Tuning & Arc Extinguisher',
    theme: 'dielectric',
    objective: 'Pressurize dielectric chamber and extinguish high-frequency spark gap',
    briefing: 'A rotary spark gap oscillator is arcing continuously. Without dielectric air blast, continuous ionizing arcs melt the brass electrodes.',
    warningNote: 'AIR BLAST MUST BE ACTIVE BEFORE QUENCH SHUTTER ADVANCES.',
    solutionHint: 'Spin Air Blower 01, engage Arc Blast Valve 02, then pull Quench Shutter 03.',
    solutionSteps: ['Toggle Switch 01 (Air Blower) to RUN.', 'Open Valve 02 (Arc Air Blast) to BLAST.', 'Slide Lever 03 (Quench Shutter) to QUENCH.'],
    diagnostic: 'Rotary spark electrodes glowing at 450°C under continuous 15kV ionization.',
    advice: 'De-ionize the arc envelope with turbulent air before mechanically closing the gap shutter.',
    verification: 'Electrode temperature must drop below 80°C before quench shutter seals.',
    actuatorA: { name: 'Blower Air Compressor', label: 'SWITCH 01 — AIR BLOWER', off: 'STOPPED', on: 'RUN', hint: 'Starts forced-draft air supply.' },
    actuatorB: { name: 'Dielectric Air Blast Valve', label: 'VALVE 02 — ARC BLAST', off: 'CLOSED', on: 'BLAST', hint: 'Directs air across electrode pins.' },
    actuatorC: { name: 'Electrode Quench Shutter', label: 'LEVER 03 — QUENCH SHUTTER', off: 'OPEN', on: 'QUENCH', hint: 'Snuffs spark gap.' },
    gaugeA: { label: 'ELECTRODE TEMP', unit: '°C', initial: 450, safeMin: 20, safeMax: 80, dangerHigh: 400 },
    gaugeB: { label: 'BLAST PRESSURE', unit: 'PSI', initial: 0, safeMin: 45, safeMax: 90, dangerHigh: 120 },
    failureTitle: 'ELECTRODE BRASS MELTDOWN',
    failureCause: 'Shutter was closed while electrodes were burning without sufficient cooling airflow.',
    failureReport: 'Sustained continuous arc flash fused the tungsten pins into molten slag, triggering fire containment.',
  },
  {
    title: 'INDUCTION FLUX',
    subtitle: 'Core Magnetic Bias & Water Jacket',
    theme: 'electromagnetics',
    objective: 'Circulate cooling jacket water before ramping induction coil bias',
    briefing: 'Radio-frequency induction coil operates at 10 kHz. Operating without water jacket cooling will vaporize the hollow copper tubing.',
    warningNote: 'DO NOT APPLY CORE BIAS WITH ZERO COOLING FLOW.',
    solutionHint: 'Open Cooling Siphon 01, start Water Pump 02, then rotate Flux Bias Dial 03 to OPTIMAL.',
    solutionSteps: ['Turn Valve 01 (Cooling Siphon) to FLOW.', 'Flip Switch 02 (Coolant Pump) to RUN.', 'Rotate Dial 03 (Flux Bias) to TUNED.'],
    diagnostic: 'Core temperature is 85°C; coolant flow sensor reads 0 L/min.',
    advice: 'Always establish fluid cooling loop before energizing high-amperage induction field coils.',
    verification: 'Coolant flow must reach 30 L/min before flux bias dial is advanced.',
    actuatorA: { name: 'Coolant Supply Siphon', label: 'VALVE 01 — COOLANT SIPHON', off: 'OFF', on: 'FLOW', hint: 'Opens jacket supply lines.' },
    actuatorB: { name: 'Circulation Impeller', label: 'SWITCH 02 — PUMP RUN', off: 'STOP', on: 'RUN', hint: 'Pumps glycol coolant.' },
    actuatorC: { name: 'Magnetic Flux Bias', label: 'DIAL 03 — FLUX BIAS', off: 'ZERO', on: 'TUNED', hint: 'Tunes magnetic coupling.' },
    gaugeA: { label: 'COOLANT FLOW', unit: 'L/MIN', initial: 0, safeMin: 25, safeMax: 60, dangerHigh: 70 },
    gaugeB: { label: 'COIL TEMPERATURE', unit: '°C', initial: 85, safeMin: 18, safeMax: 45, dangerHigh: 90 },
    failureTitle: 'INDUCTION COIL BURNOUT',
    failureCause: 'Magnetic bias was energized without establishing jacket coolant flow.',
    failureReport: 'Hollow copper induction coils expanded and split under intense Joule heating, venting boiling coolant.',
  },
  {
    title: 'CATHODE EMITTER',
    subtitle: 'Filament Pre-Heat & Anode Bias',
    theme: 'vacuum-tubes',
    objective: 'Preheat thorium filament before applying 12kV accelerating anode potential',
    briefing: 'Giant transmitting triode requires step-wise filament warm-up. Cold cathode field emission will strip the thorium coating off the filament wire.',
    warningNote: 'APPLYING HIGH VOLTAGE TO COLD CATHODE DESTROYS TUBE.',
    solutionHint: 'Switch Filament 01 to LOW, advance Filament 01 to FULL, then engage Grid Bias 02, and close Anode Breaker 03.',
    solutionSteps: ['Flip Switch 01 (Filament Supply) to PRE-HEAT.', 'Rotate Switch 02 (Grid Bias) to BIASED.', 'Throw Breaker 03 (Anode High Tension) to ENERGIZED.'],
    diagnostic: 'Cathode emission meter is zero; filament filament resistance cold.',
    advice: 'Gradual thermal expansion prevents thermal shock breakage in vacuum tube glass seals.',
    verification: 'Filament current must stabilize at nominal 12A before anode knife switch is thrown.',
    actuatorA: { name: 'Filament Heater Supply', label: 'SWITCH 01 — FILAMENT HEATER', off: 'OFF', on: 'PRE-HEAT', hint: 'Slowly warms cathode wire.' },
    actuatorB: { name: 'Negative Grid Bias', label: 'SWITCH 02 — GRID BIAS', off: 'FLOATING', on: 'BIASED', hint: 'Prevents runaway plate current.' },
    actuatorC: { name: 'Anode High Tension Breaker', label: 'BREAKER 03 — ANODE 12KV', off: 'TRIPPED', on: 'ENERGIZED', hint: 'Applies plate accelerating potential.' },
    gaugeA: { label: 'FILAMENT CURRENT', unit: 'AMPS', initial: 0, safeMin: 10, safeMax: 14, dangerHigh: 18 },
    gaugeB: { label: 'ANODE VOLTAGE', unit: 'kV', initial: 0, safeMin: 10, safeMax: 13, dangerHigh: 16 },
    failureTitle: 'CATHODE EMITTER STRIPPED',
    failureCause: 'High-voltage anode potential was engaged while the cathode was cold.',
    failureReport: 'Severe ion bombardment stripped the thorium coating from the tube cathode, permanently destroying the filament.',
  },
];

// Helper to construct deterministic 45 levels programmatically from rich analog systems
export function generateExtendedLevels(): LevelDefinition[] {
  const levels: LevelDefinition[] = [];

  const sectors = [
    { name: 'HYDROSTATICS & FLUIDS', prefix: 'FLUID' },
    { name: 'HIGH VOLTAGE & DIELECTRICS', prefix: 'VOLT' },
    { name: 'THERMODYNAMICS & STEAM', prefix: 'STEAM' },
    { name: 'PNEUMATICS & GAS FLOW', prefix: 'GAS' },
    { name: 'NUCLEAR & RADIATION', prefix: 'NUCL' },
    { name: 'MECHANICAL INERTIA', prefix: 'MECH' },
    { name: 'CRYOGENICS & PHASE', prefix: 'CRYO' },
    { name: 'CHEMICAL REACTION', prefix: 'CHEM' },
    { name: 'APEX TERMINAL FACILITY', prefix: 'APEX' },
  ];

  const systemNames = [
    'HYDRAULIC ELEVATOR VALVE', 'CAPACITOR DISCHARGE BANK', 'SPARK GAP QUENCHER', 'INDUCTION FURNACE FLUX', 'CATHODE RAY EMITTER',
    'SF6 ARC QUENCH TANK', 'THREE-PHASE GRID PHASER', 'SUPERHEATER COIL BANK', 'BOILER BOTTOM BLOWDOWN', 'DEAERATOR STEAM COLUMN',
    'FLUE GAS ECONOMIZER', 'FLASH CONDENSATE DRUM', 'STEAM REHEATER BYPASS', 'COMPRESSED AIR MANIFOLD', 'CENTRIFUGAL COMPRESSOR',
    'VENTURI DIFFERENTIAL GAUGE', 'DESICCANT TOWER DRYER', 'PNEUMATIC PILOT INTERLOCK', 'HELMHOLTZ RESONATOR', 'CADMIUM SHIELD RODS',
    'HEAVY WATER MODERATOR', 'RADIATION LEAD SLUICE', 'MAGNETIC TRIP SCRAM', 'XENON GAS TRAP', 'BORATED SUMP FLOOD',
    'INERTIAL FLYWHEEL BATTERY', 'PLANETARY REDUCTION GEAR', 'TORSION SHAFT BALANCER', 'SPRAG OVERRUN CLUTCH', 'CRANKSHAFT VISCOUS DAMPER',
    'TORQUE GYROSCOPE GIMBAL', 'LIQUID NITROGEN DEWAR', 'JOULE-THOMSON CRYO VALVE', 'SUPERCONDUCTOR QUENCH BUS', 'COLD FINGER ZEOLITE TRAP',
    'HELIUM EXPANSION TURBINE', 'GRAVITY HEAT PIPE LOOP', 'CATALYTIC AUTO-REFORMER', 'CAUSTIC NEUTRALIZER TANK', 'EXOTHERMIC POLYMER QUENCH',
    'FRACTIONAL DISTILLATION GATE', 'FLASH VAPOR ARRESTOR', 'SUPERSONIC SHOCK TUNNEL', 'MAGNETIC BOTTLE HARMONIC', 'MASTER COLD SHUTDOWN'
  ];

  for (let i = 0; i < 45; i++) {
    const levelNumber = i + 6;
    const sysName = systemNames[i % systemNames.length];
    const sector = sectors[Math.floor(i / 5) % sectors.length];
    const template = EXTENDED_TEMPLATES[i % EXTENDED_TEMPLATES.length];

    const actuatorAId = `actuatorA_${levelNumber}`;
    const actuatorBId = `actuatorB_${levelNumber}`;
    const actuatorCId = `actuatorC_${levelNumber}`;

    const level: LevelDefinition = {
      id: `level-${levelNumber < 10 ? '0' : ''}${levelNumber}`,
      levelNumber,
      title: sysName,
      subtitle: `Sector ${sector.prefix} · Chamber ${levelNumber}`,
      theme: sector.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      objective: `Execute calibrated protocol on ${sysName.toLowerCase()} and stabilize baseline gauges`,
      briefing: `Chamber 0${levelNumber} regulates ${sysName.toLowerCase()}. Interlock circuits enforce deterministic operational sequencing. Bypassing stage 1 or stage 2 triggers emergency lockout.`,
      warningNote: `OBSERVE GAUGE DEFLECTIONS CAREFULLY. COMPLETE STAGE 1 BEFORE DISENGAGING PRIMARY INTERLOCKS.`,
      solutionHint: `First toggle ${template.actuatorA.label} to ${template.actuatorA.on}, then set ${template.actuatorB.label} to ${template.actuatorB.on}, and finally engage ${template.actuatorC.label} to ${template.actuatorC.on}.`,
      solutionSteps: [
        `Set ${template.actuatorA.label} from ${template.actuatorA.off} to ${template.actuatorA.on}.`,
        `Engage ${template.actuatorB.label} from ${template.actuatorB.off} to ${template.actuatorB.on}.`,
        `Throw ${template.actuatorC.label} to ${template.actuatorC.on} once telemetry settles.`
      ],
      technicianNotes: {
        diagnostic: `${template.diagnostic} Facility telemetry reports baseline deviation on Sector ${sector.prefix}.`,
        operationalAdvice: `${template.advice} Sequence timing must follow sequential equilibrium.`,
        verificationCheck: `${template.verification} Verify primary indicator needles are within optimal zones.`
      },
      maxMoves: 6 + (levelNumber % 3),
      parMoves: 3,
      initialState: {
        [actuatorAId]: template.actuatorA.off,
        [actuatorBId]: template.actuatorB.off,
        [actuatorCId]: template.actuatorC.off,
        gaugeAVal: template.gaugeA.initial,
        gaugeBVal: template.gaugeB.initial,
        stabilized: false,
      },
      objects: [
        {
          id: actuatorAId,
          name: template.actuatorA.name,
          type: 'toggle',
          label: template.actuatorA.label,
          state: template.actuatorA.off,
          options: [
            { value: template.actuatorA.off, label: template.actuatorA.off },
            { value: template.actuatorA.on, label: template.actuatorA.on },
          ],
          hint: template.actuatorA.hint,
        },
        {
          id: actuatorBId,
          name: template.actuatorB.name,
          type: 'lever',
          label: template.actuatorB.label,
          state: template.actuatorB.off,
          options: [
            { value: template.actuatorB.off, label: template.actuatorB.off },
            { value: template.actuatorB.on, label: template.actuatorB.on },
          ],
          hint: template.actuatorB.hint,
        },
        {
          id: actuatorCId,
          name: template.actuatorC.name,
          type: 'breaker',
          label: template.actuatorC.label,
          state: template.actuatorC.off,
          options: [
            { value: template.actuatorC.off, label: template.actuatorC.off },
            { value: template.actuatorC.on, label: template.actuatorC.on },
          ],
          hint: template.actuatorC.hint,
        },
      ],
      gauges: (state) => [
        {
          id: 'gaugeA',
          label: template.gaugeA.label,
          unit: template.gaugeA.unit,
          min: 0,
          max: template.gaugeA.dangerHigh * 1.25,
          value: Math.round(state.gaugeAVal ?? template.gaugeA.initial),
          dangerHigh: template.gaugeA.dangerHigh,
          optimalMin: template.gaugeA.safeMin,
          optimalMax: template.gaugeA.safeMax,
        },
        {
          id: 'gaugeB',
          label: template.gaugeB.label,
          unit: template.gaugeB.unit,
          min: 0,
          max: template.gaugeB.dangerHigh * 1.3,
          value: Math.round(state.gaugeBVal ?? template.gaugeB.initial),
          dangerHigh: template.gaugeB.dangerHigh,
          optimalMin: template.gaugeB.safeMin,
          optimalMax: template.gaugeB.safeMax,
        },
      ],
      statusMessage: (state, moves) => {
        if (state[actuatorAId] === template.actuatorA.on && state[actuatorBId] === template.actuatorB.on) {
          return `Telemetry stabilizing. Terminal interlock ready. Moves: 0${moves}`;
        }
        if (state[actuatorAId] === template.actuatorA.on) {
          return `Auxiliary loop established. Secondary bleed required. Moves: 0${moves}`;
        }
        return `Standby condition. System pressurized at baseline. Moves: 0${moves}`;
      },
      evaluate: (state, actionId, newValue, moves) => {
        const next = { ...state, [actionId]: newValue };

        // Premature actuator C activation without A or B
        if (actionId === actuatorCId && newValue === template.actuatorC.on) {
          if (next[actuatorAId] !== template.actuatorA.on || next[actuatorBId] !== template.actuatorB.on) {
            return {
              isFailure: true,
              isVictory: false,
              nextState: next,
              incidentTitle: template.failureTitle,
              incidentCause: template.failureCause,
              incidentReport: template.failureReport,
              advice: template.advice,
            };
          }
        }

        // Action A triggers safe ramp-down
        if (actionId === actuatorAId) {
          if (newValue === template.actuatorA.on) {
            next.gaugeAVal = Math.round((template.gaugeA.safeMin + template.gaugeA.safeMax) / 2);
            next.gaugeBVal = Math.round(template.gaugeB.initial * 0.5);
          } else {
            next.gaugeAVal = template.gaugeA.initial;
          }
        }

        // Action B triggers secondary stabilization
        if (actionId === actuatorBId) {
          if (newValue === template.actuatorB.on) {
            next.gaugeBVal = Math.round((template.gaugeB.safeMin + template.gaugeB.safeMax) / 2);
          }
        }

        // Final safe verification for victory
        if (
          next[actuatorAId] === template.actuatorA.on &&
          next[actuatorBId] === template.actuatorB.on &&
          next[actuatorCId] === template.actuatorC.on
        ) {
          return {
            isFailure: false,
            isVictory: true,
            nextState: next,
          };
        }

        return {
          isFailure: false,
          isVictory: false,
          nextState: next,
        };
      },
    };

    levels.push(level);
  }

  return levels;
}
