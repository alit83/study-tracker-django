export interface Subject {
  id: string;
  name: string;
  color: string; // Hex or Tailwind color class
  bgLight: string;
  border: string;
  text: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  description: string;
  startTime: string; // ISO string e.g. "2026-08-29T10:00:00"
  endTime: string;   // ISO string e.g. "2026-08-29T11:30:00"
  durationSeconds: number;
  jYear: number;
  jMonth: number; // 1 to 12
  jDay: number;
}

export interface JalaaliDate {
  jy: number;
  jm: number;
  jd: number;
}
