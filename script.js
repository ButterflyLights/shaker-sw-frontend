let backendUrl = "http://localhost:8000/status"; // TODO: read from config file
let pollingInterval = null;
let selectedProfile = null;

function omitId(obj) {
    const { id, ...rest } = obj;
    return rest;
}

function isEqualProfiles(a, b) {
    return JSON.stringify(omitId(a)) === JSON.stringify(b);
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

function stopPolling() {

    if (pollingInterval !== null) {

        clearInterval(pollingInterval);

        pollingInterval = null;

        console.log("Polling gestoppt");
    }
}

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

async function sendStop() {

    await sendRequest({
        command: "stop-measurement"
    });
}

async function downloadData() {

}

async function newProfile() {

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

        document.getElementById("response").innerText =
            "Fehler beim Laden der Profile";
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
                if (key != "id") {
                    const row = document.createElement("tr");
                    
                    row.innerHTML = `
                    <td><strong>${key}</strong></td>
                        <td><textarea id=${key}>${selectedProfile[key]}</textarea></td>
                    `;
        
                    tbody.appendChild(row);
                }
            }


        } else {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${data.message}</td>
            `;

            tbody.appendChild(row);
        }

    } catch (err) {

        console.error(err);

        document.getElementById("response").innerText =
            "Fehler beim Laden";
    }
}


async function uploadProfile() {
  
}

async function saveProfile() {
    if (selectedProfile != null) {
        
        let newSelectedProfile = {};
        for (var key in selectedProfile) {
            try {
                if (key != "id") {
                    newSelectedProfile[key] = document.getElementById(key).value;
                }  
            } catch(err) {
                console.log(err);
            }
        }

        if (!isEqualProfiles(selectedProfile, newSelectedProfile)) {
            try {
                const response = await fetch("save_profile.php", {
    
                    method: "POST",
    
                    headers: {
                        "Content-Type": "application/json"
                    },
    
                    body: JSON.stringify(newSelectedProfile)
                });
    
                const data = await response.json();
                console.log(data);
    
                loadProfiles();
    
            } catch (err) {
    
                console.error(err);
    
                document.getElementById("response").innerText =
                    "Fehler beim Speichern";
            }
        }
        else {
            console.log("no changes to profile");
        }
    }
}

async function deleteProfile() {
    if (selectedProfile != null) {
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

            document.getElementById("response").innerText =
                "Fehler beim Löschen";
        }
    }
}

loadProfiles();
// startPolling();
