import { formatCurrency, formatDate, formatDistance, formatDuration, formatRelativeTime } from '../../src/utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format amount to USD currency string', () => {
      expect(formatCurrency(15.00)).toBe('$15.00');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-15.00)).toBe('-$15.00');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string to readable format', () => {
      const dateString = '2024-01-01T10:30:00Z';
      const formatted = formatDate(dateString);
      expect(formatted).toMatch(/Jan 1, 2024/);
    });

    it('should handle invalid date strings', () => {
      expect(formatDate('invalid-date')).toMatch(/Invalid Date/);
    });
  });

  describe('formatDistance', () => {
    it('should format distance in kilometers', () => {
      expect(formatDistance(5.2)).toBe('5.2 km');
      expect(formatDistance(0)).toBe('0 m');
      expect(formatDistance(0.5)).toBe('500 m');
    });

    it('should format small distances in meters', () => {
      expect(formatDistance(0.1)).toBe('100 m');
      expect(formatDistance(0.05)).toBe('50 m');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes', () => {
      expect(formatDuration(15)).toBe('15 min');
      expect(formatDuration(0)).toBe('0 min');
    });

    it('should format duration in hours and minutes', () => {
      expect(formatDuration(60)).toBe('1 hr');
      expect(formatDuration(90)).toBe('1 hr 30 min');
      expect(formatDuration(120)).toBe('2 hr');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent times', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should format "just now" for very recent times', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
    });

    it('should format hours ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });
  });
});
