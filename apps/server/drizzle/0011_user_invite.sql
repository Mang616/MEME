ALTER TABLE `users` ADD `invite_code` varchar(16) NOT NULL DEFAULT '';
ALTER TABLE `users` ADD `inviter_id` varchar(64) NOT NULL DEFAULT '';
CREATE INDEX `users_invite_code_idx` ON `users` (`invite_code`);
CREATE INDEX `users_inviter_id_idx` ON `users` (`inviter_id`);
