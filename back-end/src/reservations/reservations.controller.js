const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name", 
  "mobile_number", 
  "reservation_date", 
  "reservation_time", 
  "people"
  );
  
  const VALID_PROPERTIES = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
    "reservation_id",
    "created_at",
    "updated_at",
  ];
  
  function hasOnlyValidProperties(req, res, next) {
    const { data = {} } = req.body;

    const invalidFields = Object.keys(data).filter(
      (field) => !VALID_PROPERTIES.includes(field)
    );

    if (invalidFields.length) {
      return next ({
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }
    next();
  }


  function create(req, res, next) {
    const { data: { first_name, last_name, reservation_date, reservation_time, people } = {} } = req.body;
    
    //Check to see if first_name is missing or empty
    if (!first_name || first_name === "") {
      return next({
        status: 400,
        message: "first_name is missing or empty."
      });
    }

    //Check to see if last_name is missing or empty
    if (!last_name || last_name === "") {
      return next({
        status: 400,
        message: "last_name is missing or empty."
      });
    }

    //Check to see if mobile_number is missing or empty
    if (!mobile_number || mobile_number === "") {
      return next({
        status: 400,
        message: "mobile_number is missing or empty."
      });
    }

    //Check to see if reservation_date is missing or empty
    if (!reservation_date || reservation_date === "") {
      return next({
        status: 400,
        message: "reservation_date is missing or empty."
      });
    }

    //Check to see if reservation_time is missing or empty
    if (!reservation_time || reservation_time === "") {
      return next({
        status: 400,
        message: "reservation_time is missing or empty."
      });
    }

    //Check to see if people is missing or empty
    if (!people || people === "") {
      return next({
        status: 400,
        message: "people is missing or empty."
      });
    }
  }

  async function reservationExists(req, res, next) {
    const reservationId = req.params.reservation_id;
    const reservation = await reservationsService.read(reservationId);
    if (reservation) {
      res.locals.reservation = reservation;
      return next();
    }
    next({
      status: 404,
      message: `Reservation cannot be found.`,
    });
  }

  // function hasValidDate(req, res, next) {
  //   const { data = {} } = req.body;
  // }

  // function hasValidTime(req, res, next) {}

  // function hasValidPeople(req, res, next) {}

  // function hasValidStatus(req, res, next) {}

  //function isNotTuesday(req, res, next) {}

  //function isNotPast(req, res, next) {}
  



  /**
   * List handler for reservation resources
   */
async function list(req, res) {
  const data = await reservationsService.list();
  res.json({ data });
}

async function read(req, res) {
  res.json({ data: res.locals.reservation });
}


module.exports = {
  hasOnlyValidProperties: [hasOnlyValidProperties],
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(read)],
  create: [hasRequiredProperties, asyncErrorBoundary(create)],
  reservationExists: [asyncErrorBoundary(reservationExists)],
};
