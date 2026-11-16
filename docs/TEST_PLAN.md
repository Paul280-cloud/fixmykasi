# FixMyKasi — QA Test Plan

## 1. Purpose

This document records manual QA scenarios for FixMyKasi, their expected results, and the actual results observed during testing.

The initial checklist focuses on authentication and fault reporting. It is a focused contribution to Issue #7, not a declaration that all QA acceptance criteria have been completed.

## 2. Test execution record

| Field | Details |
|---|---|
| Tester | Bao |
| Test type | Manual functional testing |
| Test date | Not recorded |
| Environment | Not recorded |
| Application build / commit | Not recorded |
| Execution status | Results not recorded; rerun required |

**Important:** The outcomes of the earlier live test session could not be confirmed when this document was prepared. No scenario is marked as passed or failed without evidence.

## 3. Manual test scenarios

| Test ID | Scenario | Preconditions | Test steps | Expected result | Actual result | Status |
|---|---|---|---|---|---|---|
| MT-AUTH-01 | Resident sign-up | New email address available | Open sign-up, enter valid details, and submit | Account registration succeeds and a confirmation message is displayed | Not recorded | Not executed / evidence unavailable |
| MT-AUTH-02 | Email confirmation | Registration completed; confirmation email available | Open the confirmation email and follow its link | Email is confirmed and the account can proceed to authentication | Not recorded | Not executed / evidence unavailable |
| T-US2-1 | Login with confirmed account | Account has a confirmed email address | Enter the registered email and correct password | Login succeeds and the resident reaches the fault list | Not recorded | Not executed / evidence unavailable |
| T-US3-1 | Submit fault report with photo | Resident is logged in; a suitable photo is available | Complete the fault report, attach a photo, and submit | Report is submitted and a reference number is displayed | Not recorded | Not executed / evidence unavailable |
| T-US2-2 | Login with incorrect password | Registered account exists | Enter the registered email and an incorrect password | Error message indicates incorrect email or password; email remains populated | Not recorded | Not executed / evidence unavailable |
| MT-AUTH-03 | Login before email confirmation | Account exists but email is not confirmed | Attempt to log in using the account credentials | Unconfirmed account is prevented from accessing the authenticated application | Not recorded | Not executed / evidence unavailable |

## 4. Evidence to capture during rerun

For each scenario, record:

- Date and time of execution.
- Environment and application build, where available.
- Steps actually performed.
- Expected and actual result.
- Pass, fail, blocked, or not executed.
- Screenshot or other relevant evidence, with personal information and credentials redacted.
- Defect or issue reference if a failure is found.

## 5. Test account security

Use dedicated test-only accounts.

- Do not include real resident credentials in this document.
- Do not commit passwords, access tokens, confirmation links, or other secrets.
- Store any approved test credentials only in the team's agreed secure location.
- Use unique email addresses for sign-up and unconfirmed-email scenarios where required.

The exact test-account details from PRD Section 10.4 must be reviewed and added only in accordance with the team's secure test-data process.

## 6. Scope and outstanding work

This initial document records six authentication and fault-reporting scenarios.

The remaining Issue #7 acceptance work includes:

- Mapping every T-ID in PRD Section 6 to Automated or Manual, with an owner.
- Preparing manual checklists for each checkpoint.
- Reviewing the PRD Section 10.4 test accounts and documenting their secure handling.
- Confirming the README Tests section accurately explains how to run tests and what they cover.

These items must be completed before Issue #7 can be considered fully satisfied.

## 7. Review notes

This document is intended for teammate review. Test outcomes must be updated only after the scenarios have been executed and supported by observations or evidence.
