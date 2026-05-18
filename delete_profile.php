<?php

require "connect_db.php";

header("Content-Type: application/json");

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data["id"])) {

    die(json_encode([
        "success" => false,
        "error" => "Missing profile id"
    ]));
}

$id = (int)$data["id"];

$table = $config["dbProfilesTable"];

// Prepare delete query
$sql = "DELETE FROM $table WHERE id = ?";

$stmt = $conn->prepare($sql);

// Check prepare
if (!$stmt) {

    die(json_encode([
        "success" => false,
        "error" => "Prepare failed: " . $conn->error
    ]));
}

// Bind ID
if (!$stmt->bind_param("i", $id)) {

    die(json_encode([
        "success" => false,
        "error" => "Bind failed: " . $stmt->error
    ]));
}

// Execute query
if (!$stmt->execute()) {

    die(json_encode([
        "success" => false,
        "error" => "Execute failed: " . $stmt->error
    ]));
}

// Check if row existed
if ($stmt->affected_rows === 0) {

    echo json_encode([
        "success" => false,
        "error" => "Profile not found"
    ]);

} else {

    echo json_encode([
        "success" => true,
        "deletedId" => $id
    ]);
}

$stmt->close();
$conn->close();

?>