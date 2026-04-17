
export type UUID = string;

export interface BaseDto{
id: UUID;
isDeleted: boolean;
rowVersion: string;
CreatedAt: string;
createdAtAm:string;
modifiedAt:string;
modifiedAtAm: string;
}