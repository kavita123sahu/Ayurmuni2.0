# Parity progress

| Batch | IDs | Status |
| --- | --- | --- |
| 1 | S-001–S-020 | done |
| 2 | S-021–S-040 | done |
| 3 | S-041–S-060 | done |
| 4 | S-061–S-080 | done |
| 5 | S-081–S-097 and S-098–S-188 | done |
| 6 | C-001–C-040 | done |
| 7 | C-041–C-080 | done |
| 8 | C-081–C-125 and C-126–C-179 | done |
| 9 | F-001–F-019 | done |
| 10 | A-001–A-050 | done |
| 11 | A-051–A-098 | done |
| 12 | Extra web items and summary | done |

App IDs in the table: 484. Expected: 484. Missing: 0.

Stopped for review. No application code was changed.

## Website implementation

| Step | Item | Status |
| --- | --- | --- |
| 1 | S-001 Splash and A-005 profile GET on splash | done — web matches app session route |
| 2 | S-004 OTP, A-003, A-004, A-079, policy routes | done — accept, profile, Home; deleted-account alert still open |
| 3 | A-008 account recover on OTP | done — verify posts recover and clears the hold |
| 4 | S-005 Access mode | done — complete profile opens Home; change number signs out |
| 5 | S-049 Razorpay on checkout | done — prepaid order opens checkout.js and verifies with payment_id |
| 6 | A-036 and S-037 doctor slip | done — page already calls customers/doctor-slip/ and shows multiple visits |
| 7 | A-035 medical receipt | done — receipt uses consultation-receipt and the payment breakdown |
| 8 | A-034 and S-040 consultation history | done — period is last_6_months; reschedule opens the doctor’s slots |
