let backendUrl = "http://localhost:8000/status"; // TODO: read from config file
let pollingInterval = null;
let selectedProfile = null;
let statusOld = null;

function omitId(obj) {
    const { id, ...rest } = obj;
    return rest;
}

function isEqualProfiles(a, b) {
    return JSON.stringify(omitId(a)) === JSON.stringify(b);
}

function displayError(err) {
    document.getElementById("error").innerText = err;
}

function displayStatus(status) {
    document.getElementById("status").innerText = status;
}

function updateSelectedProfile() {
    for (var key in selectedProfile) {
        try {
            if (key !== "id" && selectedProfile[key] != null) {
                var element = document.getElementById(key);

                if (!element) continue;

                var newValue = (
                    element instanceof HTMLInputElement ||
                    element instanceof HTMLTextAreaElement ||
                    element instanceof HTMLSelectElement
                )
                    ? element.value
                    : element.innerHTML;

                if (typeof selectedProfile[key] === "number") {
                    selectedProfile[key] = Number(newValue);
                } else {
                    selectedProfile[key] = newValue;
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    console.log(selectedProfile);
}

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

function plotPSD(x, y, title) {

    const trace = {
        x: x,
        y: y,
        mode: "lines",
        type: "scatter"
    };

    const layout = {
        title: title,
        xaxis: {
            title: "f [Hz]",
            type: "log"
        },
        yaxis: {
            title: "PSD [V²/Hz]", // TODO check units
            type: "log"
        }
    };

    // Plotly.newPlot(
    //     "inputPSD",
    //     [trace],
    //     layout
    // );

    Plotly.react("inputPSD", [trace], layout);
}

async function pollStatus() {

    try {

        const response = await fetch(backendUrl);

        const data = await response.json();

        // console.log(data);

        document.getElementById("status").innerText =
            "Status: " + data.status;

        if (data.status == "FINISHED" && statusOld == "RUNNING") {
            idLast = await loadMeasurementsFromProfile(selectedProfile.id);
            loadMeasurement(idLast);
        }

        statusOld = data.status;

    } catch (err) {
        console.error(err);
    }
}

function startPolling() {

    // verhindert doppeltes Polling
    if (pollingInterval !== null) {
        return;
    }

    pollingInterval = setInterval(
        pollStatus,
        1000
    );

    console.log("Polling gestartet");
}

function stopPolling() {

    if (pollingInterval !== null) {

        clearInterval(pollingInterval);

        pollingInterval = null;

        console.log("Polling gestoppt");
    }
}

async function sendMeasurement() {
    if (selectedProfile != null) {
        updateSelectedProfile();

        params = {};
    
        for (var key in selectedProfile) {
            if (key != 'type' && key != 'name' && key != 'id' && selectedProfile[key] != null) {
                params[key] = selectedProfile[key];
            }
        }
    
        msg = {
            command: "start-measurement",
            profileId: selectedProfile.id,
            signalType: selectedProfile.type,
            signalParams: params
        };
    
        console.log(msg);
    
        const responseText = await sendRequest(msg);
    }
}

async function sendStop() {

    await sendRequest({
        command: "stop-measurement"
    });
}

async function downloadData() {

}

async function loadProfiles() {
    try {
        const response = await fetch("get_profiles.php");

        const profiles = await response.json();
        console.log(profiles);

        const tbody =
            document.querySelector("#profileTable tbody");

        tbody.innerHTML = "";

        profiles.forEach(profile => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${profile.id}</td>
                <td>${profile.name}</td>
            `;

            row.addEventListener("click", () => {
                loadProfile(profile.id);
            });

            tbody.appendChild(row);
        });

    } catch (err) {

        console.error(err);

        displayError("Error loading profiles");
    }
}

async function loadProfile(profileId) {
    try {
        const response = await fetch("load_profile.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                id: profileId
            })
        });

        const data = await response.json();
        selectedProfile = data.profile;

        console.log(data);

        const tbody = document.querySelector("#profileDataTable tbody");    
            
        tbody.innerHTML = "";

        if (data.success) {
            for (var key in selectedProfile) {
                if (key != "id" && selectedProfile[key] != null) {
                    const row = document.createElement("tr");
                    
                    if (key === "type") {

                        row.innerHTML = `
                            <td><strong>${key}</strong></td>
                            <td>${selectedProfile[key]}</td>
                        `;
                    }
                    else {

                        row.innerHTML = `
                            <td><strong>${key}</strong></td>
                            <td><textarea id="${key}">${selectedProfile[key]}</textarea></td>
                        `;
                    }
        
                    tbody.appendChild(row);
                }
            }
            
            loadMeasurementsFromProfile(profileId);

        } else {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${data.message}</td>
            `;

            tbody.appendChild(row);
        }

    } catch (err) {

        console.error(err);

        displayError("Error loading profile");
    }
}

async function saveProfile() {
    if (selectedProfile != null) {
        updateSelectedProfile();

        if (selectedProfile.name.slice(0, 7) == 'default') {
            displayError("Cannot save profile as default profile");
            return;
        }

        try {
            const response = await fetch("save_profile.php", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(omitId(selectedProfile))
            });

            const data = await response.text();
            console.log("response:", data);
            loadProfiles();
            
        } catch (err) {

              console.error(err);
  
              displayError("Error saving profile");
        }
    }
}

async function deleteProfile() {
    if (selectedProfile != null && selectedProfile.name.slice(0, 7) != 'default') {
        console.log(selectedProfile);

        try {
            const response = await fetch("delete_profile.php", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    id: selectedProfile.id
                })
            });

            const data = await response.json();
            console.log(data);

            loadProfiles();

            const tbody = document.querySelector("#profileDataTable tbody");    
            
            tbody.innerHTML = "";

        } catch (err) {

            console.error(err);

            displayError("Error deleting profile");
        }
    }
    else if (selectedProfile.name.slice(0, 7) == 'default') {
        displayError("Cannot delete default profile");
    }
}

async function loadMeasurementsFromProfile(profileId) {
    try {
        const response = await fetch("get_measurements.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                profileId: profileId
            })
        });

        const measurements = await response.json();
        console.log(measurements);

        const tbody =
            document.querySelector("#measurementTable tbody");

        ids = []
        tbody.innerHTML = "";

        measurements.forEach(measurement => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${measurement.id}</td>
            `;

            row.addEventListener("click", () => {
                loadMeasurement(measurement.id);
            });

            tbody.appendChild(row);

            ids.push(measurement.id)
        });

        return Math.max(...ids);

    } catch (err) {

        console.error(err);

        displayError("Error loading measurements");
    }
}

async function loadMeasurement(measurementId) {
    try {
        const response = await fetch("load_measurement.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                id: measurementId
            })
        });

        const measurement = await response.json();
        console.log(measurement);        

        plotPSD(measurement["measurementInputData"]["fAcc"], measurement["measurementInputData"]["psdAcc"], "Input PSD (Acceleration)");

    } catch (err) {

        console.error(err);

        displayError("Error loading measurements");
    }

}

loadProfiles();
startPolling();
