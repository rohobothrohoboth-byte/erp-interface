import type { BaseDto } from "./BaseDto";
import type { AddressType } from "./enum";
import type { UUID } from 'crypto';

export type { UUID };
export interface AddressListDto extends BaseDto {
    addressType: AddressType; //enum.AddressType (0/1)
    addressTypeStr: string;
    country: string;
    region: string;
    subcity: string;
    zone: string;
    woreda: string;
    kebele: string;
    houseNo: string;
    telephone: string;
    poBox: string;
    fax: string;
    email: string;
    website: string;
}

export interface AddressAddDto {
    addressType: AddressType; //enum.AddressType (0/1)
    country: string;
    region: string;
    subcity: string;
    zone: string;
    woreda: string;
    kebele: string;
    houseNo: string;
    telephone: string;
    poBox: string;
    fax: string;
    email: string;
    website: string;
}

export interface AddressModDto {
    id: UUID;
    addressType: AddressType; //enum.AddressType (0/1)
    country: string;
    region: string;
    subcity: string;
    zone: string;
    woreda: string;
    kebele: string;
    houseNo: string;
    telephone: string;
    poBox: string;
    fax: string;
    email: string;
    website: string;
    rowVersion: string;
}