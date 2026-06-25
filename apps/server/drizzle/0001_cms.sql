CREATE TABLE `users` (
	`id` varchar(64) NOT NULL,
	`nickname` varchar(128) NOT NULL,
	`phone` varchar(32) NOT NULL DEFAULT '',
	`avatar` varchar(512) NOT NULL DEFAULT '',
	`vip_level` int NOT NULL DEFAULT 0,
	`balance` double NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`registered_at` varchar(32) NOT NULL DEFAULT '',
	`last_login_at` varchar(32) NOT NULL DEFAULT '',
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `banners` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255) NOT NULL DEFAULT '',
	`image` varchar(512) NOT NULL DEFAULT '',
	`bg_color` varchar(32) NOT NULL DEFAULT '#2d4a35',
	`link_type` varchar(20) NOT NULL DEFAULT 'none',
	`link_value` varchar(255) NOT NULL DEFAULT '',
	`sort_order` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`placement` varchar(32) NOT NULL DEFAULT 'home_bar',
	`enabled` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`start_at` varchar(32) NOT NULL DEFAULT '',
	`end_at` varchar(32) NOT NULL DEFAULT '',
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
