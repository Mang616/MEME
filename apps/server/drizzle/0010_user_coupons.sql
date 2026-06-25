CREATE TABLE `user_coupons` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `template_id` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(512) NOT NULL DEFAULT '',
  `type` varchar(16) NOT NULL,
  `value` double NOT NULL DEFAULT 0,
  `min_spend` double NOT NULL DEFAULT 0,
  `max_discount` double NOT NULL DEFAULT 0,
  `scope` varchar(16) NOT NULL DEFAULT 'all',
  `expires_at` varchar(32) NOT NULL,
  `used_at` varchar(32) NOT NULL DEFAULT '',
  `used_order_id` varchar(64) NOT NULL DEFAULT '',
  `claimed_at` varchar(32) NOT NULL,
  CONSTRAINT `user_coupons_id` PRIMARY KEY(`id`)
);

CREATE INDEX `user_coupons_user_id_idx` ON `user_coupons` (`user_id`);

ALTER TABLE `orders` ADD COLUMN `subtotal` double NOT NULL DEFAULT 0;
ALTER TABLE `orders` ADD COLUMN `coupon_discount` double NOT NULL DEFAULT 0;
ALTER TABLE `orders` ADD COLUMN `user_coupon_id` varchar(64) NOT NULL DEFAULT '';
ALTER TABLE `orders` ADD COLUMN `coupon_name` varchar(128) NOT NULL DEFAULT '';
