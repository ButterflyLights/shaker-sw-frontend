<?php

require "connect_db.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$table = $config["dbProfilesTable"];

// Validate input
if (!$data || !is_array($data)) {
    die(json_encode([
        "success" => false,
        "error" => "Invalid JSON input"
    ]));
}

// Check if name exists
if (!isset($data["name"])) {
    die(json_encode([
        "success" => false,
        "error" => "Missing profile name"
    ]));
}

$name = $data["name"];

// Prepare check query
$checkSql = "SELECT id FROM $table WHERE name = ? LIMIT 1";
$checkStmt = $conn->prepare($checkSql);

if (!$checkStmt) {
    die(json_encode([
        "success" => false,
        "error" => "Prepare check failed: " . $conn->error
    ]));
}

$checkStmt->bind_param("s", $name);
$checkStmt->execute();

$result = $checkStmt->get_result();

if ($result->num_rows > 0) {
    die(json_encode([
        "success" => false,
        "error" => "Profile with this name already exists"
    ]));
}

$checkStmt->close();

// Get column names from JSON
$columns = array_keys($data);

// Create placeholders (?, ?, ?)
$placeholders = implode(", ", array_fill(0, count($columns), "?"));

// Create column list
$columnList = implode(", ", $columns);

// Build SQL query
$sql = "INSERT INTO $table ($columnList) VALUES ($placeholders)";

// Prepare statement
$stmt = $conn->prepare($sql);

if (!$stmt) {
    die(json_encode([
        "success" => false,
        "error" => "Prepare failed: " . $conn->error,
        "sql" => $sql
    ]));
}

// Build types string dynamically
$types = "";

foreach ($data as $value) {
    if (is_int($value)) {
        $types .= "i";
    } elseif (is_float($value)) {
        $types .= "d";
    } else {
        $types .= "s";
    }
}

// Bind parameters
if (!$stmt->bind_param($types, ...array_values($data))) {
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

// Get generated auto-increment ID
$newId = $stmt->insert_id;

// Success response
echo json_encode([
    "success" => true,
    "id" => $newId
]);

$stmt->close();
$conn->close();

?>