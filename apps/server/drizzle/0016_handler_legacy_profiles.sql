-- 种子打手档案回填（仅更新仍为空的字段）
UPDATE `handlers` SET
  `real_name` = '张贰拾',
  `id_number` = '110101199003031234',
  `phone` = '13800138001',
  `wechat` = 'dashou_h1',
  `alipay` = '13800138001'
WHERE `id` = 'h1' AND `real_name` = '';

UPDATE `handlers` SET
  `real_name` = '李晓明',
  `id_number` = '110101199105051234',
  `phone` = '13800138002',
  `wechat` = 'lixm_h2',
  `alipay` = '13800138002'
WHERE `id` = 'h2' AND `real_name` = '';

UPDATE `handlers` SET
  `real_name` = '王强',
  `id_number` = '110101199206061234',
  `phone` = '13800138003',
  `wechat` = 'wangq_h3',
  `alipay` = '13800138003'
WHERE `id` = 'h3' AND `real_name` = '';

UPDATE `handlers` SET
  `real_name` = '陈杰',
  `id_number` = '110101199307071234',
  `phone` = '13800138004',
  `wechat` = 'chenj_h4',
  `alipay` = '13800138004'
WHERE `id` = 'h4' AND `real_name` = '';

UPDATE `handlers` SET
  `real_name` = '赵小七',
  `id_number` = '110101199408081234',
  `phone` = '13800138005',
  `wechat` = 'zhaoq_h5',
  `alipay` = '13800138005'
WHERE `id` = 'h5' AND `real_name` = '';

UPDATE `handlers` SET
  `real_name` = '刘凯',
  `id_number` = '110101199509091234',
  `phone` = '13800138006',
  `wechat` = 'liuk_h6',
  `alipay` = '13800138006'
WHERE `id` = 'h6' AND `real_name` = '';

-- 测试打手账号 dashou 绑定 h1（种子数据）
UPDATE `admin_users` SET `handler_id` = 'h1'
WHERE `id` = 'admin_handler' AND `handler_id` = '';

-- h2–h6 及其他打手/陪玩的后台账号由 migrateHandlerLegacyProfiles 按 handlerId 创建
-- MySQL 部署后请执行: npm run server:db:migrate-handlers
