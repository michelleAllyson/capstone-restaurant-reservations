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
    "status",
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

  async function create(req, res, next) {
    const {
      data: {
        first_name,
        last_name,
        mobile_number,
        reservation_date,
        reservation_time,
        people,
        status = 'booked'
      } = {},
    } = req.body;
  
    const validStatuses = ['booked', 'seated', 'finished', 'cancelled'];
  
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
        message: "people must be a positive integer."
      });
    }
  
    if (status !== 'booked') {
      return next({
        status: 400,
        message: `Invalid status: ${status}. New reservations can only have a status of 'booked'.`
      });
    }
  
    const reservation = await reservationsService.create({
      first_name,
      last_name,
      mobile_number,
      reservation_date,
      reservation_time,
      people,
      status
    });
  
    res.status(201).json({ data: reservation });
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
  
function onlyFutureReservations(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const now = Date.now();
  const proposedReservationDate = new Date(`${reservation_date} ${reservation_time}`).valueOf();
  if (proposedReservationDate < now) {
    return next({
      status: 400,
      message: "Reservation must be in the future." 
    });
  }
  next();
}

function isWithinBusinessHours(req, res, next) {
  const { reservation_time } = req.body.data;
  const now = Date.now();
  const proposedReservationTime = new Date(`1970-01-01 ${reservation_time}`).getHours();
  if (proposedReservationTime < 10 || proposedReservationTime >= 21) {
    return next({
      status: 400,
      message: "Reservation must be between 10:30 AM and 9:30 PM." 
    });
    if (proposedReservationTime < now) {
      return next({
        status: 400,
        message: "Reservation must be in the future." 
      });
    }
  }
  next();

}

function notTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  const proposedReservationDate = new Date(reservation_date).getUTCDay();
  if (proposedReservationDate === 2) {
    return next({
      status: 400,
      message: "Restaurant is closed on Tuesdays." 
    });
  }
  next();
}



  /**
   * List handler for reservation resources
   */
  async function list(req, res) {
    const date = req.query.date;
    const mobile_number = req.query.mobile_number;
    const data = await (date 
      ? reservationsService.list(date)
      : reservationsService.search(mobile_number));
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

async function update(req, res, next) {
  const {
    data: {
      reservation_date,
      reservation_time,
      people,
    } = {},
  } = req.body;

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
      message: "people must be a positive integer."
    });
  }
  
  const updatedRes = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
    reservation_date: req.body.data.reservation_date,
    reservation_time: req.body.data.reservation_time,
    people: req.body.data.people,
  };
  const data = await reservationsService.update(updatedRes);
  res.status(200).json({ data });
}

async function updateStatus(req, res, next) {
  const { reservation_id } = req.params;
  const { status } = req.body.data;

  const validStatuses = ['booked', 'seated', 'finished', 'cancelled'];

  // Check if the provided status is valid
  if (!validStatuses.includes(status)) {
    return next({
      status: 400,
      message: `Invalid status: ${status}. Status must be one of ${validStatuses.join(", ")}.`,
    });
  }

  // Check if the reservation is currently finished
  const currentReservation = res.locals.reservation;
  if (currentReservation.status === 'finished' || currentReservation.status === 'cancelled') {
    return next({
      status: 400,
      message: 'A finished or cancelled reservation cannot be updated.',
    });
  }

  // Update the reservation status
  const updatedReservation = await reservationsService.update({
    reservation_id,
    status,
  });

  res.status(200).json({ data: updatedReservation });
}


module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(read)],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties, 
    notTuesday,
    onlyFutureReservations,
    isWithinBusinessHours,
    asyncErrorBoundary(create)],
  update: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    onlyFutureReservations,
    isWithinBusinessHours,
    reservationExists,
    asyncErrorBoundary(update)],
  updateStatus: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(updateStatus)],
  reservationExists: [asyncErrorBoundary(reservationExists)],
};




