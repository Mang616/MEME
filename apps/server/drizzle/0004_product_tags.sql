CREATE TABLE `product_tags` (
	`id` varchar(64) NOT NULL,
	`name` varchar(64) NOT NULL,
	`style` varchar(20) NOT NULL DEFAULT 'recommend',
	`sort_order` int NOT NULL DEFAULT 0,
	`enabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `product_tags_id` PRIMARY KEY(`id`)
);
