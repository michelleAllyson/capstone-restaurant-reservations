const router = require("express").Router();
const controller = require("./tables.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
    .route("/")
    .post(controller.create)
    .get(controller.list)
    .all(methodNotAllowed);

//return to this later    
// router
//     .route("/:table_id/seat")
//     .all(methodNotAllowed);


module.exports = router;