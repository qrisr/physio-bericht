document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("abschlussbericht-form");
    const submitButton = document.getElementById("submit-button");
    const statusMessage = document.getElementById("status-message");
    const datumField = document.getElementById("datum");
    const zielField = document.getElementById("ziel");
    const begruendungContainer = document.getElementById("begruendung-container");
    const begruendungField = document.getElementById("begruendung");

    // **📌 Automatisches Setzen des aktuellen Datums**
    function setDefaultDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Zeitzonen-Korrektur
        datumField.value = now.toISOString().slice(0, 16);
    }
    setDefaultDateTime();

    // **📌 Dynamische Anzeige des Begründungsfelds**
    function toggleBegruendungField() {
        console.log("Ziel geändert auf:", zielField.value);
        if (zielField.value === "Ziel nicht erreicht") {
            begruendungContainer.style.display = "block"; // Zeigen
        } else {
            begruendungContainer.style.display = "none"; // Verstecken
            begruendungField.value = ""; // Feld zurücksetzen
        }
    }
    zielField.addEventListener("change", toggleBegruendungField);
    toggleBegruendungField(); // Beim Laden prüfen

    // **📌 Formular-Absenden mit Webhook & Pop-up**
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.innerText = "⏳ Wird gesendet...";
        statusMessage.innerHTML = "⏳ Anfrage wurde gesendet. Bitte warten...";
        statusMessage.style.color = "black";

        // **📌 Formulardaten sammeln**
        const formData = {
            datum: datumField.value,
            ziel: zielField.value,
            compliance: document.getElementById("compliance").value,
            ziel_text: document.getElementById("ziel-text").value,
            hypothese: document.getElementById("hypothese").value,
            begruendung: begruendungField.value || null
        };

        try {
            const response = await fetch("https://contextery.app.n8n.cloud/webhook/15fd0ca7-39c2-4a71-a9c8-652668fe5cae", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Fehler beim Senden! Status: ${response.status}`);
            }

            const responseData = await response.json();

            if (!responseData || !responseData.content) {
                throw new Error("Ungültige Antwort erhalten.");
            }

            // **Antwort erhalten – jetzt Pop-up öffnen**
            const resultWindow = window.open("", "_blank", "width=600,height=400");
            resultWindow.document.write(`
                <html>
                <head>
                    <title>Analyse</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { color: #333; }
                        p { font-size: 16px; line-height: 1.5; }
                        button { 
                            background-color: #007bff; 
                            color: white; 
                            border: none; 
                            padding: 10px 15px; 
                            cursor: pointer; 
                            margin-top: 20px; 
                        }
                        button:hover { background-color: #0056b3; }
                    </style>
                </head>
                <body>
                    <h2>Automatisch generierte Analyse</h2>
                    <p>${responseData.content || "Keine Antwort erhalten."}</p>
                    <button onclick="window.close()">Schliessen</button>
                </body>
                </html>
            `);

            // **📌 Statusmeldung aktualisieren**
            statusMessage.innerHTML = "✅ Ergebnis in neuem Fenster!";
            statusMessage.style.color = "green";

        } catch (error) {
            console.error("Fehler:", error);
            statusMessage.innerHTML = "❌ Fehler beim Senden!";
            statusMessage.style.color = "red";
        }

        // **📌 Button zurücksetzen**
        submitButton.disabled = false;
        submitButton.innerText = "Absenden";
    });
});