const form = document.getElementById("songForm");
const tbody = document.querySelector("#songTable tbody");
const specialSwitch = document.getElementById("specialSong");
const switchLabel = document.getElementById("switchLabel");
const overallSlider = document.getElementById("overall");
const overallVal = document.getElementById("overallVal");

specialSwitch.addEventListener("change", () => {
  switchLabel.textContent = specialSwitch.checked ? "Yes" : "No";
});

const categories = ["nostalgia", "lyricism", "catchiness", "novelty", "iconicness"];

// Update category slider values and auto-calculate Overall
categories.forEach(id => {
  const slider = document.getElementById(id);
  const span = document.getElementById(id + "Val");
  slider.addEventListener("input", () => {
    span.textContent = slider.value;
    updateOverall();
  });
});

function updateOverall() {
  const total = categories.reduce((sum, id) => sum + Number(document.getElementById(id).value), 0);
  const avg = (total / categories.length).toFixed(2);
  overallSlider.value = avg;
  overallVal.textContent = avg;
}

// Add song to table
form.addEventListener("submit", e => {
  e.preventDefault();

  const song = document.getElementById("songName").value;
  const artist = document.getElementById("artistName").value;
  const genre = document.getElementById("genre").value;
  const special = specialSwitch.checked ? "Yes" : "No";
  const overall = Number(overallSlider.value);
  const values = categories.map(id => Number(document.getElementById(id).value));

  const row = document.createElement("tr");
  if (special === "Yes") row.classList.add("special");

  row.innerHTML = `
    <td>${song}</td>
    <td>${artist}</td>
    <td>${genre}</td>
    <td>${special}</td>
    <td>${overall}</td>
    ${values.map(v => `<td>${v}</td>`).join("")}
  `;

  tbody.appendChild(row);
  form.reset();
  switchLabel.textContent = "No";
  updateOverall(); // reset overall to 5
});
