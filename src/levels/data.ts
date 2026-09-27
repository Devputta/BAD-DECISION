import { LevelDefinition } from '../types/game';
import { generateExtendedLevels } from './extendedLevels';

const CORE_LEVELS: LevelDefinition[] = [
  // LEVEL 01: CONSEQUENCES
  {
    id: 'level-01',
    levelNumber: 1,
    title: 'PRESSURE',
    subtitle: 'Chamber Bulkhead Depressurization',
    theme: 'consequences',
    objective: 'Safely bleed 800 PSI steam chamber and open Bulkhead A',
    briefing: 'Chamber contains superheated steam at 800 PSI. The hatch interlock is mechanically locked under pressure. Opening high-pressure lines without bleeding will cause catastrophic blowback.',
    warningNote: 'DO NOT FORCE THE HATCH LEVER UNDER PRESSURE. SAFE THRESHOLD IS BELOW 50 PSI.',
    solutionHint: 'The Relief Bypass Bleed safely vents superheated steam. Wait until the gauge needle drops below 50 PSI before engaging the bulkhead release.',
    solutionSteps: [
      'Set Valve 01 (Relief Bypass Bleed) from SHUT to BLEED.',
      'Observe the pressure gauge as it bleeds down from 800 PSI to below 50 PSI (into the green SAFE range).',
      'Pull Lever 04 (Bulkhead Hatch Release) from DOGGED to RELEASE.'
    ],
    technicianNotes: {
      diagnostic: 'Chamber sits at critical baseline pressure (800 PSI). Main steam lines and rooftop exhaust are cold; bulkhead interlock pins are dogged down under extreme hydrostatic tension.',
      operationalAdvice: 'Do not attempt to force 800 PSI with door levers. Bleed line pressure gradually through the bypass circuit first to relieve line shock before testing mechanical latches.',
      verificationCheck: 'Confirm the chamber pressure needle drops below 50 PSI into the green indicator zone before attempting any physical door release.'
    },
    maxMoves: 6,
    parMoves: 2,
    initialState: {
      pressure: 800,
      condenserTemperature: 24,
      reliefBypass: 'SHUT', // 'SHUT' | 'BLEED'
      condenserPump: 'STOPPED', // 'STOPPED' | 'CIRCULATING'
      steamExhaust: 'SEALED', // 'SEALED' | 'DUMP'
      bulkhead: 'DOGGED', // 'DOGGED' | 'RELEASE'
    },
    objects: [
      {
        id: 'reliefBypass',
        name: 'Relief Bypass Bleed',
        type: 'lever',
        label: 'VALVE 01 — BYPASS BLEED',
        state: 'SHUT',
        options: [
          { value: 'SHUT', label: 'SHUT' },
          { value: 'BLEED', label: 'BLEED' },
        ],
        hint: 'Relieves chamber pressure gradually down to safe threshold (< 50 PSI).',
      },
      {
        id: 'condenserPump',
        name: 'Condenser Chiller Pump',
        type: 'toggle',
        label: 'PUMP 02 — CONDENSER CHILLER',
        state: 'STOPPED',
        options: [
          { value: 'STOPPED', label: 'STOPPED' },
          { value: 'CIRCULATING', label: 'CIRCULATING' },
        ],
        hint: 'Circulates cooling water through condenser coils.',
      },
      {
        id: 'steamExhaust',
        name: 'Main Steam Exhaust',
        type: 'dial',
        label: 'VALVE 03 — MAIN EXHAUST',
        state: 'SEALED',
        options: [
          { value: 'SEALED', label: 'SEALED' },
          { value: 'DUMP', label: 'DUMP' },
        ],
        hint: 'Full discharge conduit to rooftop stack. Unsafe at high pressure.',
      },
      {
        id: 'bulkhead',
        name: 'Bulkhead Hatch Release',
        type: 'breaker',
        label: 'LEVER 04 — HATCH INTERLOCK',
        state: 'DOGGED',
        options: [
          { value: 'DOGGED', label: 'DOGGED' },
          { value: 'RELEASE', label: 'RELEASE' },
        ],
        hint: 'Heavy 4-pin steel bulkhead latch. Safe only when pressure is below 50 PSI.',
      },
    ],
    gauges: (state) => [
      {
        id: 'pressure',
        label: 'CHAMBER PRESSURE',
        unit: 'PSI',
        min: 0,
        max: 1000,
        value: Math.round(state.pressure ?? 800),
        dangerHigh: 750,
        optimalMin: 0,
        optimalMax: 50,
      },
      {
        id: 'condenserTemperature',
        label: 'CONDENSER TEMP',
        unit: '°C',
        min: 0,
        max: 150,
        value: state.condenserTemperature ?? 24,
        dangerHigh: 110,
        optimalMin: 15,
        optimalMax: 55,
      },
    ],
    statusMessage: (state, movesUsed) => {
      const p = Math.round(state.pressure ?? 800);
      if (state.bulkhead === 'RELEASE' && p <= 50) {
        return 'BULKHEAD RELEASED. ATMOSPHERE EQUALIZED.';
      }
      if (p > 750) {
        return `CRITICAL · ${p} PSI. DO NOT ENGAGE HATCH.`;
      }
      if (p > 50) {
        return state.reliefBypass === 'BLEED'
          ? `BLEEDING IN PROGRESS · ${p} PSI (HIGH)`
          : `HIGH PRESSURE · ${p} PSI. ACTIVATE RELIEF BYPASS.`;
      }
      return `SAFE · ${p} PSI (< 50 PSI). BULKHEAD READY FOR RELEASE.`;
    },
    evaluate: (state, actionId, newValue, movesUsed) => {
      const next = { ...state, [actionId]: newValue };
      const currentPressure = Math.round(state.pressure ?? 800);

      // Control 4: Bulkhead Hatch Release
      if (actionId === 'bulkhead' && newValue === 'RELEASE') {
        if (currentPressure > 50) {
          return {
            isFailure: true,
            isVictory: false,
            nextState: next,
            incidentTitle: 'EXPLOSIVE DECOMPRESSION INCIDENT',
            incidentCause: `Bulkhead release was attempted while chamber pressure exceeded the safe limit of 50 PSI (Pressure at failure: ${currentPressure} PSI).`,
            incidentReport: 'Bulkhead release was attempted while internal pressure was at lethal level. The 4-pin mechanical dogs sheared off instantly; explosive decompression blew the hatch into the corridor.',
            advice: 'Depressurize the system before pulling the door lever. The relief bypass is designed to bleed pressure safely.',
          };
        } else {
          return {
            isFailure: false,
            isVictory: true,
            nextState: next,
          };
        }
      }

      // Control 3: Main Steam Exhaust
      if (actionId === 'steamExhaust' && newValue === 'DUMP') {
        if (currentPressure > 50) {
          return {
            isFailure: true,
            isVictory: false,
            nextState: next,
            incidentTitle: 'STEAM HAMMER PIPE RUPTURE',
            incidentCause: 'Main steam exhaust was opened while the system remained at unsafe pressure.',
            incidentReport: 'Steam discharge destabilized the system. Cold exhaust conduit ruptured under 800 PSI shockwave, filling the chamber with scalding vapor.',
            advice: 'Reduce pressure before opening the main exhaust. The relief bypass is designed to bleed pressure safely.',
          };
        } else {
          next.pressure = 0;
        }
      }

      // Control 1: Relief Bypass Bleed
      if (actionId === 'reliefBypass') {
        if (newValue === 'BLEED') {
          next.reliefBypass = 'BLEED';
          // Immediately start decreasing pressure on activation
          next.pressure = Math.max(40, currentPressure - 50);
        } else {
          next.reliefBypass = 'SHUT';
        }
      }

      // Control 2: Condenser Chiller Pump
      if (actionId === 'condenserPump') {
        next.condenserTemperature = newValue === 'CIRCULATING' ? 18 : 24;
      }

      return {
        isFailure: false,
        isVictory: false,
        nextState: next,
      };
    },
  },

  // LEVEL 02: TIMING & ROTARY CYCLE
  {
    id: 'level-02',
    levelNumber: 2,
    title: 'SYNCHRONICITY',
    subtitle: '60Hz Rotary Alternator Lock',
    theme: 'timing',
    objective: 'Bring heavy flywheel generator to exactly 60 Hz and engage grid bus',
    briefing: 'A 2-ton cast-iron rotary flywheel supplies power to the magnetic door latch. Frequency must be held between 58 and 62 Hz prior to bus connection, or out-of-phase arc flash will incinerate the station.',
    warningNote: 'NEVER SHIFT GOVERNOR TO HIGH WHILE CLUTCH IS DRY.',
    solutionHint: 'Apply the friction brake first, engage the clutch, set governor to Position 2 (60 Hz), then release the brake so frequency stabilizes at 60 Hz before connecting the bus.',
    solutionSteps: [
      'Set Brake 01 (Friction Damping) to APPLIED (DRAG).',
      'Pull Clutch 02 (Rotor Engage) to DRIVE LOCKED.',
      'Rotate Dial 03 (Speed Governor) to POSITION 2 (60 Hz).',
      'Release Brake 01 (Friction Damping) so frequency settles cleanly at 60 Hz.',
      'Throw Switch 04 (Main Bus Latch) to GRID CONNECTED.'
    ],
    technicianNotes: {
      diagnostic: 'Alternator rotor is completely stationary at 0 RPM with main electrical bus uncoupled. Line frequency reads 0 Hz.',
      operationalAdvice: 'Turbine acceleration without load causes runaway rotor overspeed. Apply stabilizing friction drag to the rotor before engaging drive coupling, then bring frequency to synchronous velocity.',
      verificationCheck: 'Allow line frequency to settle exactly between 58 and 62 Hz. Closing the bus coupler out of phase results in instant 20,000-amp arc flash.'
    },
    maxMoves: 7,
    parMoves: 5,
    initialState: {
      dampingBrake: 'OFF',   // 'OFF' | 'APPLIED'
      governorGear: 'NEUTRAL', // 'NEUTRAL' | 'LOW' | 'DIRECT' | 'HIGH'
      clutchLever: 'DISENGAGED', // 'DISENGAGED' | 'ENGAGED'
      busCoupler: 'OPEN', // 'OPEN' | 'CLOSED'
      frequency: 0,
      rotorRPM: 0,
      phaseSync: 0,
    },
    objects: [
      {
        id: 'dampingBrake',
        name: 'Flywheel Friction Brake',
        type: 'toggle',
        label: 'BRAKE 01 — FRICTION DAMPING',
        state: 'OFF',
        options: [
          { value: 'OFF', label: 'RELEASED' },
          { value: 'APPLIED', label: 'APPLIED (DRAG)' },
        ],
        hint: 'Provides stabilizing drag against runaway rotor acceleration.',
      },
      {
        id: 'clutchLever',
        name: 'Mechanical Flywheel Clutch',
        type: 'lever',
        label: 'CLUTCH 02 — ROTOR ENGAGE',
        state: 'DISENGAGED',
        options: [
          { value: 'DISENGAGED', label: 'FREE-WHEEL' },
          { value: 'ENGAGED', label: 'DRIVE LOCKED' },
        ],
        hint: 'Couples drive turbine to the heavy inertial flywheel.',
      },
      {
        id: 'governorGear',
        name: 'Turbine Speed Governor',
        type: 'dial',
        label: 'DIAL 03 — SPEED GOVERNOR',
        state: 'NEUTRAL',
        options: [
          { value: 'NEUTRAL', label: 'IDLE (0 RPM)' },
          { value: 'LOW', label: 'POSITION 1 (30 Hz)' },
          { value: 'DIRECT', label: 'POSITION 2 (60 Hz)' },
          { value: 'HIGH', label: 'POSITION 3 (90 Hz OVERSPEED)' },
        ],
        hint: 'Regulates steam intake to control output electrical frequency.',
      },
      {
        id: 'busCoupler',
        name: 'Magnetic Grid Coupler',
        type: 'breaker',
        label: 'SWITCH 04 — MAIN BUS LATCH',
        state: 'OPEN',
        options: [
          { value: 'OPEN', label: 'ISOLATED' },
          { value: 'CLOSED', label: 'GRID CONNECTED' },
        ],
        hint: 'Encloses magnetic interlock to bridge generator to facility grid.',
      },
    ],
    gauges: (state) => [
      {
        id: 'frequency',
        label: 'LINE FREQUENCY',
        unit: 'Hz',
        min: 0,
        max: 100,
        value: state.frequency,
        dangerLow: 10,
        dangerHigh: 75,
        optimalMin: 58,
        optimalMax: 62,
      },
      {
        id: 'rotorRPM',
        label: 'ROTOR VELOCITY',
        unit: 'RPM',
        min: 0,
        max: 3600,
        value: state.rotorRPM,
        dangerHigh: 3000,
        optimalMin: 1750,
        optimalMax: 1850,
      },
    ],
    statusMessage: (state, movesUsed) => {
      if (state.busCoupler === 'CLOSED' && state.frequency >= 58 && state.frequency <= 62) {
        return 'GRID PHASE LOCKED AT 60.0 Hz. BULKHEAD MAGNET ENERGIZED.';
      }
      if (state.governorGear === 'HIGH') {
        return 'DANGER: TURBINE OVERSPEED DETECTED! ROTOR WHINE REACHING 90 Hz.';
      }
      if (state.frequency >= 58 && state.frequency <= 62) {
        return 'SYNCHRONOUS SPEED REACHED (60 Hz). BUS READY FOR CONNECTION.';
      }
      return `CURRENT FREQUENCY: ${state.frequency} Hz (TARGET: 60 Hz).`;
    },
    evaluate: (state, actionId, newValue, movesUsed) => {
      // Failure 1: Slamming governor to HIGH without brake or clutch engaged
      if (actionId === 'governorGear' && newValue === 'HIGH') {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'CATASTROPHIC FLYWHEEL BURST',
          incidentReport: 'Governor set to maximum without load. Centrifugal force tore the 4,000-pound flywheel into supersonic shrapnel. One section exited through the administration building.',
          incidentCause: 'Turbine overspeed exceeding 3,600 RPM yield strength.',
          advice: 'Never dial governor past Position 2 (60 Hz). Overspeed is fatal.',
        };
      }

      // Failure 2: Engaging Bus Coupler while out of phase
      if (actionId === 'busCoupler' && newValue === 'CLOSED') {
        const currentFreq = state.frequency;
        if (currentFreq < 58 || currentFreq > 62) {
          return {
            isFailure: true,
            isVictory: false,
            incidentTitle: 'PHASE OPPOSITION ARC FLASH',
            incidentReport: 'Connecting an alternator at the wrong phase creates a dead short against the regional power grid. A 20,000-amp fireball vaporized the switchboard and the operator’s eyebrows.',
            incidentCause: 'Engaging grid bus while frequency was not synchronized to 60 Hz.',
            advice: 'The line frequency must read exactly 60 Hz before throwing the main bus latch.',
          };
        }
      }

      // Safe state calculations:
      const next = { ...state, [actionId]: newValue };
      let freq = 0;
      let rpm = 0;

      if (next.clutchLever === 'ENGAGED') {
        if (next.governorGear === 'LOW') {
          freq = next.dampingBrake === 'APPLIED' ? 25 : 30;
          rpm = 900;
        } else if (next.governorGear === 'DIRECT') {
          // If brake is applied, frequency drops to 52; if brake is released, perfect 60 Hz
          freq = next.dampingBrake === 'APPLIED' ? 52 : 60;
          rpm = next.dampingBrake === 'APPLIED' ? 1560 : 1800;
        }
      }

      next.frequency = freq;
      next.rotorRPM = rpm;

      if (next.busCoupler === 'CLOSED' && freq >= 58 && freq <= 62) {
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
  },

  // LEVEL 03: OBJECT INTERACTION & CIRCUIT (HIGH VOLTAGE)
  {
    id: 'level-03',
    levelNumber: 3,
    title: 'THE DISCHARGE',
    subtitle: 'Ceramic Fuse Replacement Protocol',
    theme: 'object-interaction',
    objective: 'Replace blown 40A ceramic fuse and safely re-energize magnetron',
    briefing: 'The primary RF magnetron shut down due to a ruptured ceramic fuse. The console holds 440 Volts on the main bus and a 600-Joule capacitor bank that retains lethal voltage even when the breaker is open.',
    warningNote: 'TOUCHING FUSE SOCKET WHILE CHARGED = INSTANT DISPATCH.',
    solutionHint: 'Open the master breaker, bleed the 600J capacitor bank, clamp the ground hook to the bus, replace the fuse, detach the ground hook, close the breaker, then turn the arming key.',
    solutionSteps: [
      'Throw Breaker 01 (Master 440V Supply) to ISOLATED.',
      'Set Switch 02 (Bleed Resistor) to SHRUNT BLEED TO GROUND (discharges 600 Joules).',
      'Clamp Tool 03 (Copper Ground Hook) to bus terminal.',
      'Replace fuse in Slot 04 with NEW 40A CARTRIDGE.',
      'Hang Tool 03 (Copper Ground Hook) back on wall.',
      'Close Breaker 01 (Master 440V Supply) to LIVE 440V.',
      'Turn Key 05 (Magnetron Power) to POWER TRANSMIT.'
    ],
    technicianNotes: {
      diagnostic: 'Main 440V supply knife switch is closed; electrolytic capacitor bank holds 600 Joules of lethal residual voltage.',
      operationalAdvice: 'Isolating the mains breaker removes supply feed, but internal capacitors remain charged. Discharge capacitors through the bleed resistor before clamping terminal ground.',
      verificationCheck: 'Both bus potential (Volts) and capacitor energy (Joules) must read zero before hands contact fuse carriage. Unclamp ground hook prior to energizing.'
    },
    maxMoves: 8,
    parMoves: 6,
    initialState: {
      masterKnifeBreaker: 'CLOSED', // 'CLOSED' | 'OPEN'
      groundHookRod: 'HUNG_ON_WALL', // 'HUNG_ON_WALL' | 'GROUNDED_TO_BUS'
      fuseSocket: 'BLOWN_FUSE', // 'BLOWN_FUSE' | 'EMPTY' | 'NEW_FUSE'
      capacitorBleedSwitch: 'ISOLATED', // 'ISOLATED' | 'DISCHARGED'
      magnetronKey: 'OFF', // 'OFF' | 'ARMED'
      voltage: 440,
      capCharge: 600,
    },
    objects: [
      {
        id: 'masterKnifeBreaker',
        name: 'Master 440V Knife Switch',
        type: 'breaker',
        label: 'BREAKER 01 — 440V SUPPLY',
        state: 'CLOSED',
        options: [
          { value: 'CLOSED', label: 'CLOSED (LIVE 440V)' },
          { value: 'OPEN', label: 'OPEN (ISOLATED)' },
        ],
        hint: 'Exposed copper knife blades supplying three-phase main line.',
      },
      {
        id: 'capacitorBleedSwitch',
        name: 'Capacitor Bleed Resistor Switch',
        type: 'toggle',
        label: 'SWITCH 02 — BLEED RESISTOR',
        state: 'ISOLATED',
        options: [
          { value: 'ISOLATED', label: 'OPEN (HOLDING CHARGE)' },
          { value: 'DISCHARGED', label: 'SHRUNT BLEED TO GROUND' },
        ],
        hint: 'Routes capacitor bank energy into a heavy ceramic dummy load.',
      },
      {
        id: 'groundHookRod',
        name: 'Safety Grounding Hook Rod',
        type: 'lever',
        label: 'TOOL 03 — COPPER GROUND HOOK',
        state: 'HUNG_ON_WALL',
        options: [
          { value: 'HUNG_ON_WALL', label: 'HUNG ON WALL HOOK' },
          { value: 'GROUNDED_TO_BUS', label: 'CLAMPED TO BUS TERMINAL' },
        ],
        hint: 'Ensures zero residual charge exists on the terminal block.',
      },
      {
        id: 'fuseSocket',
        name: 'Ceramic Cartridge Fuse Slot',
        type: 'dial',
        label: 'SLOT 04 — FUSE CARTRIDGE',
        state: 'BLOWN_FUSE',
        options: [
          { value: 'BLOWN_FUSE', label: 'RUPTURED FUSE (DEAD)' },
          { value: 'EMPTY', label: 'EXTRACTED (SOCKET EMPTY)' },
          { value: 'NEW_FUSE', label: 'NEW 40A CARTRIDGE INSERTED' },
        ],
        hint: 'Holds heavy ceramic fuse between two spring-loaded brass clips.',
      },
      {
        id: 'magnetronKey',
        name: 'Magnetron Rotary Arming Key',
        type: 'key',
        label: 'KEY 05 — MAGNETRON POWER',
        state: 'OFF',
        options: [
          { value: 'OFF', label: 'STANDBY' },
          { value: 'ARMED', label: 'POWER TRANSMIT' },
        ],
        hint: 'Final power feed to the door unlocking transmitter.',
      },
    ],
    gauges: (state) => [
      {
        id: 'voltage',
        label: 'BUS POTENTIAL',
        unit: 'VOLTS',
        min: 0,
        max: 500,
        value: state.voltage,
        dangerHigh: 50,
        optimalMin: 0,
        optimalMax: 5,
      },
      {
        id: 'capCharge',
        label: 'STORED CAPACITOR ENERGY',
        unit: 'JOULES',
        min: 0,
        max: 600,
        value: state.capCharge,
        dangerHigh: 50,
        optimalMin: 0,
        optimalMax: 10,
      },
    ],
    statusMessage: (state, movesUsed) => {
      if (state.magnetronKey === 'ARMED' && state.fuseSocket === 'NEW_FUSE') {
        return 'MAGNETRON RESONANCE ESTABLISHED. BULKHEAD UNLOCKED.';
      }
      if (state.masterKnifeBreaker === 'CLOSED') {
        return 'DANGER: 440V LIVE BUS. EXTREME ELECTROCUTION HAZARD.';
      }
      if (state.capCharge > 0) {
        return `BREAKER OPEN, BUT CAPACITOR BANK HOLDS ${state.capCharge} JOULES.`;
      }
      if (state.groundHookRod !== 'GROUNDED_TO_BUS') {
        return 'CAPACITORS DRAINED. TERMINAL GROUND HOOK NOT YET CLAMPED.';
      }
      return 'SYSTEM SAFE FOR FUSE MANIPULATION.';
    },
    evaluate: (state, actionId, newValue, movesUsed) => {
      // Failure 1: Clamping ground hook to bus while breaker is still closed
      if (actionId === 'groundHookRod' && newValue === 'GROUNDED_TO_BUS' && state.masterKnifeBreaker === 'CLOSED') {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'DEAD SHORT BUS EXPLOSION',
          incidentReport: 'Operator clamped a solid copper grounding rod straight across a live 440-volt supply. The resulting arc blew the copper rod into molten solder droplets. The room’s fire sprinkler activated.',
          incidentCause: 'Applying physical grounding rod to energized main line.',
          advice: 'Open the Master Knife Breaker before touching grounding gear.',
        };
      }

      // Failure 2: Touching fuse while breaker is closed
      if (actionId === 'fuseSocket' && state.masterKnifeBreaker === 'CLOSED') {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'INDUSTRIAL ELECTROCUTION',
          incidentReport: 'Operator reached both hands into the fuse carriage with the 440V knife switch fully engaged. Path to ground passed directly through cardiac cycle. Heart stopped immediately.',
          incidentCause: 'Attempting electrical service on live high-voltage busbar.',
          advice: 'Always isolate the power source before touching bare metal terminals.',
        };
      }

      // Failure 3: Touching fuse with breaker open, but capacitors not bled
      if (actionId === 'fuseSocket' && state.capCharge > 100) {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'STORED CAPACITOR DISCHARGE',
          incidentReport: 'The breaker was open, so the operator assumed safety. 600 Joules of stored capacitance arced through their right index finger. Finger looks like a burnt sausage.',
          incidentCause: 'Failing to bleed capacitor bank prior to servicing components.',
          advice: 'Breaker kills the feed, but capacitors hold charge. Engage Bleed Resistor first.',
        };
      }

      // Failure 4: Closing breaker with ground rod still attached!
      if (actionId === 'masterKnifeBreaker' && newValue === 'CLOSED' && state.groundHookRod === 'GROUNDED_TO_BUS') {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'POWER-UP INTO DEAD GROUND',
          incidentReport: 'Operator replaced fuse, left the ground clamp attached to the busbar, and threw the 440V knife switch closed. Instant transformer substation trip.',
          incidentCause: 'Closing mains breaker while grounding hook was still clamped to terminals.',
          advice: 'Hang the ground hook back on the wall hook before closing the master breaker.',
        };
      }

      const next = { ...state, [actionId]: newValue };

      // State math:
      if (actionId === 'masterKnifeBreaker') {
        next.voltage = newValue === 'CLOSED' ? 440 : 0;
        if (newValue === 'CLOSED' && next.fuseSocket === 'NEW_FUSE') {
          next.capCharge = 600;
        }
      }

      if (actionId === 'capacitorBleedSwitch' && newValue === 'DISCHARGED') {
        if (next.masterKnifeBreaker === 'OPEN') {
          next.capCharge = 0;
        }
      }

      // Victory condition: Fuse is replaced, ground rod detached, breaker closed, key armed!
      if (
        next.fuseSocket === 'NEW_FUSE' &&
        next.groundHookRod === 'HUNG_ON_WALL' &&
        next.masterKnifeBreaker === 'CLOSED' &&
        next.magnetronKey === 'ARMED'
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
  },

  // LEVEL 04: MISDIRECTION & DECOY SWITCHES
  {
    id: 'level-04',
    levelNumber: 4,
    title: 'THE BAIT',
    subtitle: 'Nitrogen Buffer & Decoy Protocol',
    theme: 'misdirection',
    objective: 'Equilibrate core atmosphere and disengage lockdown without triggering suppression',
    briefing: 'A small tritium leak triggered security lockdown. The console features an enticing, massive red "EMERGENCY OVERRIDE" button installed by nervous accountants. A brass inspection plaque near the floor outlines the real mechanical protocol.',
    warningNote: 'RELY ON MECHANICAL CALIBRATION, NOT SHINY RED BUTTONS.',
    solutionHint: 'Never touch the red override button! First seal the exhaust damper, start the nitrogen flood to purge tritium, drop the lead radiation shutter, then unlock the bypass key.',
    solutionSteps: [
      'Set Damper 02 (Exhaust Damper) to HERMETICALLY SEALED.',
      'Turn Valve 01 (Nitrogen Flood) to PURGE (99.8% N2) to drop tritium to 0 PPM.',
      'Drop Shutter 03 (Lead Shutter) to DROPPED (SHIELDED).',
      'Turn Key 04 (Lockdown Bypass) to EXIT UNLOCKED.',
      '(Warning: Pressing the red mushroom plunger releases suffocating Halon!)'
    ],
    technicianNotes: {
      diagnostic: 'Sensors detect 140 PPM airborne tritium. Halon 1301 fire suppression system is charged at 2200 PSI on high-pressure manifold.',
      operationalAdvice: 'Do not yield to impulsive panic buttons; the red mushroom actuator triggers Halon total flooding. Chemical displacement requires sealing exhaust dampers prior to inert nitrogen flood.',
      verificationCheck: 'Confirm exhaust damper is sealed before flooding N2. Tritium concentration must read below 5 PPM and radiation shutter dropped before turning key.'
    },
    maxMoves: 6,
    parMoves: 4,
    initialState: {
      emergencyOverrideBtn: 'UNPRESSED', // 'UNPRESSED' | 'PRESSED'
      nitrogenValve: 'CLOSED', // 'CLOSED' | 'PURGING'
      vacuumIsolationFlap: 'OPEN', // 'OPEN' | 'SEALED'
      radiationShutter: 'UP', // 'UP' | 'LOWERED'
      interlockRotary: 'ENGAGED', // 'ENGAGED' | 'DISENGAGED'
      halonPressure: 2200,
      tritiumPPM: 140,
    },
    objects: [
      {
        id: 'emergencyOverrideBtn',
        name: 'EMERGENCY OVERRIDE (DO NOT TOUCH)',
        type: 'plunger',
        label: 'BIG RED PUSH BUTTON — OVERRIDE',
        state: 'UNPRESSED',
        options: [
          { value: 'UNPRESSED', label: 'READY' },
          { value: 'PRESSED', label: 'SLOCKED DOWN' },
        ],
        hint: 'Large tempting red dome button with yellow hazard stripes. Looks very decisive.',
        dangerous: true,
      },
      {
        id: 'nitrogenValve',
        name: 'Inert Nitrogen Flood Valve',
        type: 'dial',
        label: 'VALVE 01 — NITROGEN FLOOD',
        state: 'CLOSED',
        options: [
          { value: 'CLOSED', label: 'ISOLATED' },
          { value: 'PURGING', label: 'PURGE (99.8% N2)' },
        ],
        hint: 'Injects inert nitrogen to displace volatile tritium gas.',
      },
      {
        id: 'vacuumIsolationFlap',
        name: 'Exhaust Ventilation Damper',
        type: 'toggle',
        label: 'DAMPER 02 — EXHAUST DAMPER',
        state: 'OPEN',
        options: [
          { value: 'OPEN', label: 'ATMOSPHERE OPEN' },
          { value: 'SEALED', label: 'HERMETICALLY SEALED' },
        ],
        hint: 'Closes ventilation ducts so the nitrogen purge actually works.',
      },
      {
        id: 'radiationShutter',
        name: 'Lead-Glass Core Shutter',
        type: 'lever',
        label: 'SHUTTER 03 — LEAD SHUTTER',
        state: 'UP',
        options: [
          { value: 'UP', label: 'EXPOSED (UP)' },
          { value: 'LOWERED', label: 'DROPPED (SHIELDED)' },
        ],
        hint: 'Heavy 2-inch lead counterweight shutter over observation window.',
      },
      {
        id: 'interlockRotary',
        name: 'Emergency Exit Bypass Key',
        type: 'key',
        label: 'KEY 04 — LOCKDOWN BYPASS',
        state: 'ENGAGED',
        options: [
          { value: 'ENGAGED', label: 'LOCKDOWN ACTIVE' },
          { value: 'DISENGAGED', label: 'EXIT UNLOCKED' },
        ],
        hint: 'Mechanical keylock release.',
      },
    ],
    gauges: (state) => [
      {
        id: 'tritiumPPM',
        label: 'TRITIUM AIR CONTAMINATION',
        unit: 'PPM',
        min: 0,
        max: 200,
        value: state.tritiumPPM,
        dangerHigh: 30,
        optimalMin: 0,
        optimalMax: 5,
      },
      {
        id: 'halonPressure',
        label: 'HALON SUPPRESSION BANK',
        unit: 'PSI',
        min: 0,
        max: 2500,
        value: state.halonPressure,
        dangerLow: 500,
        optimalMin: 1800,
        optimalMax: 2400,
      },
    ],
    statusMessage: (state, movesUsed) => {
      if (state.interlockRotary === 'DISENGAGED' && state.tritiumPPM <= 5) {
        return 'CORE SHIELDED. CONTAMINATION ZEROED. EXIT GRANTED.';
      }
      if (state.nitrogenValve === 'PURGING' && state.vacuumIsolationFlap === 'OPEN') {
        return 'WARNING: NITROGEN ESCAPING THROUGH OPEN EXHAUST DAMPER!';
      }
      if (state.tritiumPPM > 50) {
        return 'TRITIUM DETECTED. SEAL VENTILATION AND PURGE INERT GAS.';
      }
      return 'ATMOSPHERE INERT. LOWER LEAD SHUTTER TO DEACTIVATE LOCKDOWN.';
    },
    evaluate: (state, actionId, newValue, movesUsed) => {
      // The Bait: Pressing the Emergency Override button
      if (actionId === 'emergencyOverrideBtn' && newValue === 'PRESSED') {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'TOTAL HALON SUFFOCATION DEPLOYMENT',
          incidentReport: 'You couldn’t resist pushing the giant red button with hazard stripes. It was wired directly to the ceiling-mounted Halon 1301 fire suppression system. 2,000 lbs of Halon displaced all oxygen in 1.4 seconds. You suffocated in 8 seconds.',
          incidentCause: 'Yielding to impulsive urge to press an unverified red emergency override button.',
          advice: 'Read the equipment plates. The red button is a panic trap. Work the actual mechanical valves.',
        };
      }

      // Failure: Disengaging lockdown key while tritium is still high
      if (actionId === 'interlockRotary' && newValue === 'DISENGAGED' && state.tritiumPPM > 10) {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'TOXIC ATMOSPHERE EXPOSURE',
          incidentReport: 'Opened the exit while the chamber air contained 140 PPM airborne tritium. You inhaled a lethal radiological dose. The plant doctor wrote you a very short prescription.',
          incidentCause: 'Opening exit before completing nitrogen inert gas purge.',
          advice: 'Drop tritium contamination below 5 PPM before turning the exit bypass key.',
        };
      }

      // Safe state updates:
      const next = { ...state, [actionId]: newValue };

      // Purge only reduces tritium if exhaust damper is sealed!
      if (next.vacuumIsolationFlap === 'SEALED' && next.nitrogenValve === 'PURGING') {
        next.tritiumPPM = 0;
      } else if (next.nitrogenValve === 'PURGING' && next.vacuumIsolationFlap === 'OPEN') {
        next.tritiumPPM = 120; // Escaping!
      }

      // Victory check: Damper sealed, purged with N2, lead shutter lowered, key disengaged
      if (
        next.vacuumIsolationFlap === 'SEALED' &&
        next.nitrogenValve === 'PURGING' &&
        next.radiationShutter === 'LOWERED' &&
        next.interlockRotary === 'DISENGAGED'
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
  },

  // LEVEL 05: DELAYED CONSEQUENCE & REACTION CASCADE
  {
    id: 'level-05',
    levelNumber: 5,
    title: 'THE CASCADE',
    subtitle: 'Catalytic Synthesis Cascade Control',
    theme: 'delayed-consequence',
    objective: 'Complete 3 reaction cycles without triggering thermal runaway',
    briefing: 'A chemical cracking manifold requires heating, agitation, and precise stoichiometric feed. Actions alter temperature and viscosity on delayed cycles. Unstirred reactant will hot-spot and detonate. Overheating causes irreversible polymer gelatinization.',
    warningNote: 'ACTIONS TAKE EFFECT ACROSS SUCCESSIVE CYCLES. PLAN AHEAD.',
    solutionHint: 'Always spin the impeller stirrer before applying heat. Set heater to Stage 1 (never Stage 2), introduce metered feed (10 L/min), allow reaction to advance, then harvest.',
    solutionSteps: [
      'Switch Motor 01 (Impeller Stirrer) to ACTIVE (600 RPM VORTEX).',
      'Set Heater 02 (Thermal Jacket) to STAGE 1 (5 kW / 120°C).',
      'Set Feed 03 (Reagent Injector) to METERED (10 L/MIN).',
      'Allow reaction to progress through Stage 2+ at safe temperature (100°C–160°C).',
      'Open Drain 05 (Bulkhead Drain) to HARVEST DISCHARGE.'
    ],
    technicianNotes: {
      diagnostic: 'Reaction autoclave rests at ambient 25°C. Fluid precursor is static and viscous (100 cP) with zero mechanical agitation.',
      operationalAdvice: 'Heating static catalytic fluids causes localized boundary-layer boiling and sudden detonation. Initiate vortex impeller circulation before applying heat, and avoid runaway Stage 2 heater power.',
      verificationCheck: 'Reaction temperature must stabilize between 110°C and 140°C with reaction stages advancing before attempting harvest drain.'
    },
    maxMoves: 8,
    parMoves: 6,
    initialState: {
      agitatorStirrer: 'STOPPED', // 'STOPPED' | 'SPINNING'
      heaterElement: 'OFF', // 'OFF' | 'STAGE_1' | 'STAGE_2'
      reagentFeed: '0_L_MIN', // '0_L_MIN' | '10_L_MIN' | '20_L_MIN'
      quenchPlunger: 'READY', // 'READY' | 'DISCHARGED'
      harvestValve: 'CLOSED', // 'CLOSED' | 'OPEN'
      reactorTemp: 25,
      fluidViscosity: 100, // cP
      reactionStage: 0,
    },
    objects: [
      {
        id: 'agitatorStirrer',
        name: 'Vessel Impeller Agitator',
        type: 'toggle',
        label: 'MOTOR 01 — IMPELLER STIRRER',
        state: 'STOPPED',
        options: [
          { value: 'STOPPED', label: 'OFF (STATIC LIQUID)' },
          { value: 'SPINNING', label: 'ACTIVE (600 RPM VORTEX)' },
        ],
        hint: 'Prevents localized boundary-layer boiling and hotspots.',
      },
      {
        id: 'heaterElement',
        name: 'Nichrome Heating Element',
        type: 'dial',
        label: 'HEATER 02 — THERMAL JACKET',
        state: 'OFF',
        options: [
          { value: 'OFF', label: '0 kW (AMBIENT)' },
          { value: 'STAGE_1', label: '5 kW (OPTIMAL 120°C)' },
          { value: 'STAGE_2', label: '15 kW (DANGEROUS 250°C)' },
        ],
        hint: 'Supplies heat for endothermic catalytic conversion.',
      },
      {
        id: 'reagentFeed',
        name: 'Precursor Feed Manifold',
        type: 'lever',
        label: 'FEED 03 — REAGENT INJECTOR',
        state: '0_L_MIN',
        options: [
          { value: '0_L_MIN', label: 'SHUT (0 L/MIN)' },
          { value: '10_L_MIN', label: 'METERED (10 L/MIN)' },
          { value: '20_L_MIN', label: 'FLOOD (20 L/MIN)' },
        ],
        hint: 'Adds chemical reactant. Reaction releases additional heat.',
      },
      {
        id: 'quenchPlunger',
        name: 'Emergency Cryo-Quench Plunger',
        type: 'plunger',
        label: 'PLUNGER 04 — LIQUID NITROGEN QUENCH',
        state: 'READY',
        options: [
          { value: 'READY', label: 'PRIMED' },
          { value: 'DISCHARGED', label: 'INJECTED' },
        ],
        hint: 'Immediately drops reactor temperature by 80°C in an emergency.',
      },
      {
        id: 'harvestValve',
        name: 'Purified Product Harvest Valve',
        type: 'breaker',
        label: 'DRAIN 05 — BULKHEAD DRAIN',
        state: 'CLOSED',
        options: [
          { value: 'CLOSED', label: 'SEALED' },
          { value: 'OPEN', label: 'HARVEST DISCHARGE' },
        ],
        hint: 'Releases converted reactant to unlock the next chamber gate.',
      },
    ],
    gauges: (state) => [
      {
        id: 'reactorTemp',
        label: 'CORE REACTOR TEMPERATURE',
        unit: '°C',
        min: 0,
        max: 300,
        value: state.reactorTemp,
        dangerLow: 20,
        dangerHigh: 210,
        optimalMin: 110,
        optimalMax: 140,
      },
      {
        id: 'fluidViscosity',
        label: 'MIXTURE VISCOSITY',
        unit: 'cP',
        min: 0,
        max: 500,
        value: state.fluidViscosity,
        dangerHigh: 380,
        optimalMin: 40,
        optimalMax: 90,
      },
    ],
    statusMessage: (state, movesUsed) => {
      if (state.harvestValve === 'OPEN' && state.reactionStage >= 3) {
        return 'REACTION FULLY CONVERTED. PRODUCT DISCHARGED. ACCESS GRANTED.';
      }
      if (state.reactorTemp > 180) {
        return 'CRITICAL THERMAL ALERT! REACTOR HEADING FOR EXOTHERMIC DETONATION.';
      }
      if (state.reagentFeed !== '0_L_MIN' && state.agitatorStirrer === 'STOPPED') {
        return 'WARNING: STATIC REACTANT DETECTED. HOTSPOT FORMATION IMMINENT.';
      }
      if (state.reactorTemp >= 110 && state.reactorTemp <= 140) {
        return `OPTIMAL SYNTHESIS WINDOW ACTIVE. STAGE ${state.reactionStage}/3.`;
      }
      return 'WARM REACTOR JACKET AND ENGAGE STIRRER BEFORE INTRODUCING FEED.';
    },
    evaluate: (state, actionId, newValue, movesUsed) => {
      // Failure 1: Heating with reagent present while stirrer is STOPPED
      if (
        (actionId === 'heaterElement' && newValue !== 'OFF' && state.reagentFeed !== '0_L_MIN' && state.agitatorStirrer === 'STOPPED') ||
        (actionId === 'reagentFeed' && newValue !== '0_L_MIN' && state.heaterElement !== 'OFF' && state.agitatorStirrer === 'STOPPED')
      ) {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'LOCALIZED THERMAL DETONATION',
          incidentReport: 'You heated viscous reactant without the motorized stirrer running. The liquid resting against the heating coil flash-vaporized into high-pressure gas pockets and blew the glass reactor dome through the ceiling.',
          incidentCause: 'Heating un-agitated catalytic fluid.',
          advice: 'Turn on the Impeller Stirrer before applying heat or introducing reagent.',
        };
      }

      // Failure 2: Dumping Quench when temperature is already cold
      if (actionId === 'quenchPlunger' && newValue === 'DISCHARGED' && state.reactorTemp < 90) {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'CRYOGENIC FREEZE BRICKING',
          incidentReport: 'You triggered liquid nitrogen quench while the reactor was only 25°C. The reagent turned into solid crystalline rock, shattering the internal impellers and cementing the autoclave forever.',
          incidentCause: 'Discharging cryogenic quench on an already cold vessel.',
          advice: 'Quench is only for high-temperature emergencies (above 180°C). Don’t freeze room-temperature fluids.',
        };
      }

      // Failure 3: Setting heater to STAGE_2 and feed to 20
      if (actionId === 'heaterElement' && newValue === 'STAGE_2') {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'EXOTHERMIC THERMAL RUNAWAY',
          incidentReport: '15 kW of heat triggered runaway polymerization. Viscosity spiked to 500 cP and temperature hit 280°C. Safety discs blew and coated the control room in hot green goo.',
          incidentCause: 'Applying Stage 2 over-heating to an exothermic mixture.',
          advice: 'Use Stage 1 heating (5 kW). Stage 2 is far too hot for this compound.',
        };
      }

      // Failure 4: Opening harvest valve before reaction reaches Stage 3
      if (actionId === 'harvestValve' && newValue === 'OPEN' && state.reactionStage < 2) {
        return {
          isFailure: true,
          isVictory: false,
          incidentTitle: 'UNREACTED ACIDIC SLUDGE SPILL',
          incidentReport: 'Opened the harvest valve while the mixture was still raw, unreacted chemical precursor. Highly acidic sludge dissolved the stainless steel collection vat and ate through the floor.',
          incidentCause: 'Draining vessel before catalytic conversion was complete.',
          advice: 'Wait until the reaction stage counter increments to 3 before opening harvest valve.',
        };
      }

      const next = { ...state, [actionId]: newValue };

      // Compute temperature & viscosity progression
      let temp = 25;
      let visc = 100;
      let stage = next.reactionStage || 0;

      if (next.heaterElement === 'STAGE_1') {
        temp = 125;
      }
      if (next.reagentFeed === '10_L_MIN') {
        temp += 10; // Exothermic bump to 135
        visc = 65;
        if (next.agitatorStirrer === 'SPINNING') {
          stage = Math.min(3, stage + 1);
        }
      }
      if (next.quenchPlunger === 'DISCHARGED') {
        temp = Math.max(20, temp - 80);
      }

      next.reactorTemp = temp;
      next.fluidViscosity = visc;
      next.reactionStage = stage;

      // Victory:
      if (next.harvestValve === 'OPEN' && stage >= 2 && temp >= 100 && temp <= 160) {
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
  },
];

export const LEVELS: LevelDefinition[] = [...CORE_LEVELS, ...generateExtendedLevels()];

