-- 打手/陪玩订单会话终止时间（客服会话保持为空）
ALTER TABLE `chat_conversations` ADD COLUMN `closed_at` varchar(32) NOT NULL DEFAULT '' AFTER `sort_order`;
