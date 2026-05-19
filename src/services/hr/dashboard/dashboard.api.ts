import type { EmpDbPendList, EmpDbReport } from "../../../types/hr/dashboard";
import { api } from "../../api";

const BaseUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL}/EmpListRepo`;

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const e = error as any;

    if (e.response?.data?.message) return e.response.data.message;

    if (e.response?.data?.errors)
      return (Object.values(e.response.data.errors) as string[][])
        .flat()
        .join(", ");

    if (e.message) return e.message;
  }

  return "An unexpected error occurred";
};

export const getEmpDbRepo = async (): Promise<EmpDbReport> => {
  try {
    const response = await api.get(`${BaseUrl}/EmpDbRepo`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getPendEmpList = async (): Promise<EmpDbPendList[]> => {
  try {
    const response = await api.get(`${BaseUrl}/PendEmpList`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};