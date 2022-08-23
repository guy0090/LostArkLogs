export interface LogFilter {
  classes: number[];
  bosses: number[];
  gearLevel: [number, number];
  range: [number, number] | [string, string] | [];
  level: [number, number];
  partyDps: number;
  server: string;
  region: string;
  key?: string;
  creator?: string;
  page?: number | undefined;
  sort: ["dps" | "createdAt", -1 | 1];
}
