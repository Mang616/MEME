ALTER TABLE `users` ADD `wechat_openid` varchar(128) NOT NULL DEFAULT '';

CREATE TABLE `content_pages` (
  `id` varchar(64) NOT NULL,
  `slug` varchar(128) NOT NULL,
  `title` varchar(255) NOT NULL,
  `payload` json NOT NULL,
  CONSTRAINT `content_pages_id` PRIMARY KEY(`id`),
  CONSTRAINT `content_pages_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `product_reviews` (
  `id` varchar(64) NOT NULL,
  `product_id` varchar(64) NOT NULL,
  `user_name` varchar(128) NOT NULL,
  `rate` int NOT NULL DEFAULT 5,
  `content` text NOT NULL,
  `review_time` varchar(32) NOT NULL DEFAULT '',
  `sort_order` int NOT NULL DEFAULT 0,
  CONSTRAINT `product_reviews_id` PRIMARY KEY(`id`)
);

CREATE TABLE `chat_conversations` (
  `id` varchar(64) NOT NULL,
  `type` varchar(32) NOT NULL,
  `name` varchar(128) NOT NULL,
  `role_label` varchar(64) NOT NULL DEFAULT '',
  `escort_level` varchar(32) NOT NULL DEFAULT '',
  `avatar_text` varchar(16) NOT NULL DEFAULT '',
  `avatar_color` varchar(32) NOT NULL DEFAULT '',
  `linked_order_id` varchar(64) NOT NULL DEFAULT '',
  `last_message` varchar(512) NOT NULL DEFAULT '',
  `last_time` varchar(32) NOT NULL DEFAULT '',
  `unread` int NOT NULL DEFAULT 0,
  `online` boolean NOT NULL DEFAULT false,
  `sort_order` int NOT NULL DEFAULT 0,
  CONSTRAINT `chat_conversations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `chat_messages` (
  `id` varchar(64) NOT NULL,
  `conversation_id` varchar(64) NOT NULL,
  `from_role` varchar(16) NOT NULL,
  `type` varchar(32) NOT NULL DEFAULT 'text',
  `content` text NOT NULL,
  `time` varchar(32) NOT NULL DEFAULT '',
  CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);

CREATE TABLE `feedbacks` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL DEFAULT '',
  `type_id` varchar(32) NOT NULL,
  `content` text NOT NULL,
  `contact` varchar(64) NOT NULL DEFAULT '',
  `created_at` varchar(32) NOT NULL DEFAULT '',
  CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
