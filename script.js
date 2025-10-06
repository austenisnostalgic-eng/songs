const form = document.getElementById("songForm");
const tbody = document.querySelector("#songTable tbody");
const specialSwitch = document.getElementById("specialSong");
const switchLabel = document.getElementById("switchLabel");
const artistDropdown = document.getElementById("artistDropdown");
const newArtistInput = document.getElementById("newArtist");
const overallSlider = document.getElementById("overall");
const overallVal = document.getElementById("overallVal");

const categories = ["nostalgia", "lyricism", "catchiness", "novelty", "iconicness"];

// Switch label toggle
specialSwitch.addEventListener("change", () => {
  switchLabel.textContent = specialSwitch.checked ? "Yes" : "No";
});

// Category sliders update
categories.forEach(id => {
  const slider = document.getElementById(id);
  const span = document.getElementById(id + "Val");
  slider.addEventListener("input", () => {
    span.textContent = slider.value;
  });
});

// Overall manual slider
overallSlider.addEventListener("input", () => {
  overallVal.textContent = overallSlider.value;
});

// Add song
form.addEventListener("submit", e => {
  e.preventDefault();
  const song = document.getElementById("songName").value;

  // Artist selection logic
  let artist = artistDropdown.value;
  if (artist === "" && newArtistInput.value.trim() !== "") {
    artist = newArtistInput.value.trim();
    const option = document.createElement("option");
    option.value = artist;
    option.textContent = artist;
    artistDropdown.appendChild(option);
  }

  const genre = document.getElementById("genre").value;
  const special = specialSwitch.checked ? "Yes" : "No";
  const overall = Number(overallSlider.value);
  const values = categories.map(i

