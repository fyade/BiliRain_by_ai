'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { Creator, DynamicType, BatchAddResponse } from '@/types';
import * as api from '@/lib/api';

// ---- State ----

interface CreatorState {
  creators: Creator[];
  groups: string[];
  selectedCreatorIds: number[];
  loading: boolean;
}

const initialState: CreatorState = {
  creators: [],
  groups: [],
  selectedCreatorIds: [],
  loading: true,
};

// ---- Actions ----

type CreatorAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_DATA'; creators: Creator[]; groups: string[] }
  | { type: 'ADD_CREATOR'; creator: Creator }
  | { type: 'UPDATE_CREATOR'; uid: number; groups: string[] }
  | { type: 'DELETE_CREATOR'; uid: number }
  | { type: 'TOGGLE_CREATOR'; uid: number }
  | { type: 'SELECT_ALL'; uids?: number[] }
  | { type: 'DESELECT_ALL' }
  | { type: 'ADD_GROUP'; name: string }
  | { type: 'RENAME_GROUP'; oldName: string; newName: string; creators: Creator[] }
  | { type: 'DELETE_GROUP'; name: string; creators: Creator[] };

function creatorReducer(state: CreatorState, action: CreatorAction): CreatorState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };

    case 'SET_DATA':
      return {
        ...state,
        creators: action.creators,
        groups: action.groups,
        selectedCreatorIds: action.creators.map((c) => c.uid),
        loading: false,
      };

    case 'ADD_CREATOR':
      return {
        ...state,
        creators: [...state.creators, action.creator],
        groups: [
          ...new Set([...state.groups, ...action.creator.groups]),
        ],
        selectedCreatorIds: [...state.selectedCreatorIds, action.creator.uid],
      };

    case 'UPDATE_CREATOR':
      return {
        ...state,
        creators: state.creators.map((c) =>
          c.uid === action.uid ? { ...c, groups: action.groups } : c
        ),
        groups: [...new Set([...state.groups, ...action.groups])],
      };

    case 'DELETE_CREATOR':
      return {
        ...state,
        creators: state.creators.filter((c) => c.uid !== action.uid),
        selectedCreatorIds: state.selectedCreatorIds.filter(
          (id) => id !== action.uid
        ),
      };

    case 'TOGGLE_CREATOR':
      return {
        ...state,
        selectedCreatorIds: state.selectedCreatorIds.includes(action.uid)
          ? state.selectedCreatorIds.filter((id) => id !== action.uid)
          : [...state.selectedCreatorIds, action.uid],
      };

    case 'SELECT_ALL':
      return {
        ...state,
        selectedCreatorIds: action.uids ?? state.creators.map((c) => c.uid),
      };

    case 'DESELECT_ALL':
      return { ...state, selectedCreatorIds: [] };

    case 'ADD_GROUP':
      return state.groups.includes(action.name)
        ? state
        : { ...state, groups: [...state.groups, action.name] };

    case 'RENAME_GROUP':
      return {
        ...state,
        groups: state.groups.map((g) => (g === action.oldName ? action.newName : g)),
        creators: action.creators,
      };

    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter((g) => g !== action.name),
        creators: action.creators,
      };

    default:
      return state;
  }
}

// ---- Context ----

interface CreatorContextValue {
  state: CreatorState;
  loadCreators: () => Promise<void>;
  addCreator: (identifier: string, groups?: string[]) => Promise<Creator | null>;
  addCreatorBatch: (identifiers: string[], groups?: string[]) => Promise<BatchAddResponse>;
  updateCreator: (uid: number, groups: string[]) => Promise<void>;
  deleteCreator: (uid: number) => Promise<void>;
  toggleCreator: (uid: number) => void;
  selectAll: (uids?: number[]) => void;
  deselectAll: () => void;
  addGroup: (name: string) => Promise<void>;
  renameGroup: (oldName: string, newName: string) => Promise<void>;
  deleteGroup: (name: string) => Promise<void>;
}

const CreatorContext = createContext<CreatorContextValue | null>(null);

export function CreatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(creatorReducer, initialState);
  const loadedRef = useRef(false);

  const loadCreators = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const data = await api.fetchCreators();
      dispatch({ type: 'SET_DATA', creators: data.creators, groups: data.groups });
      loadedRef.current = true;
    } catch {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadCreators();
    }
  }, [loadCreators]);

  const addCreator = useCallback(async (identifier: string, groups?: string[]) => {
    try {
      const creator = await api.addCreator(identifier, groups);
      dispatch({ type: 'ADD_CREATOR', creator });
      return creator;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '添加失败';
      throw new Error(msg);
    }
  }, []);

  const addCreatorBatch = useCallback(async (identifiers: string[], groups?: string[]) => {
    const result = await api.addCreatorBatch(identifiers, groups);
    for (const r of result.results) {
      if (r.status === 'added' && r.uid && r.name && r.avatar) {
        dispatch({
          type: 'ADD_CREATOR',
          creator: {
            uid: r.uid,
            name: r.name,
            avatar: r.avatar,
            groups: groups?.length ? groups : ['默认'],
            addedAt: new Date().toISOString(),
          },
        });
      }
    }
    return result;
  }, []);

  const updateCreator = useCallback(async (uid: number, groups: string[]) => {
    await api.updateCreator(uid, { groups });
    dispatch({ type: 'UPDATE_CREATOR', uid, groups });
  }, []);

  const deleteCreator = useCallback(async (uid: number) => {
    await api.deleteCreator(uid);
    dispatch({ type: 'DELETE_CREATOR', uid });
  }, []);

  const toggleCreator = useCallback((uid: number) => {
    dispatch({ type: 'TOGGLE_CREATOR', uid });
  }, []);

  const selectAll = useCallback(
    (uids?: number[]) => dispatch({ type: 'SELECT_ALL', uids }),
    []
  );
  const deselectAll = useCallback(() => dispatch({ type: 'DESELECT_ALL' }), []);

  const addGroup = useCallback(async (name: string) => {
    const result = await api.addGroup(name);
    dispatch({ type: 'ADD_GROUP', name });
    if (result.creators) {
      dispatch({ type: 'SET_DATA', creators: result.creators, groups: result.groups });
    }
  }, []);

  const renameGroup = useCallback(async (oldName: string, newName: string) => {
    const result = await api.renameGroup(oldName, newName);
    dispatch({ type: 'RENAME_GROUP', oldName, newName, creators: result.creators });
  }, []);

  const deleteGroup = useCallback(async (name: string) => {
    const result = await api.deleteGroup(name);
    dispatch({ type: 'DELETE_GROUP', name, creators: result.creators });
  }, []);

  return (
    <CreatorContext.Provider
      value={{
        state,
        loadCreators,
        addCreator,
        addCreatorBatch,
        updateCreator,
        deleteCreator,
        toggleCreator,
        selectAll,
        deselectAll,
        addGroup,
        renameGroup,
        deleteGroup,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreatorContext() {
  const ctx = useContext(CreatorContext);
  if (!ctx) throw new Error('useCreatorContext must be used within CreatorProvider');
  return ctx;
}
