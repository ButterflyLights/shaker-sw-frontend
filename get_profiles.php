<?php

require "connect_db.php";

$result = $conn->query("
    SELECT id, name
    FROM {$config["dbProfilesTable"]}
");

$profiles = [];

while ($row = $result->fetch_assoc()) {

    $profiles[] = $row;
}

echo json_encode($profiles);

$conn->close();

?>