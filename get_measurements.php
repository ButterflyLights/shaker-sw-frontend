<?php

require "connect_db.php";

$data = json_decode(file_get_contents("php://input"), true);

$profileId = $data["profileId"];


// SQL Query
$stmt = $conn->prepare("
    SELECT *
    FROM {$config["dbMeasurementsTable"]}
    WHERE profileId = ?
");

$stmt->bind_param("i", $profileId);

$stmt->execute();

$result = $stmt->get_result();

$measurements = [];

while ($row = $result->fetch_assoc()) {

    $measurements[] = $row;
}

echo json_encode($measurements);

$conn->close();

?>