// script.js - UX-Funktionen & Webhook-Anbindung
document.addEventListener("DOMContentLoaded", function () {
    let zielSelect = document.getElementById("ziel");
    let begruendungDiv = document.getElementById("begruendungDiv");
    let complianceSelect = document.getElementById("compliance");
    let datumFeld = document.getElementById("datum");

    // Datum & Zeit vorausfüllen
    let jetzt = new Date();
    datumFeld.value = jetzt.toISOString().slice(0, 16);

    // Funktion zur Aktualisierung der Dropdown-Farben
    function updateDropdownColor(selectElement) {
        if (selectElement.value === "Ziel erreicht" || selectElement.value === "Ja") {
            selectElement.className = "green";
        } else {
            selectElement.className = "red";
        }
    }

    // Ziel-Status aktualisieren & Feld "Begründung" ein-/ausblenden
    function updateZielStatus() {
        updateDropdownColor(zielSelect);
        if (zielSelect.value === "Ziel nicht erreicht") {
            begruendungDiv.classList.remove("hidden");
        } else {
            begruendungDiv.classList.add("hidden");
        }
    }

    // Compliance-Farbwechsel
    complianceSelect.addEventListener("change", function () {
        updateDropdownColor(complianceSelect);
    });

    // Event Listener für Dropdown-Änderungen
    zielSelect.addEventListener("change", updateZielStatus);

    // Webhook-Daten an N8N senden
    document.getElementById("physioForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let formData = {
            datum: datumFeld.value,
            ziel: zielSelect.value,
            compliance: complianceSelect.value,
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
            alert("Formular erfolgreich gesendet!");
            document.getElementById("physioForm").reset();
            updateZielStatus();
        })
        .catch(error => {
            alert("Fehler beim Senden des Formulars!");
        });
    });

    // Status direkt beim Laden setzen
    updateZielStatus();
});