import AppError from './appError';

export function constructDate(
  range: 'today' | 'week' | 'month' | 'year' | 'custom',
  from: string,
  to: string,
): {
  startDate: Date | undefined;
  endDate: Date | undefined;
} {
  const now = new Date();

  let startDate: Date | undefined;
  let endDate: Date | undefined = now; // Default to now for endDate

  switch (range) {
    case 'today':
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'week':
      let firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);
      startDate = firstDayOfWeek;
      break;

    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;

    case 'custom':
      if (from && to) {
        startDate = new Date(from);
        endDate = new Date(to);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new AppError(
            'Invalid date format provided for custom range',
            400,
          );
        }
      } else {
        throw new AppError(
          'Both from and to dates must be provided for custom range',
          400,
        );
      }
      break;

    default:
      startDate = undefined; //No filter
  }

  return {
    startDate,
    endDate,
  };
}

export const buildDateCondition = (
  alias = 'e',
  startDate?: Date,
  endDate?: Date,
) => {
  return startDate
    ? `WHERE ${alias}."createdAt" BETWEEN '${startDate.toISOString()}' AND '${endDate?.toISOString()}'`
    : '';
};


export const buildJoinDateCondition = (
  alias = 'p',
  startDate?: Date,
  endDate?: Date,
) => {
  return startDate
    ? `${alias}."createdAt" BETWEEN '${startDate.toISOString()}' AND '${endDate?.toISOString()}'`
    : '1=1'; // no filter fallback
};