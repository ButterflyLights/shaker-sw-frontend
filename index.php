<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>PHP → Python</title>

    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="box">

    <h1>Nachricht senden</h1>

    <button onclick="sendMeasurement()">
        Messung starten
    </button>

    <button onclick="sendStop()">
        Messung stoppen
    </button>

    <div id="response" class="response"></div>

</div>

<script>

async function sendRequest(payload) {

    const response = await fetch("send.php", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
    });

    const text = await response.text();
    document.getElementById("response").innerText = text;
}


// 1. Button: Messung starten
function sendMeasurement() {
    sendRequest({
        command: "start-measurement",
        signalType: "sweep",
        signalParams: {
            amplitude: 0.05,
            freqStart: 100,
            freqEnd: 1000,
            sweepRate: 0.5
        }
    });
}


// 2. Button: Messung stoppen
function sendStop() {
    sendRequest({
        command: "stop-measurement"
    });
}

</script>

</body>
</html>