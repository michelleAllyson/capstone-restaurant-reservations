const tablesService = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

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



module.exports = {
    create: [
        hasOnlyValidProperties,
        hasRequiredProperties,
        asyncErrorBoundary(create),
    ]
};
