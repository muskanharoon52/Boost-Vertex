/**
 * Pagination utility for list endpoints
 *
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 10, max: 100)
 * - sort: sort field (default: -createdAt for descending)
 *
 * Returns pagination metadata with query object for Mongoose
 */

const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const sort = query.sort || '-createdAt';

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    sort,
  };
};

const buildPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  getPaginationParams,
  buildPaginationMeta,
};
