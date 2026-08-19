import type { ReviewStat } from "@/modules/hr/types/enum";
import type { UUID } from 'crypto';

export type { UUID };
export interface ReviewDto {
  id: string;
  appCount: number;
  status: string; // The status from ReviewStat enum
  comment: string;
}

export interface ReviewAllDto {
  id: UUID;
  status: ReviewStat;
  comment: string;
}

export interface PostPublish {
  id: UUID;
  comment: string;
}