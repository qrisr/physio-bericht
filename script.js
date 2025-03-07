// script.js - Steuert die Dynamik des Formulars & sendet Daten an N8N
document.addEventListener("DOMContentLoaded", function () {
    let zielSelect = document.getElementById("ziel");
    let complianceDiv = document.getElementById("complianceDiv");
    let begruendungDiv = document.getElementById("begruendungDiv");
    let form = document.getElementById("physioForm");

    // Zeige/Verstecke Felder je nach Auswahl des Ziels
    zielSelect.addEventListener("change", function () {
        if (this.value === "Ziel nicht erreicht") {
            complianceDiv.classList.remove("hidden");
            begruendungDiv.classList.remove("hidden");
        } else {
            complianceDiv.classList.add("hidden");
            begruendungDiv.classList.add("hidden");
        }
    });

    // Webhook-Daten an N8N senden
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        let formData = {
            datum: document.getElementById("datum").value,
            ziel: document.getElementById("ziel").value,
            compliance: document.getElementById("compliance").value || null,
            ziel_text: document.getElementById("ziel_text").value,
            hypothese: document.getElementById("hypothese").value,
            begruendung: document.getElementById("begruendung").value || null
        };

        fetch("https://your-n8n-webhook-url.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Antwort von N8N:", data);
            alert("Formular erfolgreich gesendet!");
            form.reset();
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Fehler beim Senden des Formulars!");
        });
    });
});