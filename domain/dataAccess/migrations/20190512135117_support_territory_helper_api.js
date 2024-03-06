
exports.up = async function(knex) {
  await knex.schema.table('territory', table => {
    table.text('externalTerritoryName');
  });

  await knex.schema.table('congregationLocation', table => {
    table.text('sourceAccount');
  });

  await knex.raw(`
    UPDATE territory SET "externalTerritoryName" = "externalTerritoryId", "externalTerritoryId" = null;
  `);

  await knex.raw(`
    UPDATE territory SET "externalTerritorySource" = 'TERRITORY_HELPER' WHERE "externalTerritorySource" = 'TERRITORY HELPER';
  `);

  await knex.raw(`
    ALTER TABLE "congregationLocation" DROP CONSTRAINT "congregationLocation_pkey";
  `);

  await knex.raw(`
    ALTER TABLE "congregationLocation" ADD PRIMARY KEY ("congregationId", "locationId", source, "sourceLocationId");
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    UPDATE territory SET "externalTerritoryId" = "externalTerritoryName";
  `);

  await knex.raw(`
    UPDATE territory SET "externalTerritorySource" = 'TERRITORY HELPER' WHERE "externalTerritorySource" = 'TERRITORY_HELPER';
  `);

  await knex.schema.table('territory', table => {
    table.dropColumn('externalTerritoryName');
  });

  await knex.schema.table('congregationLocation', table => {
    table.dropColumn('sourceAccount');
  });

  await knex.raw(`
    ALTER TABLE "congregationLocation" DROP CONSTRAINT "congregationLocation_pkey";
  `);

  await knex.raw(`
    ALTER TABLE "congregationLocation" ADD PRIMARY KEY ("congregationId", "locationId", source);
  `);
};
