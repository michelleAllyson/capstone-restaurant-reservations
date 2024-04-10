const knex = require("../db/connection");

const tableName = "reservations";


function read(reservation_id) {
    return knex(tableName)
        .select("*")
        .where({ reservation_id })
        .first();
}


function list(date) {
    return knex(tableName)
        .select("*");
}

module.exports = {
    read,
    list,
};