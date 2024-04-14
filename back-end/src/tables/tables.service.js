const knex = require("../db/connection");

const tableName = "tables";

function list() {
    return knex(tableName)
        .select("*")
        .orderBy("table_name");
}

function read(table_id) {
    return knex(tableName)
        .select("*")
        .where({ table_id })
        .first();
}

function create (table) {
    return knex (tableName)
    .insert(table)
    .returning("*")
    .then((createRecords) => createRecords[0]);
}



module.exports = {
    list,
    read,
    create,
};
