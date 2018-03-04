exports.up = function (knex, Promise) {
  return knex.schema.createTable('alba_session', table => {
    table.increments('alba_session_id');
    table.jsonb('payload').notNull();
    table.integer('row_count').notNull();
    table.timestamp('create_timestamp').defaultTo(knex.fn.now());
    table.integer('congregation_id').references('congregation.congregationId').notNull();
    table.integer('version').notNull();
    table.integer('user_id').notNull();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('alba_session');
};
