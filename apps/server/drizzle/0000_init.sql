CREATE TABLE `categories` (
  `service_type` varchar(20) NOT NULL,
  `id` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  CONSTRAINT `categories_service_type_id_pk` PRIMARY KEY(`service_type`,`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
  `id` varchar(64) NOT NULL,
  `service_type` varchar(20) NOT NULL,
  `category_id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` double NOT NULL,
  `sold` int NOT NULL DEFAULT 0,
  `tag` varchar(64) NOT NULL DEFAULT '',
  `cover` varchar(512) NOT NULL DEFAULT '',
  `cover_color` varchar(32) NOT NULL DEFAULT '',
  `hero_title` varchar(255) NOT NULL DEFAULT '',
  `hero_subtitle` varchar(255) NOT NULL DEFAULT '',
  `detail_desc` text NOT NULL,
  `views` int NOT NULL DEFAULT 0,
  `review_count` int NOT NULL DEFAULT 0,
  `positive_rate` int NOT NULL DEFAULT 0,
  `intro` text NOT NULL,
  `limit_per_user` int NOT NULL DEFAULT 0,
  `published` boolean NOT NULL DEFAULT true,
  CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `handlers` (
  `id` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `level` varchar(20) NOT NULL,
  `region` varchar(20) NOT NULL,
  `service_type` varchar(20) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `avatar` varchar(512) NOT NULL DEFAULT '',
  `online` boolean NOT NULL DEFAULT false,
  CONSTRAINT `handlers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
  `id` varchar(64) NOT NULL,
  `product_id` varchar(64) NOT NULL,
  `status` varchar(32) NOT NULL,
  `status_text` varchar(64) NOT NULL,
  `order_time` varchar(32) NOT NULL,
  `region` varchar(32) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `assigned_player` varchar(128) NOT NULL DEFAULT '',
  `service_player` varchar(128) NOT NULL DEFAULT '',
  `remark` varchar(512),
  `product_snapshot` json NOT NULL,
  `total_paid` double NOT NULL,
  `paid` boolean NOT NULL DEFAULT false,
  `refunded` boolean NOT NULL DEFAULT false,
  `auto_settle_time` varchar(32) NOT NULL DEFAULT '',
  `actions` json NOT NULL,
  CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
