// CHANGE THIS to your Google Apps Script web app URL
const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_SCRIPT_URL_HERE";

document.querySelectorAll('input[type="range"]').forEach((slider) => {
  slider.addEventListener("input", () => {
    document.getElementById(slider.id + "Value").textContent = slider.value;
  });
});

document.getElementById("songForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    song: document.getElementById("song").value,
    artist: document.getElementById("artist").value,
    genre: document.getElementById("genre").value,
    nostalgia: Number(document.getElementById("nostalgia").value),
    lyricism: Number(document.getElementById("lyricism").value),
    catchiness: Number(document.getElementById("catchiness").value),
    novelty: Number(document.getElementById("novelty").value),
    iconicness: Number(document.getElementById("iconicness").value),
    special: document.getElementById("special").checked,
  };

  data.average = (
    (data.nostalgia +
      data.lyricism +
      data.catchiness +
      data.novelty +
      data.iconicness) /
    5
  ).toFixed(2);

  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  alert("✅ Added to spreadsheet!");
  e.target.reset();
});
