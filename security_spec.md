# Firestore Security Specification

This document details the security specification, validation pathways, and test invariants for the AquaCheck database.

## Data Invariants
1. **User Ownership Isolation**: Users can only read, write, update, or delete profiles and records that match their authenticated UID (`request.auth.uid`). No cross-user access is permitted.
2. **Type Safety & Schema Hardening**: All string lengths are strictly bound, and all numeric attributes (such as daily goal, liters, levels, XP) must be non-negative numbers.
3. **Id Poisoning Prevention**: Document ID path variables (e.g., `userId`, `recordId`) must be valid alphanumeric strings adhering to strict length controls.

## The "Dirty Dozen" Veto Payloads
The following payloads constitute hostile attempts and will be rejected:
1. ID Injection representing oversized characters.
2. Cross-user UID spoofing (attempting to write parameters inside target `userId` that isn't theirs).
3. Modifying keys to make roles self-assigned (e.g. attempting to inject administration fields).
4. Negative volume water logs (for example, `-50` Liters logged).
5. Oversized string inputs (e.g., a note 2MB in size).
6. Missing required keys on creating a UserProfile.
7. Spoofed email address parameters with no verification.
8. Unsigned/unassembled raw payloads.
9. Write attempts into the users collection by a non-authenticated user.
10. Massive number updates to level, streak, or dailyGoal (out of range boundaries).
11. Record updates targeting other records that do not contain valid IDs matching the path.
12. Attempting to delete a profile document directly.
