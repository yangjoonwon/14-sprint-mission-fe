import type { ApiError, ErrorResponse } from "@/types/api";
import type {
  Product,
  ProductDetail,
  ProductListResponse,
  ProductPayload,
  ProductOrder,
} from "@/types/product";

type ImageUploadResponse = {
  url: string;
};

type GetProductsParams = {
  page?: number;
  pageSize?: number;
  orderBy?: ProductOrder;
  keyword?: string;
};

const BASE_URL = "https://panda-market-api.vercel.app";

export async function getProducts({
  page = 1,
  pageSize = 10,
  orderBy = "recent",
  keyword = "",
}: GetProductsParams): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    orderBy,
  });

  if (keyword) {
    params.set("keyword", keyword);
  }

  const response = await fetch(`${BASE_URL}/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error("상품 목록을 불러오지 못했습니다.");
  }

  return (await response.json()) as ProductListResponse;
}

export async function createProduct(
  productData: ProductPayload,
  accessToken: string,
): Promise<Product> {
  const response = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(productData),
  });

  const data = (await response.json()) as Product | ErrorResponse;

  if (!response.ok) {
    const error = new Error(
      (data as ErrorResponse).message || "상품을 등록하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }

  return data as Product;
}

export async function updateProduct(
  productId: string,
  productData: ProductPayload,
  accessToken: string,
): Promise<Product> {
  const response = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(productData),
  });

  const data = (await response.json()) as Product | ErrorResponse;

  if (!response.ok) {
    const error = new Error(
      (data as ErrorResponse).message || "상품을 수정하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }

  return data as Product;
}

export async function getProductDetail(
  productId: string,
  accessToken: string,
): Promise<ProductDetail> {
  const response = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json()) as ProductDetail | ErrorResponse;

  if (!response.ok) {
    const error = new Error(
      (data as ErrorResponse).message || "상품 정보를 불러오지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }

  return data as ProductDetail;
}

export async function uploadProductImage(
  imageFile: File,
  accessToken: string,
): Promise<string> {
  const extension = imageFile.name.split(".").pop();
  const safeFileName = `product-image-${Date.now()}.${extension}`;
  const renamedImageFile = new File([imageFile], safeFileName, {
    type: imageFile.type,
  });

  const formData = new FormData();

  formData.append("image", renamedImageFile);

  const response = await fetch(`${BASE_URL}/images/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = (await response.json()) as ImageUploadResponse | ErrorResponse;

  if (!response.ok) {
    const error = new Error(
      (data as ErrorResponse).message || "이미지를 업로드하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }

  return (data as ImageUploadResponse).url;
}

export async function addProductFavorite(
  productId: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/products/${productId}/favorite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const data = (await response.json()) as ErrorResponse;

    const error = new Error(
      data.message || "좋아요를 추가하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }
}

export async function removeProductFavorite(
  productId: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/products/${productId}/favorite`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const data = (await response.json()) as ErrorResponse;

    const error = new Error(
      data.message || "좋아요를 취소하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }
}

export async function deleteProduct(
  productId: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const data = (await response.json()) as ErrorResponse;
    const error = new Error(
      data.message || "상품을 삭제하지 못했습니다.",
    ) as ApiError;

    error.status = response.status;
    throw error;
  }
}
