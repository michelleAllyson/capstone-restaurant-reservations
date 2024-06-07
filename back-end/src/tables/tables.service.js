const knex = require("../db/connection");


function create(table) {
    return knex("tables")
      .insert(table)
      .returning("*")
      .then((createdRecords) => createdRecords[0]);
  }

  function read(table_id) {
    return knex("tables")
        .select("*")
        .where({ table_id })
        .first();
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

// function update(reservation_id, table_id) {
//     return knex("tables")
//     .where({ table_id: table_id })
//     .update({ reservation_id: reservation_id })
//     .returning("*")
// }

function update(table_id, reservation_id) {
    return knex.transaction((trx) => {
      return trx("tables")
        .where({ table_id })
        .update({ reservation_id })
        .then(() => {
          return trx("reservations")
            .where({ reservation_id })
            .update({ status: "seated" });
        }
        );
    }
    );
}


function destroy(reservation_id, table_id) {
    return knex.transaction((trx) => {
      return trx("reservations")
        .where({ reservation_id })
        .update({ status: "finished" })
        .then(() => {
          return trx("tables")
            .where({ table_id })
            .update({ reservation_id: null });
        });
    }
    );
}


module.exports = {
    list,
    read,
    create,
    readReservation,
    readTable,
    update,
    destroy,
};
