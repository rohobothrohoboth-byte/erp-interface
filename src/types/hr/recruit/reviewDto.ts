import type { ReviewStat } from "../enum";
export type UUID = string;

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