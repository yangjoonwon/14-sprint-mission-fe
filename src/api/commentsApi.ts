import type { ApiError, ErrorResponse } from "@/types/api";
import type {
  ProductComment,
  ProductCommentListResponse,
} from "@/types/comment";

type GetProductCommentParams = {
  productId: string;
  limit?: number;
  cursor?: string;
};

type CreateProductCommentParams = {
  productId: string;
  content: string;
  accessToken: string;
};

type UpdateCommentParams = {
  commentId: string;
  content: string;
  accessToken: string;
};

type DeleteCommentParams = {
  commentId: string;
  accessToken: string;
};

const BASE_URL = "https://panda-market-api.vercel.app";

export async function getProductComments({
  productId,
  limit = 10,
  cursor,
}: GetProductCommentParams): Promise<ProductCommentListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  if (cursor) {
    params.set("cursor", String(cursor));
  }

  const response = await fetch(
    `${BASE_URL}/products/${productId}/comments?${params.toString()}`,
  );

  const data = (await response.json()) as
    | ProductCommentListResponse
    | ErrorResponse;

  if (!response.ok) {
    throw new Error(
      (data as ErrorResponse).message || "댓글을 불러오지 못했습니다.",
    );
  }

  return data as ProductCommentListResponse;
}

export async function createProductComment({
  productId,
  content,
  accessToken,
}: CreateProductCommentParams): Promise<ProductComment> {
  const response = await fetch(`${BASE_URL}/products/${productId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      content,
    }),
  });

  const data = (await response.json()) as ProductComment | ErrorResponse;

  if (!response.ok) {
    const error = new Error(
      (data as ErrorResponse).message || "댓글을 등록하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }

  return data as ProductComment;
}

export async function updateComment({
  commentId,
  content,
  accessToken,
}: UpdateCommentParams): Promise<ProductComment> {
  const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      content,
    }),
  });

  const data = (await response.json()) as ProductComment | ErrorResponse;

  if (!response.ok) {
    const error = new Error(
      (data as ErrorResponse).message || "댓글을 수정하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }

  return data as ProductComment;
}

export async function deleteComment({
  commentId,
  accessToken,
}: DeleteCommentParams): Promise<void> {
  const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const data = (await response.json()) as ErrorResponse;
    const error = new Error(
      data.message || "댓글을 삭제하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }
}
