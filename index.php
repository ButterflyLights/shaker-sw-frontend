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

    <button onclick="sendData()">
        JSON absenden
    </button>

    <div id="response" class="response"></div>

</div>

<script>

async function sendData() {
    const response = await fetch("send.php", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            command: "start-measurement",
            signalType: "sweep",
            signalParams: {
              amplitude: 0.05,
              freqStart: 100,
              freqEnd: 1000,
              sweepRate: 0.5
            }
        })
    });

    const text = await response.text();

    document.getElementById("response").innerText = text;
}

</script>

</body>
</html>