
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON tables TO thalba;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, USAGE ON sequences TO thalba;


create table "congregation" (
    "congregationId" SERIAL PRIMARY KEY,
    "name" varchar(255) not null,
    "language" varchar(64) not null
);

insert into "congregation" values (1, 'Bond Park', 'ENGLISH');
insert into "congregation" values (2, 'Triangle Park Hindi', 'HINDI');

create table "territory" (
    "territoryId" BIGSERIAL PRIMARY KEY,
    "congregationId" int not null,
    "name" varchar(256),
    "boundary" polygon not null,
    "userDefined1" text,
    "userDefined2" text,
    "externalTerritoryId" varchar(256),
    "externalTerritorySource" varchar(32),
    foreign key("congregationId") references "congregation"("congregationId")
);

create table "location" (
    "locationId" BIGSERIAL PRIMARY KEY,
    "latitude" numeric(20, 18),
    "longitude" numeric(20, 18),
    "addressLine1" varchar(255),
    "addressLine2" varchar(255),
    "city" varchar(255),
    "postalCode" varchar(255),
    "province" varchar(255),
    "countryCode" varchar(255),
    "externalLocationId" varchar(512),
    "externalLocationLastRefreshedDateTime" varchar(32),
    "externalSource" varchar(32)
);

create table "congregationLocation" (
    "congregationId" int not null,
    "locationId" bigint not null,
    "language" varchar(64) not null,
    "territoryId" bigint,
    "source" varchar(64) null, -- ALBA, TERRITORY HELPER TODO add enumeration
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
    primary key("congregationId", "locationId")
);

create table "geocodeResponse" (
    "geocodeResponseId" BIGSERIAL primary key,
    "address" varchar(256) unique,
    "response" jsonb,
    "source" varchar(32) not null
);

create table "congregationLocationActivity" (
    "congregationLocationActivityId" BIGSERIAL primary key,
    "locationId" bigint not null,
    "congregationId" int not null,
    "operation" char(1) not null,
    "source" varchar(32) not null,
    foreign key("congregationId") references "congregation"("congregationId"),
    foreign key("locationId") references "location"("locationId")
);
/*

delete from "congregationLocation";
delete from "location";
delete from "territory";

*/
