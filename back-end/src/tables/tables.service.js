const knex = require("../db/connection");

const tableName = "tables";

function create (newTable) {
    return knex (tableName)
    .insert({
        ...newTable,
        "table_status": newTable.reservation_id ? "occupied" : "free",
    })
    .returning("*")
    .then((createRecords) => createRecords[0]);
}

function read(table_id) {
    return knex(tableName)
    .select("*")
    .where({ "table_id" : table_id })
    .first();
}

function readReservation(reservation_id) {
    return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();
}



function list() {
    return knex(tableName)
        .select("*")
        .orderBy("table_name");
}

module.exports = {
    list,
    read,
    create,
    readReservation,
};
