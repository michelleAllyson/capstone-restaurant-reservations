const tablesService = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const { table } = require("../db/connection");

const hasRequiredProperties = hasProperties("table_name", "capacity");
const hasReservationId = hasProperties("reservation_id");

const VALID_PROPERTIES = [
    "table_name",
    "table_status",
    "table_id",
    "capacity",
    "reservation_id",
    ];

function hasData(req, res, next) {
    if (req.body.data) {
        return next();
    } else {
        next({
            status: 400,
            message: "Data is missing.",
        });
    }
}

function hasValidProperties(req, res, next) {
    const { data: { table_name, capacity } } = req.body;

    if (!table_name || table_name === "") {
        return next({
            status: 400,
            message: "table_name is missing or empty.",
        });
    }
    if (table_name.length < 2) {
        return next({
            status: 400,
            message: "table_name must be at least 2 characters long.",
        });
    }
    if (!capacity || capacity === "") {
        return next({
            status: 400,
            message: "capacity is missing or empty.",
        });
    }
    if (isNaN(capacity) || capacity <= 0) {
        return next({
            status: 400,
            message: "capacity must be a number greater than zero.",
        });
    }
    if (typeof(capacity) !== "number") {
        return next({
            status: 400,
            message: "capacity must be a number.",
        });
    } 
    next();     
}

function hasOnlyValidProperties(req, res, next) {
    const { data = {} } = req.body;

    const invalidFields = Object.keys(data).filter(
        (field) => !VALID_PROPERTIES.includes(field)
    );

    if(invalidFields.length) {
        return next ({
            status: 400,
            message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

async function tableExists(req, res, next) {
    const tableId = req.params.table_id; 
    const table = await tablesService.read(tableId);
        if (table) {
            res.locals.table = table;
            return next();
        }
        return next({
            status: 404,
            message: `Table with id ${tableId} cannot be found.`,
        });
    }

async function reservationExists(req, res, next) {
    const reservation = await tablesService.readReservation(req.body.data.reservation_id);
    if (reservation) {
      res.locals.reservation = reservation;
      return next();
    }
    next({
      status: 404,
      message: `reservation_id ${req.body.data.reservation_id} does not exist`,
    })
  }

  function hasSufficientCapacity(req, res, next) {
    const { table, reservation } = res.locals;
    if (table.capacity < reservation.people) {
      return next({
        status: 400,
        message: "Table does not have sufficient capacity for this reservation",
      });
    }
    next();
  }
  

  function isNotOccupied(req, res, next) {
    const { table } = res.locals;
    if (table.reservation_id === null) {
        return next({
            status: 400,
            message: "Table is not occupied.",
        });
    }
    next();
  }

  function isOccupied(req, res, next) {
    const { table } = res.locals;
    if (table.reservation_id) {
        return next({
            status: 400,
            message: "Table is occupied.",
        });
    }
    next();
  }


function tableIsNotSeated(req, res, next) {
    if (res.locals.reservation.status === "seated") {
        return next({
            status: 400,
            message: "Reservation is already seated.",
        });
    }
    next();
}

  function updateData(req, res, next) {
    const { reservation_id } = req.body.data;
    if (!reservation_id) {
        return next({
            status: 400,
            message: "reservation_id is missing.",
        });
    }
    next();
    }
    
  async function create(req, res) {
  const newTable = req.body.data;
    const data = await tablesService.create(newTable);
    res.status(201).json({ data });
  }

async function list(req, res) {
    const data = await tablesService.list();
    res.json({ data });
}

async function read(req, res) {
    const table = res.locals.table;
    res.json({ data: table });
}

// async function update(req, res, next) {
//     const { reservation_id } = req.body.data;
//     const { table_id } = req.params;
//     const data = await tablesService.update(reservation_id, Number(table_id));
//     res.json({ data });
// }

async function update(req, res, next) {
    const table_id = req.params.table_id;
    const reservation_id = req.body.data.reservation_id;
    const data = await tablesService.update(table_id, reservation_id);
    res.json({ data });
}


async function destroy(req, res) {
    const reservation_id = res.locals.table.reservation_id;
    const { table_id } = req.params;
    const data = await tablesService.destroy(reservation_id, table_id);
    res.status(200).json({ data });
}

module.exports = {
    list: [asyncErrorBoundary(list)],
    read: [tableExists, asyncErrorBoundary(read)],
    create: [
        hasData,
        hasValidProperties,
        hasOnlyValidProperties,
        hasRequiredProperties,
        asyncErrorBoundary(create),
    ],
    update: [
        hasData,
        hasReservationId,
        reservationExists,
        tableExists,
        isOccupied,
        updateData,
        tableIsNotSeated,
        hasSufficientCapacity,
        asyncErrorBoundary(update),
    ],
    destroy: [
        asyncErrorBoundary(tableExists),
        tableExists,
        isNotOccupied,
        asyncErrorBoundary(destroy),
    ],
};

