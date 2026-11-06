export interface ActivityEvent {
  event_type?: string | null;
  event_name?: string | null;
  screen_name?: string | null;
  user_id?: string | null;
  created_at: string;
}

export function aggregateActivity(events: ActivityEvent[], todayIso: string) {
  const screenCounts: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  const activeUserSetToday = new Set<string>();

  events.forEach((ev) => {
    if (ev.screen_name) {
      screenCounts[ev.screen_name] = (screenCounts[ev.screen_name] || 0) + 1;
    }
    if (ev.event_name) {
      eventCounts[ev.event_name] = (eventCounts[ev.event_name] || 0) + 1;
    }
    if (ev.event_type) {
      typeCounts[ev.event_type] = (typeCounts[ev.event_type] || 0) + 1;
    }
    if (ev.user_id && ev.created_at >= todayIso) {
      activeUserSetToday.add(ev.user_id);
    }
  });

  const topScreens = Object.entries(screenCounts)
    .map(([screen, count]) => ({ screen, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topEvents = Object.entries(eventCounts)
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const eventsByType = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return { activeUsersToday: activeUserSetToday.size, topScreens, topEvents, eventsByType };
}
