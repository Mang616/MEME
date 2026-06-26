ALTER TABLE `products` ADD COLUMN `coupon_allowed` boolean NOT NULL DEFAULT true AFTER `limit_per_user`;
