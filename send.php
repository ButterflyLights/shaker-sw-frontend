<?php
require "config.php";

$url = "http://" . $config["backendHost"] . ":" . $config["backendPort"] . "/send";

$raw = file_get_contents("php://input");

$options = [
    'http' => [
        "header"  =>
            "Content-Type: application/json\r\n" .
            "Content-Length: " . strlen($raw) . "\r\n",
        'method'  => 'POST',
        'content' => $raw
    ]
];

$context = stream_context_create($options);

$response = file_get_contents($url, false, $context);

echo "Antwort vom Python-Server:\n";
echo $response;