<?php

require "connect_db.php";

// Profil-ID aus Request lesen
$data = json_decode(file_get_contents("php://input"), true);

$profileId = $data["id"];

// SQL Query
$stmt = $conn->prepare("
    SELECT *
    FROM {$config["dbProfilesTable"]}
    WHERE id = ?
");

$stmt->bind_param("i", $profileId);

$stmt->execute();

$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {

    echo json_encode([
        "success" => true,
        "profile" => $row
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Profil nicht gefunden"
    ]);
}

$stmt->close();
$conn->close();

?>