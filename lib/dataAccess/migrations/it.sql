select * from "public"."location";
select * from "public"."congregationLocation";
select count(*) from "public"."congregationLocation";
select * from "geocodeResponse";

delete from "congregationLocationActivity";
delete from "congregationLocation";
delete from "location";


ALTER TABLE "location" ALTER COLUMN "longitude" TYPE NUMERIC (21, 18); commit;
ALTER TABLE "location" ALTER COLUMN "latitude" TYPE NUMERIC (21, 18); commit;