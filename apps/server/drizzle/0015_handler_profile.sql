ALTER TABLE `handlers` ADD COLUMN `real_name` varchar(64) NOT NULL DEFAULT '';
ALTER TABLE `handlers` ADD COLUMN `id_number` varchar(32) NOT NULL DEFAULT '';
ALTER TABLE `handlers` ADD COLUMN `phone` varchar(32) NOT NULL DEFAULT '';
ALTER TABLE `handlers` ADD COLUMN `wechat` varchar(64) NOT NULL DEFAULT '';
ALTER TABLE `handlers` ADD COLUMN `alipay` varchar(128) NOT NULL DEFAULT '';
