export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  images: string[];
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductOrder = "recent" | "favorite";

export type ProductDetail = Product & {
  ownerId: string;
  ownerNickname: string;
  isFavorite: boolean;
};

export type ProductPayload = Pick<
  Product,
  "name" | "description" | "price" | "tags" | "images"
>;

export type ProductListResponse = {
  list: Product[];
  totalCount: number;
};
