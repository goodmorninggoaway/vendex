
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON tables TO thalba;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, USAGE ON sequences TO thalba;



create table "language" (
    "languageId" SERIAL PRIMARY KEY,
    "language" varchar(255) not null
);

insert into "language" values (1, 'English');
insert into "language" values (2, 'Hindi');

create table "congregation" (
    "congregationId" SERIAL PRIMARY KEY,
    "name" varchar(255) not null,
    "languageId" int,
    foreign key("languageId") references "language"("languageId")
);

insert into "congregation" values (1, 'Bond Park', 1);
insert into "congregation" values (2, 'Triangle Park Hindi', 2);

create table "territory" (
    "territoryId" BIGSERIAL PRIMARY KEY,
    "congregationId" int not null,
    foreign key("congregationId") references "congregation"("congregationId")
);

create table "territoryVertex" (
    "territoryId" bigint,
    "latitude" numeric(20, 18),
    "longitude" numeric(20, 18),
    foreign key("territoryId") references "territory"("territoryId"),
    primary key("territoryId", "latitude", "longitude")
);

create table "location" (
    "locationId" BIGSERIAL PRIMARY KEY,
    "latitude" numeric(20, 18),
    "longitude" numeric(20, 18),
    "addressLine1" varchar(255),
    "addressLine2" varchar(255),
    "street" varchar(255),
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
    "languageId" int not null,
    "territoryId" bigint,
    "source" varchar(64) null, -- ALBA, TERRITORY HELPER
    "sourceLocationId" varchar(64),
    "isPendingTerritoryMapping" boolean not null,
    "isDeleted" boolean not null,
    "isActive" boolean not null,
    "notes" text,
    "userDefined1" text,
    "userDefined2" text,
    foreign key("congregationId") references "congregation"("congregationId"),
    foreign key("territoryId") references "territory"("territoryId"),
    foreign key("languageId") references "language"("languageId"),
    foreign key("locationId") references "location"("locationId"),
    primary key("congregationId", "locationId")
);

create table "geocodeResponse" (
    "geocodeResponseId" BIGSERIAL primary key,
    "address" varchar(256) unique,
    "response" jsonb,
    "source" varchar(32) not null
)