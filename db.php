<?php
require_once __DIR__ . '/config.php';

/**
 * Returns a PDO connection to the OLTP database (borrowbox_oltp).
 * Returns null on failure.
 */
function getOltpConnection(): ?PDO {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_OLTP . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log('[BorrowBox OLTP] Connection failed: ' . $e->getMessage());
        return null;
    }
}

/**
 * Returns a PDO connection to the OLAP database (borrowbox_olap).
 * Returns null on failure.
 */
function getOlapConnection(): ?PDO {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_OLAP . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log('[BorrowBox OLAP] Connection failed: ' . $e->getMessage());
        return null;
    }
}
