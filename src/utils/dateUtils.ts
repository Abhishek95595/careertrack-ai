// Date utilities for deadline calculations and interview reminders

export function formatReadableDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

export function formatDateTime(dateTimeStr?: string): string {
  if (!dateTimeStr) return '—';
  try {
    const date = new Date(dateTimeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  } catch (e) {
    // fallback
  }
  return dateTimeStr;
}

export interface DeadlineUrgency {
  daysLeft: number;
  label: string;
  isUrgent: boolean;   // <= 2 days
  isExpired: boolean;  // < 0 days
  isToday: boolean;
}

export function getDeadlineUrgency(deadlineDate?: string): DeadlineUrgency | null {
  if (!deadlineDate) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = deadlineDate.split('-');
    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        daysLeft: diffDays,
        label: `Deadline passed (${Math.abs(diffDays)}d ago)`,
        isUrgent: false,
        isExpired: true,
        isToday: false,
      };
    }
    if (diffDays === 0) {
      return {
        daysLeft: 0,
        label: 'Deadline is today!',
        isUrgent: true,
        isExpired: false,
        isToday: true,
      };
    }
    if (diffDays === 1) {
      return {
        daysLeft: 1,
        label: 'Due tomorrow',
        isUrgent: true,
        isExpired: false,
        isToday: false,
      };
    }
    return {
      daysLeft: diffDays,
      label: `${diffDays} days left`,
      isUrgent: diffDays <= 3,
      isExpired: false,
      isToday: false,
    };
  } catch {
    return null;
  }
}

export function isInterviewUpcoming(interviewDateTime?: string): { isUpcoming: boolean; isToday: boolean; label: string } | null {
  if (!interviewDateTime) return null;
  try {
    const target = new Date(interviewDateTime);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { isUpcoming: false, isToday: false, label: 'Completed' };
    }
    if (diffHours <= 24) {
      return { isUpcoming: true, isToday: true, label: 'Today / Within 24h' };
    }
    const days = Math.ceil(diffHours / 24);
    return { isUpcoming: true, isToday: false, label: `In ${days} days` };
  } catch {
    return null;
  }
}
