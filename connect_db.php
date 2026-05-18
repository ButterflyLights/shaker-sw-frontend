<?php

require "config.php";

header("Content-Type: application/json");

$host = $config["dbHost"];
$dbname = $config["dbName"];
$user = $config["dbUser"];
$password = $config["dbPassword"];

// Verbindung herstellen
$conn = new mysqli($host, $user, $password, $dbname);

// Fehler prüfen
if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Datenbankverbindung fehlgeschlagen"
    ]));
}

?>