const tablesService = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const { table } = require("../db/connection");

const hasRequiredProperties = hasProperties("table_name", "capacity");

const VALID_PROPERTIES = [
    "table_id",
    "table_name",
    "capacity",
    "reservation_id",
    "table_status",
    ];

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
    try {
        const table = await tablesService.read(tableId);
        if (table) {
            res.locals.table = table;
            return next();
        }
        return next({
            status: 404,
            message: `Table with id ${tableId} cannot be found.`,
        });
    } catch (error) {
        next(error);
    }
}

async function create (req, res, next) {
    const { data: { table_name, capacity, reservation_id, table_status } = {} } = req.body;

    if ( !table_name || table_name === "") {
        return next({
            status: 400,
            message: "table_name is missing or empty.",
        });
    }

    if ( table_name.length < 2 ) {
        return next({
            status: 400,
            message: "table_name must be at least 2 characters long.",
        });
    }

    if ( !capacity || capacity === "") {
        return next({
            status: 400,
            message: "capacity is missing or empty.",
        });
    }

    if (isNaN(capacity) || capacity <= 0 ) {
        return next({
            status: 400,
            message: "capacity must be a number greater than zero.",
        });
    }


    if (table_status === "occupied") {
        return next({
            status: 400,
            message: `Table status cannot be occupied when creating a new table.`,
        });
    }
    
        const newTable = await tablesService.create(req.body.data)
        res.status(201).json({ data: newTable }); 

}

async function list(req, res) {
    const data = await tablesService.list();
    res.json({ data });
}

async function read(req, res) {
    const table = res.locals.table;
    res.json({ data: table });
}



module.exports = {
    list: [asyncErrorBoundary(list)],
    read: [tableExists, asyncErrorBoundary(read)],
    create: [
        hasOnlyValidProperties,
        hasRequiredProperties,
        asyncErrorBoundary(create),
    ],
    tableExists: [asyncErrorBoundary(tableExists)],
};
