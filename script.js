const form = document.getElementById("songForm");
const tbody = document.querySelector("#songTable tbody");
const switchInput = document.getElementById("specialSong");
const switchLabel = document.getElementById("switchLabel");

switchInput.addEventListener("change", () => {
  switchLabel.textContent = switchInput.checked ? "Yes" : "No";
});

const ratingFields = ["overall", "nostalgia", "lyricism", "catchiness", "novelty", "iconicness"];
ratingFields.forEach(id => {
  const input = document.getElementById(id);
  const span = document.getElementById(id + "Val");
  input.addEventListener("input", () => {
    span.textContent = input.value;
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();

  const song = document.getElementById("songName").value;
  const artist = document.getElementById("artistName").value;
  const genre = document.getElementById("genre").value;
  const special = switchInput.checked ? "Yes" : "No";

  const values = ratingFields.map(id => Number(document.getElementById(id).value));
  const overall = values[0];

  const row = document.createElement("tr");
  if (special === "Yes") row.classList.add("special");

  row.innerHTML = `
    <td>${song}</td>
    <td>${artist}</td>
    <td>${genre}</td>
    <td>${special}</td>
    ${values.map(v => `<td>${v}</td>`).join("")}
  `;

  tbody.appendChild(row);
  form.reset();
  switchLabel.textContent = "No";
});
