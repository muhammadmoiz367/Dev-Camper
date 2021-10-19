const path = require('path');

const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geoCoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advanceResult');

//@desc         get all bootcamps
//@route        GET /api/v1/bootcamps
//@access       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  bootcamp.remove();
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

//@desc         upload bootcamp picture
//@route        GET /api/v1/bootcamps/:id/photo
//@access       Private
exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp not found with id ${req.params.id}`)
    );
  }
  //check file
  if (!req.files) {
    return next(new ErrorResponse(400, `Please upload a file`));
  }
  const file = req.files.files;
  console.log(file);

  //check filetype
  if (!file.mimetype.startsWith('image')) {
    return next(
      new ErrorResponse(400, `Invalid file. Please upload an image file`)
    );
  }

  //check file size
  if (!file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        400,
        `Please upload an image with size less than ${process.env.MAX_FILE_SIZE}`
      )
    );
  }

  //create file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  console.log('file name ', file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse(500, `Problem with file upload`));
    }
    const bootcamp = await Bootcamp.findByIdAndUpdate(
      req.params.id,
      { photo: file.name },
      {
        new: false,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: bootcamp,
    });
  });
});
