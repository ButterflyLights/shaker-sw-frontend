<?php

require "connect_db.php";

// Profil-ID aus Request lesen
$data = json_decode(file_get_contents("php://input"), true);

$measurementId = $data["id"];

// SQL Query
$stmt = $conn->prepare("
    SELECT *
    FROM {$config["dbMeasurementsTable"]}
    WHERE id = ?
");

$stmt->bind_param("i", $measurementId);

$stmt->execute();

$result = $stmt->get_result();
$row = $result->fetch_assoc();

$measurementInputData = file_get_contents($row["path"] . "/u.json"); // TODO: fix large files

// 3. return it
echo json_encode([
    "measurementInputData" => json_decode($measurementInputData, true),
    "measurementOutputData" => "" // TODO: add data
]);

$stmt->close();
$conn->close();

?>