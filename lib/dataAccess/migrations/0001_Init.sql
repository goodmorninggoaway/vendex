create table language (
    languageId integer primary key autoincrement,
    language varchar(255) not null
);

insert into language values (1, 'English');
insert into language values (2, 'Hindi');

create table congregation (
    congregationId integer primary key autoincrement,
    name nvarchar(255) not null,
    languageId integer,
    foreign key(languageId) references language(languageId)
);

insert into congregation values (1, 'Bond Park', 1);
insert into congregation values (2, 'Triangle Park Hindi', 2);

create table territory (
    territoryId integer primary key autoincrement,
    congregationId integer not null,
    foreign key(congregationId) references congregation(congregationId)
);

create table territoryVertex (
    territoryId integer,
    latitude double,
    longitude double,
    foreign key(territoryId) references territory(territoryId),
    primary key(territoryId, latitude, longitude)
);

create table location (
    locationId integer primary key autoincrement,
    latitude double,
    longitude double,
    addressLine1 nvarchar(255),
    addressLine2 nvarchar(255),
    street nvarchar(255),
    city nvarchar(255),
    postalCode nvarchar(255),
    province nvarchar(255),
    countryCode nvarchar(255),
    externalLocationId varchar(512),
    externalLocationLastRefreshedDateTime varchar(32)
);

create table congregationLocation (
    congregationId integer not null,
    locationId integer not null,
    languageId integer not null,
    territoryId integer,
    source varchar(64) null, -- ALBA, TERRITORY HELPER
    sourceLocationId varchar(64),
    isPendingTerritoryMapping boolean not null,
    isDeleted boolean not null,
    isActive boolean not null,
    notes text,
    userDefined1 text,
    userDefined2 text,
    foreign key(congregationId) references congregation(congregationId),
    foreign key(territoryId) references territory(territoryId),
    foreign key(languageId) references language(languageId),
    foreign key(locationId) references location(locationId),
    primary key(congregationId, locationId)
);
