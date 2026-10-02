import type { ApiError, ErrorResponse } from "@/types/api";

export type CurrentUser = {
  id: string;
  nickname: string;
  image: string | null;
};

const BASE_URL = "https://panda-market-api.vercel.app";

export async function getCurrentUser(
  accessToken: string,
): Promise<CurrentUser> {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await res.json()) as CurrentUser | ErrorResponse;

  if (!res.ok) {
    const error = new Error(
      (data as ErrorResponse).message || "사용자 정보를 불러오지 못했습니다.",
    ) as ApiError;

    error.status = res.status;
    throw error;
  }

  return data as CurrentUser;
}
