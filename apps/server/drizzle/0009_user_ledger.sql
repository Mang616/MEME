CREATE TABLE `user_ledger` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `type` varchar(32) NOT NULL,
  `consume_amount` double NOT NULL DEFAULT 0,
  `balance_delta` double NOT NULL,
  `balance_after` double NOT NULL,
  `total_consume_after` double NOT NULL,
  `remark` varchar(512) NOT NULL DEFAULT '',
  `ref_id` varchar(64) NOT NULL DEFAULT '',
  `created_at` varchar(32) NOT NULL,
  CONSTRAINT `user_ledger_id` PRIMARY KEY(`id`)
);

CREATE INDEX `user_ledger_user_id_idx` ON `user_ledger` (`user_id`);
