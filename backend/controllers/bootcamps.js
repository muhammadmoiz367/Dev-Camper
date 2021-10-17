const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geoCoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');

//@desc         get all bootcamps
//@route        GET /api/v1/bootcamps
//@access       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
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
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
  
  //select query
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  
  //sort query
  if(req.query.sort){
    const sortBy=req.query.sort.split(',').join(' ')
    queryStr=query.sort(sortBy)
  }else{
    queryStr=query.sort('-createdAt')
  }

  //pagination and limit
  const limit=parseInt(req.query.limit, 10) || 25
  const page=parseInt(req.query.page, 10) || 1
  const startIndex=(page-1) * limit
  const endIndex=page*limit
  const total=await Bootcamp.countDocuments()

  query=query.skip(startIndex).limit(limit)

  //execute query
  const bootcamps = await query;

  //set pagination object
  let pagination={}
  if(endIndex<total){
    pagination.next={
      page: page+1,
      limit
    }
  }
  if(startIndex>0){
    pagination.prev={
      page: page-1,
      limit
    }
  }

  res.status(200).json({
    success: true,
    pagination,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@desc         create new bootcamp
//@route        POST /api/v1/bootcamps
//@access       Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@desc         get specific bootcamp
//@route        GET /api/v1/bootcamps/:id
//@access       Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp not found with id ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

//@desc         update specific bootcamp
//@route        PUT /api/v1/bootcamps/:id
//@access       Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp not found with id ${req.params.id}`)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc         delete specific bootcamp
//@route        DELETE /api/v1/bootcamps/:id
//@access       Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp not found with id ${req.params.id}`)
    );
  }
  bootcamp.remove()
  res.status(200).json({ success: true, data: {} });
});

//@desc         get bootcamp by radius
//@route        GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access       Private
exports.getBootcampByRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance, unit } = req.params;
  // Get lat/lng from geocoder
  const loc = await geoCoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  let radius = 0;
  if (unit === 'km') {
    radius = distance / 6378;
  } else if (unit === 'mi') {
    radius = distance / 3963;
  }

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
