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

// Get column names from JSON
$columns = array_keys($data);

// Create column list
$columnList = implode(", ", $columns);

// Create placeholders (?, ?, ?)
$placeholders = implode(", ", array_fill(0, count($columns), "?"));

// Build update clause
$updates = [];

foreach ($columns as $column) {
    if ($column !== "name") {
        $updates[] = "$column = VALUES($column)";
    }
}

$updateClause = implode(", ", $updates);

// Build SQL query
$sql = "
    INSERT INTO $table ($columnList)
    VALUES ($placeholders)
    ON DUPLICATE KEY UPDATE
    $updateClause
";

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