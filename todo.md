# Basketball Leg & Hip Training - TODO

## Phase 1: Project Setup & Branding
- [x] Generate custom app logo (basketball + leg/hip training theme)
- [x] Update app branding in app.config.ts
- [x] Update theme colors to basketball orange primary

## Phase 2: Data Models & Storage
- [x] Define TypeScript types for Session and ExerciseLog
- [x] Create AsyncStorage utility functions (save/load sessions)
- [x] Define exercise sequence array with all 19 exercises
- [x] Implement weight conversion utility (kg ↔ lb)

## Phase 3: Home Screen
- [x] Create Home screen layout with session info card
- [x] Display current/next session number
- [x] Show "Start Workout" button for new sessions
- [x] Show "Continue Workout" button for incomplete sessions
- [x] Display quick stats (total sessions, last workout date)

## Phase 4: Active Workout Screen
- [x] Create ActiveWorkout screen with exercise display
- [x] Implement progress bar showing current position in workout
- [x] Build exercise card component with instructions
- [x] Add timer component for jogging and stretches
- [x] Create weight input component with dual kg/lb fields
- [x] Implement real-time weight conversion between kg and lb
- [x] Add box jump height input (inches) for final exercise
- [x] Create "Mark Complete" button with haptic feedback
- [x] Implement auto-advance to next exercise
- [x] Add workout completion screen with summary

## Phase 5: History Screen
- [x] Create History tab with FlatList of past sessions
- [x] Design session card component (date, time, session #)
- [x] Implement tap to view detailed session log
- [x] Show all exercises and weights used in session detail view

## Phase 6: Stats Screen
- [x] Create Stats tab with exercise selector
- [x] Implement bar graph component for weight progression
- [x] Display PR (Personal Record) for each exercise
- [x] Show trend indicators for progress
- [x] Add box jump progression graph (inches)
- [x] Calculate and display max weight per session

## Phase 7: Profile/Settings Screen
- [x] Create Profile/Settings tab
- [x] Add weight unit preference toggle (kg/lb default)
- [x] Store preference in AsyncStorage
- [x] Add app info and version display

## Phase 8: Tab Navigation
- [x] Update tab bar with 4 tabs: Home, History, Stats, Profile
- [x] Add appropriate icons for each tab
- [x] Update icon mappings in icon-symbol.tsx

## Phase 9: Testing & Polish
- [x] Test complete workout flow end-to-end
- [x] Test weight conversion accuracy
- [x] Test data persistence across app restarts
- [x] Verify bar graphs display correctly
- [x] Test PR calculation logic
- [x] Add loading states where needed
- [x] Ensure all haptic feedback works
- [x] Test on both light and dark modes

## Phase 10: Final Delivery
- [x] Create checkpoint for deployment
- [x] Generate QR code for testing
- [x] Provide user with project files and instructions

## Phase 11: Custom Exercises Feature
- [x] Extend data types to support custom exercises
- [x] Create custom exercise storage in AsyncStorage
- [x] Build custom exercises management screen
- [x] Add "Add Custom Exercise" modal/form
- [x] Implement edit custom exercise functionality
- [x] Implement delete custom exercise functionality
- [x] Allow users to insert custom exercises into workout
- [x] Update active workout to support custom exercises
- [x] Test custom exercise creation and tracking

## Phase 12: Bug Fixes
- [x] Fix React hooks rendering error in active workout screen
