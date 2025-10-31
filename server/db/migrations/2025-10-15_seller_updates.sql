-- Case-sensitive email for exact-case login
ALTER TABLE `users`
  MODIFY `email` VARCHAR(255)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_as_cs
    NOT NULL;

-- Two-Factor Authentication columns
ALTER TABLE `users` ADD COLUMN `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `users` ADD COLUMN `two_factor_secret` VARCHAR(64) NULL;
