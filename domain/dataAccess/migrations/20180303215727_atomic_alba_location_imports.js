exports.up = async function (knex, Promise) {
  await knex.schema.createTable('alba_location_import', table => {
    table.increments('id');
    table.jsonb('payload').notNull();
    table.integer('row_count').notNull();
    table.timestamp('create_timestamp').defaultTo(knex.fn.now());
    table.integer('congregation_id').references('congregation.congregationId').notNull();
    table.integer('version').notNull();
    table.integer('user_id').notNull();
    table.jsonb('pending_location_deletions');
    table.jsonb('congregation_integration_analysis');
    table.jsonb('summary');
  });

  await knex.schema.createTable('alba_location_import_by_location', table => {
    table.increments('id');
    table.integer('alba_location_import_id').references('alba_location_import.id').onDelete('CASCADE');
    table.string('alba_id', 16).notNull();
    table.jsonb('payload').notNull();
    table.timestamp('create_timestamp').defaultTo(knex.fn.now());
    table.jsonb('congregation_integration');
    table.jsonb('translated_location');
    table.jsonb('translated_congregation_location');
    table.jsonb('operation');
    table.boolean('is_done').defaultTo(false);
  });

};

exports.down = async function (knex, Promise) {
  await knex.schema.dropTable('alba_location_import_by_location');
  await knex.schema.dropTable('alba_location_import');
};
