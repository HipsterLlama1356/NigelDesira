export type Category =
  | 'Food'
  | 'Outdoors'
  | 'Indoor'
  | 'Adventure'
  | 'Cozy'
  | 'Cultural';

export interface DateIdea {
  id: string;
  title: string;
  emoji: string;
  category: Category;
  description: string;
  durationMinutes: number;
  mapsQuery: string;
  estimatedCost: '$' | '$$' | '$$$';
}

export interface ScheduledDate {
  id: string;
  ideaId: string;
  scheduledAt: number;
  notes?: string;
  notificationId?: string;
}

export type RootStackParamList = {
  Tabs: undefined;
  IdeaDetail: { ideaId: string };
};

export type TabParamList = {
  Browse: undefined;
  Saved: undefined;
  Scheduled: undefined;
};
