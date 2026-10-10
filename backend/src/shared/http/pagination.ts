import { Request } from 'express';

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(req: Request, defaultLimit = 20, maxLimit = 100): PaginationQuery {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total
  };
}
