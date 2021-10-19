const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //query string
  let queryStr = JSON.stringify(req.query);
  const queryParam = { ...req.query };

  //fields to exclude
  const removeFields = ['select', 'sort'];
  removeFields.forEach((item) => delete queryParam[item]);

  //set query for $gt, $lte
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //query apply on model
  query = model.find(JSON.parse(queryStr));

  //select query
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //sort query
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    queryStr = query.sort(sortBy);
  } else {
    queryStr = query.sort('-createdAt');
  }

  //pagination and limit
  const limit = parseInt(req.query.limit, 10) || 25;
  const page = parseInt(req.query.page, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //pagination
  if (populate) {
    query = query.populate(populate);
  }

  //execute query
  const results = await query;

  //set pagination object
  let pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    pagination,
    count: results.length,
    data: results,
  };
  next();
};

module.exports = advancedResults;
