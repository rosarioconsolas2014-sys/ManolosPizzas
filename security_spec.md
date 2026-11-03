# Security Specification: Manolo's Pizzas – The Pizza Challenge

## 1. Data Invariants
1. **Public Readability for Rankings**: Any player or guest can read game results to view the leaderboard and monthly champion, but can never directly modify another player's existing records.
2. **Participant Identity**: Document IDs in `/participants/{dni}` must match a valid alphanumeric DNI with length between 4 and 20 chars (`isValidId(dni)`).
3. **Score & Result Integrity**: Game results require valid scores (`level1Score`, `level2Score`, `level3Score`, `totalScore`) which must be non-negative numbers, `accuracy` between 0 and 100, valid `month` string format, and `completed` boolean.
4. **Configuration Access**: `/config/settings` can be read by all clients so players know the prize and whether the game is active, but only administrators can write/update configuration.
5. **No Orphaned Arbitrary Writes**: Unauthenticated guests can register attempts subject to validation, while admin mutations (e.g. deleting entries, altering game config, resetting tournament) are strictly restricted.

## 2. Dirty Dozen Payloads (Rejection Matrix)
1. Injecting 2MB payload into participant `fullName`.
2. Negative scores (e.g. `totalScore: -500`).
3. Ghost / Shadow fields injected during game submission (e.g. `isAdmin: true` or arbitrary backdoor tokens).
4. Forged accuracy exceeding 100% (e.g. `accuracy: 99999`).
5. Overwriting the global prize configuration from an unauthorized client.
6. Deleting leaderboards or other players' historical scores without administrator credentials.
7. Attempting to bypass DNI validation with special characters or SQL/NoSQL injection keys like `../root` or `${proto}`.
8. Updating `createdAt` on an existing score record.
9. Mutating total score after game completion.
10. Creating a participant record with missing required fields (`dni`, `fullName`).
11. Setting negative `totalAttempts` counter.
12. Attempting unbounded array injections into result records.
