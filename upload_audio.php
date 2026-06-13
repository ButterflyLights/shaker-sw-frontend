<?php

require_once "config.php";

$uploadDir = $config["dataWorkingDir"] . $config["dataAudioFilesPath"];

var_dump($_POST);
var_dump($_FILES);

if (!isset($_FILES['audioFile'])) {
    http_response_code(400);
    exit('No file received');
}

$fileName = basename($_FILES['audioFile']['name']);
// $newFileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);

if (move_uploaded_file(
    $_FILES['audioFile']['tmp_name'],
    $uploadDir . $fileName
)) {
    echo "Upload successful: $fileName";
} else {
    http_response_code(500);
    echo "Upload failed";
}