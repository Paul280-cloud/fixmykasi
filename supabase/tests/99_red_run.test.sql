-- Issue #51: this test fails on purpose so we can see db-tests go red in CI.
-- I'll delete this file straight after the red run.
begin;
create extension if not exists pgtap with schema extensions;
select plan(1);
select is(1, 2, 'this test fails on purpose to prove CI goes red');
select * from finish();
rollback;
