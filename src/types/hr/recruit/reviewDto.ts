import type { ReviewStat } from "../enum";
export type UUID = string;

export interface ReviewDto {
  id: UUID;
  reviewById: UUID;
  appCount: number;
  status: ReviewStat;
  comment: string;
}

export interface ReviewAllDto {
  id: UUID;
  reviewById: UUID;
  status: ReviewStat;
  comment: string;
}

export interface PostPublish {
  id: UUID;
  reviewById: UUID;
  comment: string;
}