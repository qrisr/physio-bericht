document.addEventListener("DOMContentLoaded", function () {
    // Datum vorausfüllen
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    document.getElementById("datum").value = formattedDate;

    const form = document.getElementById("abschlussbericht-form");
    const zielField = document.getElementById("ziel");
    const complianceField = document.getElementById("compliance");
    const begruendungField = document.getElementById("begruendung-container");
    const responseContainer = document.getElementById("response-container");
    const responseText = document.getElementById("response-text");
    const statusMessage = document.getElementById("status-message");
    const submitButton = document.getElementById("submit-button");

    // Ziel-Änderung überwachen
    zielField.addEventListener("change", function () {
        if (zielField.value === "Ziel nicht erreicht") {
            begruendungField.style.display = "block";
        } else {
            begruendungField.style.display = "none";
        }
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Button-Status anpassen
        submitButton.disabled = true;
        submitButton.style.backgroundColor = "#0056b3";
        statusMessage.innerHTML = "⏳ Anfrage wurde gesendet. Bitte warten...";

        // Formulardaten erfassen
        const formData = {
            datum: document.getElementById("datum").value,
            ziel: zielField.value,
            compliance: complianceField.value,
            ziel_text: document.getElementById("ziel-text").value,
            hypothese: document.getElementById("hypothese").value,
            begruendung: document.getElementById("begruendung").value || null
        };

        try {
            const response = await fetch("https://contextery.app.n8n.cloud/webhook-test/15fd0ca7-39c2-4a71-a9c8-652668fe5cae", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Fehler beim Senden der Anfrage! Status: ${response.status}`);
            }

            const responseData = await response.json();

            // Antwort anzeigen
            responseContainer.style.display = "block";
            responseText.innerHTML = `<strong>Automatisch generierte Analyse:</strong><br>${responseData.content || "Keine Antwort erhalten."}`;

            // Erfolgreiche Statusmeldung
            statusMessage.innerHTML = "✅ Antwort erfolgreich empfangen!";
            statusMessage.style.color = "green";

        } catch (error) {
            console.error("Fehler beim Verarbeiten der Antwort:", error);
            responseContainer.style.display = "block";
            responseText.innerHTML = "⚠️ Fehler beim Laden der Antwort.";
            statusMessage.innerHTML = "❌ Fehler beim Senden der Anfrage!";
            statusMessage.style.color = "red";
        }

        // Button wieder aktivieren
        submitButton.disabled = false;
        submitButton.style.backgroundColor = "#007bff";
    });
});