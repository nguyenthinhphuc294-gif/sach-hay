<?php
declare(strict_types=1);

$assets = [
    '/media/bookshop.webp'=>'images/store-banners/phuc-thinh-bookshop.webp',
    '/media/cafe.webp'=>'images/store-banners/phuc-thinh-cafe.webp',
    '/media/staff.webp'=>'images/store-banners/phuc-thinh-staff.webp',
    '/media/reading-room.webp'=>'images/store-banners/phuc-thinh-reading-room.webp',
    '/media/promo.mp4'=>'videos/promo-video.mp4',
];
if (!in_array($method, ['GET','HEAD'], true) || !isset($assets[$path])) {
    http_response_code(isset($assets[$path]) ? 405 : 404);
    return;
}
$file = __DIR__ . '/assets/' . $assets[$path];
if (!is_readable($file)) {
    http_response_code(404);
    return;
}
$length = filesize($file);
$start = 0;
$end = $length - 1;
$video = str_ends_with($file, '.mp4');
header('Content-Type: ' . ($video ? 'video/mp4' : 'image/webp'));
header('Cache-Control: public, max-age=3600');
if ($video) {
    header('Accept-Ranges: bytes');
    if (isset($_SERVER['HTTP_RANGE'])) {
        $valid = preg_match('/^bytes=(\d{0,12})-(\d{0,12})$/D', $_SERVER['HTTP_RANGE'], $range)
            && ($range[1] !== '' || $range[2] !== '');
        if ($valid && $range[1] === '') {
            $start = max(0, $length - (int) $range[2]);
        } elseif ($valid) {
            $start = (int) $range[1];
            if ($range[2] !== '') $end = min($end, (int) $range[2]);
        }
        if (!$valid || $start > $end) {
            http_response_code(416);
            header('Content-Range: bytes */' . $length);
            return;
        }
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$length");
    }
}
header('Content-Length: ' . ($end - $start + 1));
if ($method === 'HEAD') return;
$stream = fopen($file, 'rb');
fseek($stream, $start);
$output = fopen('php://output', 'wb');
stream_copy_to_stream($stream, $output, $end - $start + 1);
fclose($stream);
