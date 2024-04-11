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

  function hasValidDate(req, res, next) {
    const { data = {} } = req.body;
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
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(read)],
  reservationExists: [asyncErrorBoundary(reservationExists)],
};
