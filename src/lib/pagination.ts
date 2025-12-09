export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function calculatePagination(
  totalItems: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

export function getSupabasePaginationParams(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { from, to };
}

export async function paginateSupabaseQuery<T>(
  query: any,
  page: number,
  pageSize: number
): Promise<PaginationResult<T>> {
  const { from, to } = getSupabasePaginationParams(page, pageSize);

  const countQuery = query;
  const { count } = await countQuery.select('*', { count: 'exact', head: true });

  const totalItems = count || 0;

  const { data, error } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    pagination: calculatePagination(totalItems, page, pageSize),
  };
}

export function paginateArray<T>(
  array: T[],
  page: number,
  pageSize: number
): PaginationResult<T> {
  const totalItems = array.length;
  const { from, to } = getSupabasePaginationParams(page, pageSize);

  const data = array.slice(from, to + 1);

  return {
    data,
    pagination: calculatePagination(totalItems, page, pageSize),
  };
}

export function usePaginationState(initialPageSize = 10) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const goToPage = (newPage: number) => {
    setPage(Math.max(1, newPage));
  };

  const nextPage = () => {
    setPage((prev) => prev + 1);
  };

  const previousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const reset = () => {
    setPage(1);
  };

  return {
    page,
    pageSize,
    setPage: goToPage,
    setPageSize,
    nextPage,
    previousPage,
    reset,
  };
}

import React from 'react';
