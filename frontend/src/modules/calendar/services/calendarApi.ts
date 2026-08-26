import { httpClient } from "@shared/api/httpClient";
import type { TaskDto } from "@modules/tasks/services/tasksApi";

export type HolidayRecord = {
  id: number;
  holidayDate: string;
  holidayName: string;
  holidayType?: string;
  locationName?: string | null;
  recurring?: boolean;
  description?: string | null;
  active?: boolean;
};

export async function fetchCalendarTasks(): Promise<TaskDto[]> {
  const response = await httpClient.get<TaskDto[]>("/tasks");
  return response.data;
}

export async function fetchCalendarHolidays(): Promise<HolidayRecord[]> {
  const response = await httpClient.get<HolidayRecord[]>("/organization/holidays");
  return response.data;
}
