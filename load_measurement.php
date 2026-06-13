<?php

require_once "read_file.php";
require_once "connect_db.php";

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

$inputPSDf = readBinaryArray($row["path"] . "/f.bin");
$inputPSDAcc = readBinaryArray($row["path"] . "/psdAcc.bin");

// 3. return it
echo json_encode([
    "inputPSDf" => $inputPSDf,
    "inputPSDAcc" => $inputPSDAcc,
    "measurementOutputData" => "" // TODO: add data
]);

$stmt->close();
$conn->close();

?>