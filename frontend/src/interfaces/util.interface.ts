import { ENTITY_TYPE } from "@/interfaces/session.interface";

export interface TrackedBosses {
  type: ENTITY_TYPE;
  id: number;
}

export interface SupportedRaid {
  dungeonName: string;
  disabled: boolean;
  bosses: number[];
}

export interface LogFilter {
  classes: number[];
  bosses: number[];
  gearLevel: [number, number];
  range: [number, number];
  level: [number, number];
  partyDps: number;
  server: string;
  region: string;
  key?: string;
}
