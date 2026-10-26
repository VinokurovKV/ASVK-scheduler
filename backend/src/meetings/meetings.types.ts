import type { EventFormat } from '../events/events.types.js';

export interface CreateMeetingInput {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  eventType: 'MEETING' | 'WORK_MEETING';
  format: EventFormat;
  repeatInterval?: 'NONE' | 'WEEK' | 'TWO_WEEKS' | 'MONTH';
  room?: string;
  meetingUrl?: string;
  participantIds?: number[];
}
