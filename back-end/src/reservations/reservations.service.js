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

function create(reservation) {
    return knex(tableName)
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function update(updatedReservation) {
    return knex(tableName)
    .select("*")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then((updatedRecords) => updatedRecords[0]);
}
function search(mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date");
  }


module.exports = {
    read,
    list,
    create,
    update,
    search,
};