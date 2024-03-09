exports.up = function(knex) {
  return Promise.all([
    knex.schema.raw(`
create table "congregation" (
    "congregationId" SERIAL PRIMARY KEY,
    "name" varchar(255) not null,
    "language" varchar(64) not null
);
  `),

    knex.schema.raw(
      `insert into "congregation" values (1, 'Test Local Language', 'English');`,
    ),
    knex.schema.raw(
      `insert into "congregation" values (2, 'Test Foreign Language', 'Hindi');`,
    ),

    knex.schema.raw(`
create table "territory" (
    "territoryId" BIGSERIAL PRIMARY KEY,
    "congregationId" int not null,
    "name" varchar(256),
    "boundary" polygon not null,
    "userDefined1" text,
    "userDefined2" text,
    "externalTerritoryId" varchar(256),
    "externalTerritorySource" varchar(32),
    "deleted" boolean not null default false,
    foreign key("congregationId") references "congregation"("congregationId")
);
  `),

    knex.schema.raw(`
create table "location" (
    "locationId" BIGSERIAL PRIMARY KEY,
    "latitude" numeric(21, 18),
    "longitude" numeric(21, 18),
    "number" varchar(255),
    "sec_unit_type" varchar(255),
    "sec_unit_num" varchar(255),
    "street" varchar(255),
    "city" varchar(255),
    "zip" varchar(255),
    "state" varchar(255),
    "countryCode" varchar(255),
    "externalLocationId" varchar(512),
    "externalLocationLastRefreshedDateTime" varchar(32),
    "externalSource" varchar(32)
);  
  `),

    knex.schema.raw(`
create table "congregationLocation" (
    "congregationId" int not null,
    "locationId" bigint not null,
    "language" varchar(64) not null,
    "territoryId" bigint,
    "source" varchar(64) not null,
    "sourceData" jsonb,
    "sourceLocationId" varchar(64),
    "isPendingTerritoryMapping" boolean not null,
    "isDeleted" boolean not null,
    "isActive" boolean not null,
    "notes" text,
    "userDefined1" text,
    "userDefined2" text,
    foreign key("congregationId") references "congregation"("congregationId"),
    foreign key("territoryId") references "territory"("territoryId"),
    foreign key("locationId") references "location"("locationId"),
    primary key("congregationId", "locationId", "source")
);  
  `),

    knex.schema.raw(`
create table "geocodeResponse" (
    "geocodeResponseId" BIGSERIAL primary key,
    "address" varchar(256) unique,
    "response" jsonb,
    "source" varchar(32) not null
);  
  `),

    knex.schema.raw(`
create table "congregationLocationActivity" (
    "congregationLocationActivityId" BIGSERIAL primary key,
    "locationId" bigint not null,
    "congregationId" int not null,
    "operation" char(1) not null,
    "source" varchar(32) not null,
    foreign key("congregationId") references "congregation"("congregationId"),
    foreign key("locationId") references "location"("locationId")
);  
  `),

    knex.schema.raw(`
create table "exportActivity" (
    "exportActivityId" BIGSERIAL primary key,
    "congregationId" int not null,
    "lastCongregationLocationActivityId" bigint not null,
    "destination" varchar(32),
    foreign key("congregationId") references "congregation"("congregationId")
);  
  `),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('exportActivity'),
    knex.schema.dropTable('congregationLocationActivity'),
    knex.schema.dropTable('geocodeResponse'),
    knex.schema.dropTable('congregationLocation'),
    knex.schema.dropTable('location'),
    knex.schema.dropTable('territory'),
    knex.schema.dropTable('congregation'),
  ]);
};
