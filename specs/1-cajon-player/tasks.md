# Tasks: Browser Cajon Player

**Input**: Design documents from `/specs/1-cajon-player/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL and not included in this feature specification. Focus on manual testing per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure (src/js/, src/css/, src/assets/images/, src/assets/sounds/)
- [ ] T002 Create index.html entry point with basic HTML structure and script references
- [ ] T003 [P] Convert sound files from .mov to .mp3 format and copy to src/assets/sounds/
- [ ] T004 [P] Create cajon.png image with trigger zones marked (or obtain existing image)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Implement AudioManager class in src/js/audio-manager.js (preloadAll, playSound, isSoundLoaded, getLoadingProgress methods)
- [ ] T006 [P] Implement TriggerZoneManager class in src/js/trigger-zones.js (initialize, getZoneById, getZoneByElement, getZoneByKey, getAllZones, activateZone methods)
- [ ] T007 [P] Create base CSS styles in src/css/styles.css (container, cajon image, trigger zone base styles)
- [ ] T008 Create zone configuration data structure with all sound zones, coordinates, and keyboard mappings
- [ ] T009 Implement App class initialization structure in src/js/app.js (constructor, basic init method)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Play Sounds via Visual Interface (Priority: P1) 🎯 MVP

**Goal**: Users can interact with a visual representation of a cajon drum by clicking or tapping on grey trigger zones to play corresponding sounds.

**Independent Test**: Load the application in a browser, visually identify trigger zones, and click/tap each zone to verify the correct sound plays immediately. This delivers immediate value as users can play the cajon instrument.

### Implementation for User Story 1

- [ ] T010 [US1] Complete TriggerZoneManager.initialize() to create DOM elements for all trigger zones in src/js/trigger-zones.js
- [ ] T011 [US1] Implement trigger zone coordinate positioning and styling in src/css/styles.css (grey zones, positioning)
- [ ] T012 [US1] Implement InputHandler class for mouse click events in src/js/input-handler.js (click event handling on trigger zones)
- [ ] T013 [US1] Implement InputHandler class for touch events in src/js/input-handler.js (touchstart event handling with preventDefault)
- [ ] T014 [US1] Integrate InputHandler with TriggerZoneManager and AudioManager in src/js/input-handler.js (coordinate click/tap → zone → sound playback)
- [ ] T015 [US1] Implement visual feedback CSS transitions in src/css/styles.css (active state styling for trigger zones)
- [ ] T016 [US1] Implement visual feedback JavaScript in src/js/trigger-zones.js (activateZone method with CSS class toggling)
- [ ] T017 [US1] Complete App.init() to initialize TriggerZoneManager and InputHandler in src/js/app.js
- [ ] T018 [US1] Add loading indicator UI in index.html and src/css/styles.css (show during audio preloading)
- [ ] T019 [US1] Integrate AudioManager preloading with App initialization in src/js/app.js (preload sounds, show/hide loading indicator)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can click/tap trigger zones to play sounds with visual feedback

---

## Phase 4: User Story 2 - Play Sounds via Keyboard (Priority: P2)

**Goal**: Users can play cajon sounds using keyboard keys as an alternative input method. Each sound has an assigned keyboard key that triggers playback when pressed.

**Independent Test**: Load the application, press assigned keyboard keys, and verify the correct sounds play immediately. This delivers value by providing an alternative interaction method that may be faster or more accessible for some users.

### Implementation for User Story 2

- [ ] T020 [US2] Implement keyboard event handling in src/js/input-handler.js (keydown event listener)
- [ ] T021 [US2] Implement focus detection in src/js/input-handler.js (window focus/blur event tracking)
- [ ] T022 [US2] Integrate keyboard key mapping with TriggerZoneManager.getZoneByKey() in src/js/input-handler.js
- [ ] T023 [US2] Add keyboard key visual feedback using TriggerZoneManager.activateZone() in src/js/input-handler.js
- [ ] T024 [US2] Add keyboard hint UI element in index.html (display keyboard key assignments)
- [ ] T025 [US2] Style keyboard hint in src/css/styles.css (positioning and visibility)
- [ ] T026 [US2] Ensure keyboard input only works when app has focus (check focus state before processing keys)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can play sounds via visual interface AND keyboard input

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T027 [P] Implement error handling for audio loading failures in src/js/audio-manager.js (catch errors, log, allow partial functionality)
- [ ] T028 [P] Implement error handling for audio playback failures in src/js/audio-manager.js (try-catch around play(), handle promise rejections)
- [ ] T029 [P] Add error UI feedback in index.html and src/css/styles.css (show errors to user gracefully)
- [ ] T030 [P] Optimize audio pool management in src/js/audio-manager.js (ensure overlapping sounds work correctly)
- [ ] T031 [P] Add responsive design CSS in src/css/styles.css (mobile-friendly layout, touch-friendly zones)
- [ ] T032 [P] Performance optimization: verify ≤100ms trigger latency in src/js/audio-manager.js and src/js/input-handler.js
- [ ] T033 [P] Performance optimization: verify ≤3 second load time in src/js/audio-manager.js (preloading strategy)
- [ ] T034 [P] Cross-browser testing and compatibility fixes (test in Chrome, Firefox, Safari, Edge)
- [ ] T035 [P] Code cleanup and refactoring (ensure consistent code style, remove debug code)
- [ ] T036 Run quickstart.md validation (verify all setup steps work, test all acceptance scenarios)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Foundational
  - User Story 2 (P2) can start after Foundational (can work in parallel with US1 if staffed)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses same AudioManager and TriggerZoneManager as US1, but independently testable

### Within Each User Story

- Core modules (AudioManager, TriggerZoneManager) before InputHandler
- InputHandler before App integration
- Visual feedback before keyboard input (US1 before US2 for clarity, but not required)
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004)
- All Foundational tasks marked [P] can run in parallel (T005, T006, T007)
- Once Foundational phase completes, User Stories 1 and 2 can start in parallel (if team capacity allows)
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational modules in parallel:
Task: "Implement AudioManager class in src/js/audio-manager.js"
Task: "Implement TriggerZoneManager class in src/js/trigger-zones.js"
Task: "Create base CSS styles in src/css/styles.css"

# Launch US1 implementation tasks that don't depend on each other:
Task: "Complete TriggerZoneManager.initialize() to create DOM elements"
Task: "Implement trigger zone coordinate positioning and styling"
Task: "Add loading indicator UI in index.html and src/css/styles.css"
```

---

## Parallel Example: User Story 2

```bash
# US2 tasks that can run in parallel with each other:
Task: "Add keyboard hint UI element in index.html"
Task: "Style keyboard hint in src/css/styles.css"
Task: "Implement keyboard event handling in src/js/input-handler.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T010-T019)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Load app in browser
   - Click/tap trigger zones
   - Verify sounds play immediately
   - Verify visual feedback works
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add Polish → Test all features → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (visual interface)
   - Developer B: User Story 2 (keyboard input) - can start in parallel
3. Stories complete and integrate independently
4. Team works on Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing per quickstart.md acceptance scenarios
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Sound files: Convert .mov files from `sounds/` directory to .mp3 format (use ffmpeg or similar tool)
- Audio pool: Create 3-5 Audio instances per sound for overlapping playback
- Visual feedback: Use CSS transitions (50-100ms duration) for immediate response
- Focus detection: Track window focus/blur events for keyboard input
- Error handling: Graceful degradation - log errors but don't break UI

