exports.up = async function (knex) {
  await knex.schema.createTable('alba_integration', table => {
    table.increments('alba_integration_id');

    table.integer('congregation_id').references('congregation.congregationId');
    table.string('account', 128).notNullable();
    table.string('language', 128).nullable();
    table.string('source', 128).notNullable();
    table.timestamps();
  });

  await knex.raw(`
    insert into alba_integration(congregation_id, account, language, source)
    select ci."destinationCongregationId", c."name", c."language", case when c."name" like '%Old Apex Spanish%' then 'SYTHETIC_ALBA__OLD_APEX_SPANISH' else 'ALBA' end 
    from "congregationIntegration" ci
    inner join "congregation" c on ci."sourceCongregationId" = c."congregationId";
  `);

  // Start renaming tables and keys to use snake case to avoid needing quoted identifiers
  await knex.schema.createTable('congregation_location_activity', table => {
    table.bigincrements('congregation_location_activity_id');
    table.biginteger('location_id').references('location.locationId');
    table.biginteger('congregation_id').references('congregation.congregationId');
    table.varchar('operation', 1).notNullable();
    table.varchar('source', 32).notNullable();
    table.timestamps();
  });

  // Switching usage of congregationId from the source congregation to now mean the destination congregation (which is the one that's doing the import)
  await knex.raw(`
    insert into congregation_location_activity(congregation_location_activity_id, location_id, congregation_id, operation, source)
    select cla."congregationLocationActivityId", cla."locationId", cli."destinationCongregationId", cla.operation, cla.source
    from "congregationLocationActivity" cla
    inner join "congregationIntegration" cli on cla."congregationId" = cli."sourceCongregationId";
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTable('congregation_location_activity');
  return knex.schema.dropTable('alba_integration');
};
