create table language (
    languageId int primary key,
    language varchar(255) not null
);

insert into language values (1, 'English');

create table congregation (
    congregationId int primary key,
    name nvarchar(255) not null,
    languageId int,
    foreign key(languageId) references language(languageId)
);

insert into congregation values (1, 'Bond Park', 1);

create table territory (
    territoryId bigint primary key,
    congregationId int not null,
    foreign key(congregationId) references congregation(congregationId)
);

create table territoryVertex (
    territoryId bigint,
    latitude double,
    longitude double,
    foreign key(territoryId) references territory(territoryId),
    primary key(territoryId, latitude, longitude)
);

create table location (
    locationId bigint primary key,
    latitude double,
    longitude double,
    addressLine1 nvarchar(255),
    addressLine2 nvarchar(255),
    street nvarchar(255),
    city nvarchar(255),
    postalCode nvarchar(255),
    province nvarchar(255),
    country nvarchar(255),
    externalLocationId varchar(512),
    externalLocationLastRefreshedDateTime varchar(32)
);

create table congregationLocation (
    congregationId int not null,
    locationId bigint not null,
    languageId int not null,
    territoryId bigint,
    source varchar(64) not null, -- ALBA, TERRITORY HELPER
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
