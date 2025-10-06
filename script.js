const form = document.getElementById("songForm");
const tbody = document.querySelector("#songTable tbody");
const specialSwitch = document.getElementById("specialSong");
const switchLabel = document.getElementById("switchLabel");
const artistDropdown = document.getElementById("artistDropdown");
const newArtistInput = document.getElementById("newArtist");
const overallSlider = document.getElementById("overall");
const overallVal = document.getElementById("overallVal");

const categories = ["nostalgia", "lyricism", "catchiness", "novelty", "iconicness"];

specialSwitch.addEventListener("change", () => {
  switchLabel.textContent = specialSwitch.checked ? "Yes" : "No";
});

// Update category slider values
categories.forEach(id => {
  const slider = document.getElementById(id);
  const span = document.getElementById(id + "Val");
  slider.addEventListener("input", () => {
    span.textContent = slider.value;
  });
});

// Overall slider value
overallSlider.addEventListener("input", () => {
  overallVal.textContent = overallSlider.value;
});

// Add song
form.addEventListener("submit", e => {
  e.preventDefault();
  const song = document.getElementById("songName").value;

  // Determine artist
  let artist = artistDropdown.value;
  if (artist === "" && newArtistInput.value.trim() !== "") {
    artist = newArtistInput.value.trim();
    // Add new artist to dropdown
    const option = document.createElement("option");
    option.value = artist;
    option.textContent = artist;
    artistDropdown.appendChild(option);
  }

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

  // Reset form
  form.reset();
  switchLabel.textContent = "No";
  overallVal.textContent = overallSlider.value = 5;
});
