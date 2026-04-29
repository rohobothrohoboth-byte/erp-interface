import type { ReviewStat } from "../enum";
import type { UUID } from 'crypto';

export type { UUID };
export interface ReviewDto {
  id: UUID;
  appCount: number;
  status: ReviewStat;
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