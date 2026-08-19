import type { UUID } from "crypto";

export type { UUID };

export interface StatChangeDto {
  id: UUID;
  stat: boolean;
  rowVersion: string;
}