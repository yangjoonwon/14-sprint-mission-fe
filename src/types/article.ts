export type Article = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type ArticleSummary = Pick<
  Article,
  "id" | "title" | "content" | "createdAt"
>;

export type ArticleSort = "recent" | "oldest";

export type ArticleListResponse = {
  list: ArticleSummary[];
  totalCount: number;
};
