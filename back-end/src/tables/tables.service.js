const knex = require("../db/connection");


function create(newTable) {
    return knex("tables") 
    .insert({
        ...newTable,
        "table_status": newTable.reservation_id ? "occupied" : "free",
    })
    .returning("*")
}


function read(table_id) {
    return knex("tables as t")
        .join("reservations as r", "t.reservation_id", "r.reservation_id")
        .select(
            "t.*",
            "r.first_name",
            "r.last_name",
            "r.mobile_number",
            "r.reservation_date",
            "r.reservation_time",
            "r.people",
            "r.reservation_id"
        )
}

function readReservation(reservation_id) {
    return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();
}

function readTable(table_id) {
    return knex("tables")
    .select("*")
    .where({ table_id })
    .first();
}

function list() {
    return knex("tables")
        .select("*")
        .orderBy("table_name");
}

function update(reservation_id, table_id) {
    return knex("tables")
    .where({ table_id: table_id })
    .update({ reservation_id: reservation_id })
    .returning("*")
}


module.exports = {
    list,
    read,
    create,
    readReservation,
    readTable,
    update,
};
