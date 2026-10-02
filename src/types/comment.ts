export type BaseComment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CommentWriter = {
  id: string;
  nickname: string;
  image: string | null;
};

export type ProductComment = BaseComment & {
  writer: CommentWriter;
};

export type ProductCommentListResponse = {
  list: ProductComment[];
};
