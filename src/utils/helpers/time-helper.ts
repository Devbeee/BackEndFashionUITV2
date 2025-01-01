import * as dayjs from 'dayjs';

export const getStartOfWeek = (
  today: dayjs.Dayjs,
  filter: 'thisWeek' | 'lastWeek',
): dayjs.Dayjs => {
  const startOfWeek = today.startOf('week').add(1, 'day');
  return filter === 'lastWeek' ? startOfWeek.subtract(7, 'day') : startOfWeek;
};

export const getEndOfWeek = (
  today: dayjs.Dayjs,
  filter: 'thisWeek' | 'lastWeek',
): dayjs.Dayjs => {
  const endOfWeek = today.endOf('week').add(1, 'day');
  return filter === 'lastWeek' ? endOfWeek.subtract(7, 'day') : endOfWeek;
};

export const getDateRange = (
  filter: 'thisWeek' | 'lastWeek' | 'thisYear' | 'lastYear',
  today: dayjs.Dayjs,
): { start: dayjs.Dayjs; end: dayjs.Dayjs } => {
  switch (filter) {
    case 'thisWeek':
    case 'lastWeek':
      return {
        start: getStartOfWeek(today, filter),
        end: getEndOfWeek(today, filter),
      };
    case 'thisYear':
      return {
        start: today.startOf('year'),
        end: today.endOf('year'),
      };
    case 'lastYear':
      const lastYear = today.subtract(1, 'year');
      return {
        start: lastYear.startOf('year'),
        end: lastYear.endOf('year'),
      };
    default:
      throw new Error('Invalid filter type');
  }
};
