<?php
$db = new PDO('sqlite:' . __DIR__ . '/../php-mvc/storage/sachhay.sqlite');
$db->exec("UPDATE vouchers SET used = 186 WHERE code = 'FREESHIP'");
$db->exec("UPDATE vouchers SET used = 94 WHERE code = 'BANMOI10'");
$db->exec("UPDATE vouchers SET used = 42 WHERE code = 'SACHHAY20K'");
$db->exec("UPDATE vouchers SET used = 820 WHERE code = 'FREESHIP0D'");
$db->exec("UPDATE vouchers SET used = 65 WHERE code = 'GIAM15'");
echo "Seeded voucher usages successfully.\n";
