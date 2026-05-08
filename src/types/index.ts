// ---- Core Domain Types ----

export interface Creator {
  uid: number;
  name: string;
  avatar: string;
  groups: string[];
  addedAt: string;
  lastFetchedAt?: string;
}

export interface CreatorsData {
  creators: Creator[];
  groups: string[];
}

export type DynamicType =
  | 'video'
  | 'text'
  | 'image'
  | 'forward'
  | 'article'
  | 'live'
  | 'music'
  | 'others';

export interface BiliUpdate {
  id: string;
  uid: number;
  type: DynamicType;
  title?: string;
  content: string;
  images: string[];
  timestamp: number;
  url: string;
  videoBvid?: string;
}

export interface CachedUpdates {
  uid: number;
  fetchedAt: string;
  updates: BiliUpdate[];
}

// ---- Config Types ----

export interface AppConfig {
  cookie: string;
  refreshIntervalMin: number;
  typeFilters: DynamicType[];
}

// ---- Calendar Types ----

export interface CreatorActivity {
  uid: number;
  name: string;
  avatar: string;
}

export interface CalendarDay {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  creatorActivities: CreatorActivity[];
  updateCount: number;
}

export interface MonthData {
  year: number;
  month: number;
  weeks: CalendarDay[][];
}

// ---- API Response Types ----

export interface BatchUpdateResponse {
  data: Record<string, BiliUpdate[]>;
  refreshed: Record<string, boolean>;
  errors?: Record<string, string>;
}

export interface BiliApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface BiliUserInfo {
  mid: number;
  name: string;
  face: string;
}

export interface BiliDynamicItem {
  id_str: string;
  type: number;
  modules: {
    module_author: {
      mid: number;
      name: string;
      face: string;
    };
    module_dynamic: {
      major?: {
        type: string;
        archive?: {
          aid: string;
          bvid: string;
          title: string;
          cover: string;
        };
        draw?: {
          items: Array<{ src: string }>;
        };
        live_rcmd?: {
          content: string;
        };
        article?: {
          id: string;
          title: string;
        };
      };
      desc?: {
        text: string;
      };
    };
  };
}
