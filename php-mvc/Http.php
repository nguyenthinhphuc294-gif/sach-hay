<?php
declare(strict_types=1);

final class ApiError extends RuntimeException
{
    public function __construct(public readonly int $status, public readonly string $errorCode, string $message)
    {
        parent::__construct($message);
    }
}

final class Http
{
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        if ($status !== 204) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        }
        exit;
    }

    public static function raw(int $limit): string
    {
        if (!preg_match('~^application/json(?:\s*;|$)~i', $_SERVER['CONTENT_TYPE'] ?? '')) {
            throw new ApiError(415, 'INVALID_REQUEST', 'Yêu cầu cần gửi dữ liệu JSON.');
        }
        $body = file_get_contents('php://input', false, null, 0, $limit + 1);
        if ($body === false || strlen($body) > $limit) throw new ApiError(413, 'INVALID_JSON', 'Nội dung gửi lên quá lớn.');
        return $body;
    }

    public static function decode(string $raw): array
    {
        try {
            $value = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            $value = null;
        }
        if (!is_array($value)) throw new ApiError(400, 'INVALID_JSON', 'Nội dung yêu cầu không hợp lệ.');
        return $value;
    }

    public static function input(int $limit = 32768): array
    {
        if (($_SERVER['HTTP_X_SACHHAY_REQUEST'] ?? '') !== '1') {
            throw new ApiError(403, 'INVALID_REQUEST', 'Yêu cầu không hợp lệ.');
        }
        return self::decode(self::raw($limit));
    }

    public static function invalid(string $message = 'Dữ liệu gửi lên không hợp lệ.'): never
    {
        throw new ApiError(400, 'INVALID_INPUT', $message);
    }

    public static function text(mixed $value, int $max, int $min = 1): string
    {
        if (!is_string($value)) self::invalid();
        $value = trim($value);
        $size = mb_strlen($value, 'UTF-8');
        if ($size < $min || $size > $max) self::invalid();
        return $value;
    }

    public static function email(mixed $value): string
    {
        $email = strtolower(self::text($value, 254));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) self::invalid('Email không hợp lệ.');
        return $email;
    }

    public static function secure(): bool
    {
        return !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    }
}
