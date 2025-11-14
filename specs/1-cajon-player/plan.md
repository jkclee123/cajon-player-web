# Implementation Plan: Browser Cajon Player

**Branch**: `1-cajon-player` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-cajon-player/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a browser-based single-page web application that allows users to play cajon drum sounds through visual trigger zones (click/tap) and keyboard input. The application displays a cajon image with interactive grey trigger zones, supports overlapping sound playback, and provides immediate visual feedback. Technical approach: HTML5 Audio API with pre-loaded sound files, vanilla JavaScript for event handling, CSS for styling and visual feedback, responsive design for desktop and mobile.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  
**Primary Dependencies**: None (vanilla web APIs: HTML5 Audio API, DOM API, Touch Events API)  
**Storage**: N/A (no data persistence required)  
**Testing**: Manual testing (browser-based), performance benchmarking  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)  
**Project Type**: web (frontend-only single-page application)  
**Performance Goals**: 
- Sound trigger latency: ≤ 100ms from user interaction
- Application load to interactive: ≤ 3 seconds (standard broadband)
- Rapid input handling: ≥ 5 actions/second without degradation
- Sound trigger success rate: ≥ 95%

**Constraints**: 
- Must work offline once loaded (static assets bundled)
- Must support overlapping sound playback
- Must work on both desktop and mobile devices
- Must handle audio playback failures gracefully
- Browser must support HTML5 Audio API

**Scale/Scope**: 
- Single-page application
- ~10-15 sound files (pre-existing in `sound/` directory)
- 1 main interface component (cajon with trigger zones)
- No user accounts or data persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User Experience First
✅ **PASS**: Application prioritizes immediate response (≤100ms latency), clear visual feedback, and intuitive interface. All success criteria align with UX-first principles.

### II. Cross-Browser Compatibility  
✅ **PASS**: Target is 90% of modern browsers (Chrome, Firefox, Safari, Edge). HTML5 Audio API has broad support. Graceful degradation planned for unsupported features.

### III. Performance Standards (NON-NEGOTIABLE)
✅ **PASS**: 
- Audio playback trigger: ≤ 100ms (specified in SC-001)
- Load to interactive: ≤ 3 seconds (specified in SC-002)
- Rapid input: ≥ 5 actions/second (specified in SC-004)
- Sound success rate: ≥ 95% (specified in SC-003)

### IV. Progressive Enhancement
✅ **PASS**: Core functionality uses basic HTML5 Audio API. Works offline once loaded. No advanced features that require graceful degradation.

### V. Simplicity
✅ **PASS**: Vanilla JavaScript approach, no frameworks, single-page application, no backend. Follows YAGNI principles - only implements what's needed for the feature.

**Gate Status (Pre-Research)**: ✅ **ALL GATES PASSED** - Proceed to Phase 0

### Post-Design Constitution Check

*Re-evaluated after Phase 1 design completion*

#### I. User Experience First
✅ **PASS**: Design implements pre-loaded audio pools for ≤100ms latency, CSS transitions for immediate visual feedback, and clear module separation for maintainable UX code. All performance targets are achievable with chosen architecture.

#### II. Cross-Browser Compatibility  
✅ **PASS**: HTML5 Audio API, DOM API, and Touch Events API are well-supported across target browsers. Error handling contracts ensure graceful degradation. Module interfaces abstract browser differences.

#### III. Performance Standards (NON-NEGOTIABLE)
✅ **PASS**: 
- Audio preloading strategy ensures ≤3 second load time
- Audio pool architecture supports ≤100ms trigger latency
- Event handling design supports ≥5 actions/second
- Error handling maintains ≥95% success rate

#### IV. Progressive Enhancement
✅ **PASS**: Core functionality uses standard web APIs. Works offline once loaded. Error handling provides graceful degradation paths. No advanced features that break in basic browsers.

#### V. Simplicity
✅ **PASS**: Vanilla JavaScript modules, no frameworks, clear separation of concerns. Four focused modules (audio-manager, trigger-zones, input-handler, app) with well-defined interfaces. No unnecessary complexity.

**Gate Status (Post-Design)**: ✅ **ALL GATES PASSED** - Design is constitution-compliant

## Project Structure

### Documentation (this feature)

```text
specs/1-cajon-player/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
index.html              # Main HTML entry point
src/
├── js/
│   ├── audio-manager.js    # Handles audio loading, playback, and preloading
│   ├── trigger-zones.js    # Manages trigger zone definitions and mappings
│   ├── input-handler.js    # Handles mouse, touch, and keyboard events
│   └── app.js              # Main application initialization and coordination
├── css/
│   └── styles.css          # Styling for cajon interface and trigger zones
└── assets/
    ├── images/
    │   └── cajon.png       # Cajon image with trigger zones marked
    └── sounds/            # Sound files (copied from backup/ directory as .mp3)
        ├── cajon-off-kick-4.mp3
        ├── cajon-off-kick-damp-3.mp3
        ├── cajon-off-kick-damp-4.mp3
        ├── cajon-off-snare-1.mp3
        ├── cajon-off-snare-2.mp3
        ├── cajon-off-snare-roll-fast-2.mp3
        ├── cajon-off-snare-roll-slow-3.mp3
        ├── cajon-off-snare-roll-slow-4.mp3
        ├── cajon-on-kick-damp-3.mp3
        ├── cajon-on-kick-damp-4.mp3
        ├── cajon-on-snare-2.mp3
        ├── cajon-on-snare-3.mp3
        ├── cajon-on-snare-4.mp3
        └── cajon-on-snare-roll-5.mp3
```

**Structure Decision**: Single-page web application structure. All code in `src/` directory with clear separation: JavaScript modules for audio, trigger zones, input handling, and app coordination; CSS for styling; assets directory for images and sounds. No build step required initially (can add later if needed).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution gates passed.

## Phase Completion Status

### Phase 0: Outline & Research ✅ COMPLETE

**Completed**: 2024-12-19

**Outputs**:
- ✅ `research.md` - All technical decisions documented
  - Sound file format: `.mp3` (from `backup/` directory)
  - Audio API: HTML5 Audio API with pre-loaded pools
  - Touch handling: `touchstart` events with `preventDefault()`
  - Visual feedback: CSS transitions with JavaScript class toggling
  - Preloading: Parallel loading with `canplaythrough` tracking
  - Keyboard input: `keydown` events with focus detection
  - Error handling: Try-catch and graceful degradation

**All NEEDS CLARIFICATION items resolved**: ✅

### Phase 1: Design & Contracts ✅ COMPLETE

**Completed**: 2024-12-19

**Outputs**:
- ✅ `data-model.md` - Entity definitions (SoundZone, SoundFile, ApplicationState)
- ✅ `contracts/module-interfaces.md` - JavaScript module interface contracts
- ✅ `quickstart.md` - Setup and usage guide
- ✅ Agent context updated (`.cursor/rules/specify-rules.mdc`)

**Constitution Check Post-Design**: ✅ All gates passed

### Phase 2: Task Planning

**Status**: ⏳ Pending (to be completed by `/speckit.tasks` command)

**Next Steps**: Run `/speckit.tasks` command to generate implementation tasks.

