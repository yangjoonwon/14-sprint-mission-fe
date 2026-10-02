import type { ErrorResponse } from "@/types/api";

const BASE_URL = "https://panda-market-api.vercel.app";

type SignInParams = {
  email: string;
  password: string;
};

type SignUpParams = SignInParams & {
  nickname: string;
  passwordConfirmation: string;
};

type AuthResponse = {
  accessToken: string;
};

export async function signIn({
  email,
  password,
}: SignInParams): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/signIn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = (await res.json()) as AuthResponse | ErrorResponse;

  if (!res.ok) {
    throw new Error(
      (data as ErrorResponse).message || "로그인에 실패했습니다.",
    );
  }

  return data as AuthResponse;
}

export async function signUp({
  email,
  nickname,
  password,
  passwordConfirmation,
}: SignUpParams): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/signUp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      nickname,
      password,
      passwordConfirmation,
    }),
  });

  const data = (await res.json()) as AuthResponse | ErrorResponse;

  if (!res.ok) {
    throw new Error(
      (data as ErrorResponse).message || "회원가입에 실패했습니다.",
    );
  }

  return data as AuthResponse;
}
