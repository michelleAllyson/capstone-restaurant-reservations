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

  async function reservationExists(req, res, next) {
    const reservationId = req.params.reservation_id;
    try {
      const reservation = await reservationsService.read(reservationId);
      if (reservation) {
        res.locals.reservation = reservation;
        return next();
      }
      return next({
        status: 404,
        message: `Reservation with id ${reservationId} cannot be found.`,
      });
    } catch (error) {
      next(error);
    }
  }


  function create(req, res, next) {
    const { data: { first_name, last_name, mobile_number, reservation_date, reservation_time, people } = {} } = req.body;
    
    if (!first_name || first_name.trim() === "") {
        return next({
            status: 400,
            message: "first_name is missing or empty."
        });
    }

    if (!last_name || last_name.trim() === "") {
        return next({
            status: 400,
            message: "last_name is missing or empty."
        });
    }

    if (!mobile_number || mobile_number.trim() === "") {
        return next({
            status: 400,
            message: "mobile_number is missing or empty."
        });
    }

    if (!reservation_date || reservation_date.trim() === "") {
        return next({
            status: 400,
            message: "reservation_date is missing or empty."
        });
    }

    if (!reservation_time || reservation_time.trim() === "") {
        return next({
            status: 400,
            message: "reservation_time is missing or empty."
        });
    }

    if (!people || isNaN(people) || people <= 0) {
        return next({
            status: 400,
            message: "people must be a positive integer."
        });
    }

    if (!isValidDate(reservation_date)) {
      return next({
          status: 400,
          message: "Invalid reservation_date."
      });
  }

  if (!isValidTime(reservation_time)) {
      return next({
          status: 400,
          message: "Invalid reservation_time."
      });
  }

  if (!Number.isInteger(people) || people <= 0) {
      return next({
          status: 400,
          message: "People must be a positive integer."
      });
  }

  next();
}

function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false;  // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
}

function isValidTime(timeString) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString);
}

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

async function read(req, res, next) {
  const { reservation_id } = req.params;
  try {
      const reservation = await reservationsService.read(reservation_id);
      if (reservation) {
          res.json({ data: reservation });
      } else {
          next({
              status: 404,
              message: `Reservation with id ${reservation_id} not found.`,
          });
      }
  } catch (error) {
      next(error);
  }
}



module.exports = {
  hasOnlyValidProperties: [hasOnlyValidProperties],
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(read)],
  create: [hasRequiredProperties, asyncErrorBoundary(create)],
  reservationExists: [asyncErrorBoundary(reservationExists)],
};
