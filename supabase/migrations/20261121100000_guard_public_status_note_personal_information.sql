-- Issue #16: Prevent personal information from being stored
-- in publicly readable status timeline notes.

create or replace function public.reject_personal_information_in_status_note()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.note is null then
    return new;
  end if;

  -- Reject email addresses.
  if new.note ~* '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'

    -- Reject South African phone numbers:
    -- 082 123 4567, 082-123-4567, +27 82 123 4567.
    or new.note ~ '(^|[^0-9])(\+27|0)[[:space:]().-]*([0-9][[:space:]().-]*){8}[0-9]([^0-9]|$)'

    -- Reject 13-digit South African ID numbers,
    -- including numbers separated by spaces or hyphens.
    or new.note ~ '(^|[^0-9])([0-9][[:space:]-]*){12}[0-9]([^0-9]|$)'
  then
    raise exception 'status_note_contains_personal_information'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- The trigger is the only intended entry point for this validation function.
revoke all on function public.reject_personal_information_in_status_note()
  from public, anon, authenticated;

-- Protect both new timeline entries and edits to existing notes.
create trigger status_changes_reject_personal_information
  before insert or update of note
  on public.status_changes
  for each row
  execute function public.reject_personal_information_in_status_note();
