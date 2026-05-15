let backendUrl = "http://localhost:8000/status";
let pollingInterval = null;

// --------------------------------------------------
// Allgemeine Request Funktion
// --------------------------------------------------

async function sendRequest(payload) {

    const response = await fetch("send.php", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
    });

    const text = await response.text();

    // document.getElementById("response").innerText = text;

    return text;
}


// --------------------------------------------------
// Polling Funktion
// --------------------------------------------------

async function pollStatus() {

    try {

        const response = await fetch(backendUrl);

        const data = await response.json();

        console.log(data);

        document.getElementById("response").innerText =
            "Status: " + data.status;

    } catch (err) {
        console.error(err);
    }
}


// --------------------------------------------------
// Polling starten
// --------------------------------------------------

function startPolling() {

    // verhindert doppeltes Polling
    if (pollingInterval !== null) {
        return;
    }

    pollingInterval = setInterval(
        pollStatus,
        500
    );

    console.log("Polling gestartet");
}


// --------------------------------------------------
// Polling stoppen
// --------------------------------------------------

function stopPolling() {

    if (pollingInterval !== null) {

        clearInterval(pollingInterval);

        pollingInterval = null;

        console.log("Polling gestoppt");
    }
}


// --------------------------------------------------
// Messung starten
// --------------------------------------------------

async function sendMeasurement() {

    const responseText = await sendRequest({

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


// --------------------------------------------------
// Messung stoppen
// --------------------------------------------------

async function sendStop() {

    await sendRequest({
        command: "stop-measurement"
    });
}

startPolling();
