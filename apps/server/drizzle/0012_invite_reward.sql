ALTER TABLE `users` ADD COLUMN `invite_reward_at` varchar(32) NOT NULL DEFAULT '' AFTER `inviter_id`;
