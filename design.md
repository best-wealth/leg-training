# Basketball Leg & Hip Training - Mobile App Design

## Design Philosophy
This app follows **Apple Human Interface Guidelines (HIG)** with a focus on **one-handed usage** and **mobile portrait orientation (9:16)**. The design prioritizes clarity, simplicity, and efficiency for basketball players tracking their resistance training sessions.

## Color Scheme
- **Primary Color**: Deep basketball orange (#FF6B35) - for CTAs and active states
- **Background**: Clean white (#FFFFFF) in light mode, dark charcoal (#151718) in dark mode
- **Surface**: Light gray (#F5F5F5) for cards in light mode, darker gray (#1E2022) in dark mode
- **Success**: Green (#22C55E) for completed exercises and PRs
- **Text**: High contrast for readability

## Screen List

### 1. Home Screen (Main Workout View)
**Primary Content:**
- Current workout session card showing session number and date
- Sequential exercise list with progress indicators
- Large "Start Workout" or "Continue Workout" button
- Quick stats: Total sessions completed, current streak

**Functionality:**
- Start new workout session
- Resume incomplete session
- View current exercise in sequence
- Navigate to history/stats

**Layout:**
- Top: Session info card
- Middle: Exercise checklist with expandable details
- Bottom: Primary action button (Start/Continue)
- Tab bar: Home, History, Stats, Profile

### 2. Active Workout Screen
**Primary Content:**
- Current exercise name and instructions (large, clear text)
- Rep counter or timer (for jogging/stretches)
- Weight input fields (kg/lb with auto-conversion)
- "Mark Complete" button
- Progress bar showing position in workout sequence

**Functionality:**
- Display current exercise with instructions
- Input weight for strength exercises
- Input box jump height in inches
- Auto-convert between kg/lb
- Mark exercise complete and advance to next
- Pause/end workout early

**Layout:**
- Top: Progress bar (e.g., "5 of 25 exercises")
- Middle: Exercise card with large title, instructions, input fields
- Bottom: "Mark Complete" button (full-width, prominent)

### 3. History Screen
**Primary Content:**
- Scrollable list of past workout sessions
- Each session card shows: date, time, session number, completion status
- Tap to view detailed session log

**Functionality:**
- View all completed sessions
- Filter by date range
- Tap session to see detailed exercise log with weights used

**Layout:**
- Top: Filter/sort options
- Middle: FlatList of session cards
- Each card: Date, session #, completion badge

### 4. Stats Screen
**Primary Content:**
- Exercise selector dropdown
- Bar graph showing weight progression over sessions
- PR (Personal Record) badge with highest weight
- Trend indicators (up/down arrows)

**Functionality:**
- Select exercise to view stats
- Display bar graph of max weight per session
- Show PR for each exercise
- Show box jump progression in inches

**Layout:**
- Top: Exercise selector (dropdown or tabs)
- Middle: Bar graph (scrollable horizontally if many sessions)
- Bottom: PR card with large number and date achieved

### 5. Profile/Settings Screen
**Primary Content:**
- User preferences: default weight unit (kg/lb)
- App info and version
- Optional: user name, profile picture

**Functionality:**
- Set default weight unit
- View app information
- Reset data (with confirmation)

**Layout:**
- Simple list of settings options
- Toggle for kg/lb preference

## Key User Flows

### Flow 1: Start New Workout
1. User opens app → Home screen
2. Taps "Start Workout" button
3. App creates new session with timestamp
4. Navigates to Active Workout screen
5. Shows first exercise (20 min jogging with timer)
6. User marks complete → advances to next exercise
7. For strength exercises: user inputs weight → marks complete
8. Continues through all 25+ exercises
9. Final exercise complete → success screen with session summary
10. Returns to Home screen

### Flow 2: Input Weight with Auto-Conversion
1. User on Active Workout screen (e.g., Seated Leg Curls)
2. Sees two input fields: "Weight (kg)" and "Weight (lb)"
3. User types "50" in kg field
4. App automatically calculates and displays "110.23" in lb field
5. User can edit either field, other updates in real-time
6. Taps "Mark Complete" → weight saved to session

### Flow 3: View Progress Stats
1. User taps "Stats" tab
2. Sees dropdown with exercise list
3. Selects "Seated Leg Curls"
4. Bar graph displays with X-axis: session numbers, Y-axis: weight in kg
5. Each bar shows max weight used in that session
6. PR badge at top shows "PR: 60 kg on Jan 15, 2026"
7. User can swipe to view other exercises

## Exercise Sequence (25 Steps Total)

### Warm-up (4 steps)
1. 20 minutes jogging (timer)
2. Hamstring stretches (timer/mark complete)
3. Calf stretches (timer/mark complete)
4. Quad stretches (timer/mark complete)

### Strength Round 1 (4 steps)
5. Seated Leg Curls - 7 reps (weight input)
6. Seated Leg Raises - 7 reps (weight input)
7. Weighted Calf Raises - 7 reps (weight input)
8. Weighted Hip Thrusts - 7 reps (weight input)

### Stretch Round 1 (3 steps)
9. Hamstring stretches (repeat)
10. Calf stretches (repeat)
11. Quad stretches (repeat)

### Strength Round 2 (4 steps)
12. Seated Leg Curls - 7 reps (weight input)
13. Seated Leg Raises - 7 reps (weight input)
14. Weighted Calf Raises - 7 reps (weight input)
15. Weighted Hip Thrusts - 7 reps (weight input)

### Stretch Round 2 (3 steps)
16. Hamstring stretches (repeat)
17. Calf stretches (repeat)
18. Quad stretches (repeat)

### Finisher (1 step)
19. Volleyball Spike Jump onto Box - 7 reps (height input in inches)

## Data Model

### Session
- session_id (unique)
- session_number (incremental)
- date (YYYY-MM-DD)
- time (HH:MM)
- completed (boolean)

### Exercise Log
- log_id (unique)
- session_id (foreign key)
- exercise_name (string)
- weight_kg (decimal, nullable)
- weight_lb (decimal, nullable)
- box_jump_inches (integer, nullable)
- completed (boolean)

## Interaction Design
- **Primary actions**: Scale to 0.97 with light haptic feedback
- **List items**: Opacity 0.7 on press
- **Animations**: Subtle, 200-300ms duration
- **Feedback**: Immediate visual response to all taps
- **Success states**: Green checkmark with success haptic

## Technical Notes
- Use AsyncStorage for local data persistence (no backend required)
- Use FlatList for session history (performance)
- Use react-native-chart-kit or Victory Native for bar graphs
- Weight conversion: 1 kg = 2.20462 lb
- Default unit preference stored in AsyncStorage
