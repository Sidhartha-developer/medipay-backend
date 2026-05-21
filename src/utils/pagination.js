const paginate = async (Model, query = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { createdAt: -1 }, populate = [] } = options;
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Model.countDocuments(query);
  let q = Model.find(query).sort(sort).skip(skip).limit(Number(limit));
  populate.forEach((p) => { q = q.populate(p); });
  const data = await q.lean();
  return { data, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};
module.exports = paginate;
