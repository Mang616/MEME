ALTER TABLE `orders` ADD `owner_user_id` varchar(64) NOT NULL DEFAULT '';
ALTER TABLE `chat_conversations` ADD `owner_user_id` varchar(64) NOT NULL DEFAULT '';
ALTER TABLE `chat_conversations` ADD `handler_id` varchar(64) NOT NULL DEFAULT '';
ALTER TABLE `chat_conversations` ADD `customer_game_id` varchar(128) NOT NULL DEFAULT '';
ALTER TABLE `chat_messages` ADD `sender_type` varchar(16) NOT NULL DEFAULT 'user';
ALTER TABLE `chat_messages` ADD `sender_id` varchar(64) NOT NULL DEFAULT '';
CREATE TABLE `admin_users` (
	`id` varchar(64) NOT NULL,
	`username` varchar(64) NOT NULL,
	`password_hash` varchar(256) NOT NULL,
	`display_name` varchar(128) NOT NULL DEFAULT '',
	`roles` json NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`created_at` varchar(32) NOT NULL DEFAULT '',
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`)
);
