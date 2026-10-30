export type DashboardDTO = {
  date: string;
  students: number;
  staff: number;
  attendance: { present: number; absent: number; late: number; excused: number; unmarked: number };
  fees: {
    collectedTodayMinor: number;
    collectedMonthMinor: number;
    outstandingMinor: number;
    studentsOwing: number;
  };
};
