begin;
create extension if not exists pgtap with schema extensions;
select plan(1);
select ok(false, 'CI proof: intentional pgTAP failure (temporary probe)');
select * from finish();
rollback;
