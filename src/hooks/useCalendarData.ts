'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCreatorContext } from './CreatorContext';
import { useCalendarContext } from './CalendarContext';
import { formatMonthKey, getTodayKey } from '@/utils/date';
import { getMonthGrid, populateCalendarGrid } from '@/utils/calendar';
import { CalendarDay, CreatorActivity } from '@/types';
import * as api from '@/lib/api';

export function useCalendarData() {
  const { state: creatorState } = useCreatorContext();
  const { state: calState, dispatch } = useCalendarContext();
  const fetchingRef = useRef(false);

  const monthKey = formatMonthKey(calState.currentYear, calState.currentMonth);

  const doFetch = useCallback(
    async (uids: number[], force: boolean) => {
      if (uids.length === 0) {
        dispatch({ type: 'SET_MONTH_DATA', key: monthKey, data: {} });
        return;
      }

      fetchingRef.current = true;
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({
        type: 'SET_LOADING_PROGRESS',
        progress: { done: 0, total: uids.length },
      });

      try {
        const res = await api.fetchBatchUpdates(
          uids,
          calState.currentYear,
          calState.currentMonth,
          force
        );
        dispatch({ type: 'SET_MONTH_DATA', key: monthKey, data: res.data });
      } catch {
        dispatch({ type: 'SET_MONTH_DATA', key: monthKey, data: {} });
      }
    },
    [calState.currentYear, calState.currentMonth, monthKey, dispatch]
  );

  // Fetch when month changes
  useEffect(() => {
    if (!calState.monthUpdatesCache[monthKey] && !fetchingRef.current) {
      const allUids = creatorState.creators.map((c) => c.uid);
      doFetch(allUids, false);
    }
  }, [monthKey, calState.monthUpdatesCache, creatorState.creators, doFetch]);

  useEffect(() => {
    fetchingRef.current = false;
  }, [monthKey]);

  // ---- Refresh functions ----

  // 刷新本月 - refresh current month (use cache if fresh)
  const refreshMonth = useCallback(() => {
    fetchingRef.current = false;
    dispatch({ type: 'SET_REFRESHING', refreshing: true });
    // clear current month cache so it refetches
    dispatch({ type: 'SET_MONTH_DATA', key: monthKey, data: {} });
    const allUids = creatorState.creators.map((c) => c.uid);
    doFetch(allUids, false);
  }, [monthKey, creatorState.creators, doFetch, dispatch]);

  // 全量刷新 - bypass all caches, force refetch all creators
  const refreshAllForce = useCallback(() => {
    fetchingRef.current = false;
    dispatch({ type: 'SET_REFRESHING', refreshing: true });
    const allUids = creatorState.creators.map((c) => c.uid);
    doFetch(allUids, true);
  }, [creatorState.creators, doFetch, dispatch]);

  // 刷新选中 - refetch only selected creators with cache bypass
  const refreshSelected = useCallback(() => {
    fetchingRef.current = false;
    dispatch({ type: 'SET_REFRESHING', refreshing: true });
    const selectedUids = creatorState.selectedCreatorIds;
    if (selectedUids.length === 0) {
      dispatch({ type: 'SET_REFRESHING', refreshing: false });
      return;
    }
    doFetch(selectedUids, true);
  }, [creatorState.selectedCreatorIds, doFetch, dispatch]);

  // 刷新今日 - refetch all creators with cache bypass (to get latest today's updates)
  const refreshToday = useCallback(() => {
    fetchingRef.current = false;
    dispatch({ type: 'SET_REFRESHING', refreshing: true });
    const allUids = creatorState.creators.map((c) => c.uid);
    doFetch(allUids, true);
    // also navigate to today
    const today = getTodayKey();
    dispatch({ type: 'SELECT_DATE', date: today });
  }, [creatorState.creators, doFetch, dispatch]);

  // Build calendar grid
  const rawWeeks = getMonthGrid(calState.currentYear, calState.currentMonth);
  const monthData = calState.monthUpdatesCache[monthKey] || {};

  const creatorMap = new Map<number, CreatorActivity>();
  for (const c of creatorState.creators) {
    creatorMap.set(c.uid, { uid: c.uid, name: c.name, avatar: c.avatar });
  }

  const selectedUids = new Set(creatorState.selectedCreatorIds);
  const weeks: CalendarDay[][] =
    creatorState.selectedCreatorIds.length === 0
      ? rawWeeks.map((week) =>
          week.map((day) => ({
            ...day,
            creatorActivities: [],
            updateCount: 0,
          }))
        )
      : populateCalendarGrid(rawWeeks, monthData, creatorMap, selectedUids);

  return {
    weeks,
    monthData,
    selectedUids,
    refreshMonth,
    refreshAllForce,
    refreshSelected,
    refreshToday,
  };
}
