'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { DynamicType, BiliUpdate } from '@/types';

// ---- State ----

interface CalendarState {
  currentYear: number;
  currentMonth: number;
  selectedDate: string | null;
  monthUpdatesCache: Record<string, Record<string, BiliUpdate[]>>;
  typeFilters: DynamicType[];
  loading: boolean;
  loadingProgress: { done: number; total: number } | null;
  refreshing: boolean;
}

const today = new Date();
const initialState: CalendarState = {
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth() + 1,
  selectedDate: null,
  monthUpdatesCache: {},
  typeFilters: [],
  loading: false,
  loadingProgress: null,
  refreshing: false,
};

// ---- Actions ----

type CalendarAction =
  | { type: 'SET_CURRENT_MONTH'; year: number; month: number }
  | { type: 'NEXT_MONTH' }
  | { type: 'PREV_MONTH' }
  | { type: 'GO_TO_TODAY' }
  | { type: 'SELECT_DATE'; date: string | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_REFRESHING'; refreshing: boolean }
  | { type: 'SET_LOADING_PROGRESS'; progress: { done: number; total: number } | null }
  | { type: 'SET_MONTH_DATA'; key: string; data: Record<string, BiliUpdate[]> }
  | { type: 'SET_TYPE_FILTERS'; filters: DynamicType[] };

function calendarReducer(
  state: CalendarState,
  action: CalendarAction
): CalendarState {
  switch (action.type) {
    case 'SET_CURRENT_MONTH':
      return {
        ...state,
        currentYear: action.year,
        currentMonth: action.month,
        selectedDate: null,
      };

    case 'NEXT_MONTH': {
      const m = state.currentMonth + 1;
      return {
        ...state,
        currentYear: m > 12 ? state.currentYear + 1 : state.currentYear,
        currentMonth: m > 12 ? 1 : m,
        selectedDate: null,
      };
    }

    case 'PREV_MONTH': {
      const m = state.currentMonth - 1;
      return {
        ...state,
        currentYear: m < 1 ? state.currentYear - 1 : state.currentYear,
        currentMonth: m < 1 ? 12 : m,
        selectedDate: null,
      };
    }

    case 'GO_TO_TODAY': {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      return {
        ...state,
        currentYear: d.getFullYear(),
        currentMonth: d.getMonth() + 1,
        selectedDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      };
    }

    case 'SELECT_DATE':
      return { ...state, selectedDate: action.date };

    case 'SET_LOADING':
      return { ...state, loading: action.loading };

    case 'SET_REFRESHING':
      return { ...state, refreshing: action.refreshing };

    case 'SET_LOADING_PROGRESS':
      return { ...state, loadingProgress: action.progress };

    case 'SET_MONTH_DATA':
      return {
        ...state,
        monthUpdatesCache: {
          ...state.monthUpdatesCache,
          [action.key]: action.data,
        },
        loading: false,
        loadingProgress: null,
        refreshing: false,
      };

    case 'SET_TYPE_FILTERS':
      return { ...state, typeFilters: action.filters };

    default:
      return state;
  }
}

// ---- Context ----

interface CalendarContextValue {
  state: CalendarState;
  dispatch: React.Dispatch<CalendarAction>;
  goToToday: () => void;
  nextMonth: () => void;
  prevMonth: () => void;
  selectDate: (date: string | null) => void;
  setTypeFilters: (filters: DynamicType[]) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(calendarReducer, initialState);

  const goToToday = useCallback(() => dispatch({ type: 'GO_TO_TODAY' }), []);
  const nextMonth = useCallback(() => dispatch({ type: 'NEXT_MONTH' }), []);
  const prevMonth = useCallback(() => dispatch({ type: 'PREV_MONTH' }), []);
  const selectDate = useCallback(
    (date: string | null) => dispatch({ type: 'SELECT_DATE', date }),
    []
  );
  const setTypeFilters = useCallback(
    (filters: DynamicType[]) => dispatch({ type: 'SET_TYPE_FILTERS', filters }),
    []
  );

  return (
    <CalendarContext.Provider
      value={{
        state,
        dispatch,
        goToToday,
        nextMonth,
        prevMonth,
        selectDate,
        setTypeFilters,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendarContext must be used within CalendarProvider');
  return ctx;
}
