# Runtime Error Fix - "Cannot access uninitialized variable"

## Problem Identified ✅
**Error**: `Cannot access uninitialized variable` when clicking the scheduler tab

**Root Cause**: Violated React Hooks rules by declaring `useState` hook in the middle of the component function instead of at the top level.

## Technical Details
The error occurred because:
1. **Improper Hook Placement**: The `overdueTasksDialog` state was declared inside the component body after other functions
2. **Circular Dependency**: `processOverdueTaskAction` was trying to call `generateIntelligentSchedule` before it was defined
3. **Hook Rules Violation**: React hooks must be called at the top level, not inside functions or conditionally

## Fixes Applied ✅

### 1. Moved State Declaration to Top Level
**Before**:
```javascript
export default function SmartScheduler() {
  // ... other states
  
  const handleBlackoutOverride = () => { ... };
  
  // ❌ WRONG: Hook declared after function
  const [overdueTasksDialog, setOverdueTasksDialog] = useState({ show: false, tasks: [] });
  
  const handleOverdueTasks = () => { ... };
}
```

**After**:
```javascript
export default function SmartScheduler() {
  // ... other states
  const [blackoutOverrides, setBlackoutOverrides] = useState([]);
  // ✅ CORRECT: All hooks at top level
  const [overdueTasksDialog, setOverdueTasksDialog] = useState({ show: false, tasks: [] });
  const [userPreferences, setUserPreferences] = useState({...});
  
  // Functions come after all hooks
  const handleBlackoutOverride = () => { ... };
}
```

### 2. Fixed Circular Dependency
**Before**:
```javascript
const processOverdueTaskAction = useCallback(async (task, action, newDeadline = null) => {
  // ... processing logic
  
  if (remainingTasks.length === 0) {
    setTimeout(generateIntelligentSchedule, 100); // ❌ Called before definition
  }
}, [user.uid, generateIntelligentSchedule]); // ❌ Circular dependency

const generateIntelligentSchedule = useCallback(async () => {
  // ... defined later
}, [/* deps */]);
```

**After**:
```javascript
const processOverdueTaskAction = useCallback(async (task, action, newDeadline = null) => {
  // ... processing logic
  
  if (remainingTasks.length === 0) {
    // ✅ Just close dialog, let useEffect handle scheduling
    setTimeout(() => {
      setOverdueTasksDialog({ show: false, tasks: [] });
    }, 500);
  }
}, [user.uid]); // ✅ No circular dependency

// ✅ Separate useEffect handles auto-scheduling
useEffect(() => {
  if (!overdueTasksDialog.show && overdueTasksDialog.tasks.length === 0 && tasks.length > 0) {
    const timer = setTimeout(() => {
      generateIntelligentSchedule();
    }, 100);
    return () => clearTimeout(timer);
  }
}, [overdueTasksDialog.show, overdueTasksDialog.tasks.length, tasks.length, generateIntelligentSchedule]);
```

### 3. Removed Duplicate Declaration
- Removed the duplicate `overdueTasksDialog` state declaration that was left in the middle of the component

## React Hooks Rules Refresher
1. **Always call hooks at the top level** - never inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - components or custom hooks
3. **Hooks must be called in the same order every time** - ensures React can track state correctly

## Verification ✅
- ✅ Application compiles without errors
- ✅ No runtime errors when clicking scheduler tab
- ✅ Proper hook ordering maintained
- ✅ Auto-scheduling functionality preserved
- ✅ Clean dependency management

## Files Modified
- `/src/pages/SmartScheduler.js` - Fixed hook placement and circular dependencies

## Result
The scheduler tab now loads without runtime errors and maintains all intended functionality including:
- Overdue task handling
- Auto-dialog closure
- Automatic schedule generation
- Proper state management
