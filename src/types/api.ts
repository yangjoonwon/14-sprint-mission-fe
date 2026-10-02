export type ErrorResponse = {
  message?: string;
};

export type ApiError = Error & {
  status: number;
};
