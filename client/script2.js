let currentEditId = null; //Tallennamme muokattavan rivin ID:n

(loadPage = () => {
  fetch("http://localhost:3000/items")
    .then((res) => res.json())
    .then((data) => {
      displayUser(data);
    });
})();
const userDisplay = document.querySelector(".table");
displayUser = (data) => {
  userDisplay.innerHTML = `
    <thead>
    <tr>
      <th>Id</th>
      <th>Nimi</th>
      <th>Puhelin</th>
      <th>Muokkaa</th>
      <th>Poista</th>
    </tr>
    </thead>
     
    `;
  displayRow(data);
};

displayRow = (data) => {
  data.forEach((user) => {
    userDisplay.innerHTML += `
      <tbody>
      <tr>
  
          <td>${user.id}</td>
          <td>${user.nimi}</td>
          <td>${user.puhelin}</td>
          <td><input type="button" onClick="editRow(${user.id})" value="Muokkaa"/></td>
          <td><input type="button" onClick="removeRow(${user.id})" value="x"/></td>
      </tr>
      </tbody>
   
  `;
  });
};

function editRow(id) {
  console.log(id);
  let polku = "http://localhost:3000/items/" + id; // Haemme käyttäjän tiedot ID:n perusteella, jotta voimme täyttää muokkauslomakkeen
  // Simple GET request with fetch
  fetch(polku)
    .then((response) => response.json())
    .then((user) => {
      console.log(user);
      // Näytämme muokkauslomakkeen
      document.getElementById("puhelintieto_muokkauslomake").style.display =
        "block";
      // Täytämme lomakkeen muokattavan käyttäjän tiedoilla
      document.getElementById("edit_nimi").value = user.nimi;
      document.getElementById("edit_puhelin").value = user.puhelin;

      // Tallennamme, mitä ID:tä olemme muokkaamassa
      currentEditId = user.id;
    });
}

async function handleEditFormSubmit(event) {
  event.preventDefault(); // Estämme lomakkeen oletuskäytöksen
  // Haemme päivitetyt tiedot lomakkeesta
  let updatedName = document.getElementById("edit_nimi").value;
  let updatedPhone = document.getElementById("edit_puhelin").value;
  // Luomme olion päivitetyillä tiedoilla
  let updatedUser = {
    nimi: updatedName,
    puhelin: updatedPhone,
  };

  let polku = "http://localhost:3000/items/" + currentEditId;

  try {
    // Lähetämme PUT‑pyynnön palvelimelle päivitetyillä tiedoilla
    const response = await fetch(polku, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });
    // Tarkistamme, onnistuiko pyyntö
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }

    document.getElementById("puhelintieto_muokkauslomake").style.display =
      "none"; // Piilotamme muokkauslomakkeen onnistuneen päivityksen jälkeen
    await loadPage(); // Päivitämme taulukon uusilla tiedoilla
    currentEditId = null; //Nollaamme muokattavan rivin ID:n
  } catch (error) {
    console.error(error);
  }
}

removeRow = async (id) => {
  console.log(id);
  // Simple DELETE request with fetch
  let polku = "http://localhost:3000/items/" + id;
  await fetch(polku, { method: "DELETE" }).then(() =>
    console.log("Poisto onnistui"),
  );
  window.location.reload(); //ladataan ikkuna uudelleen
};

/**
 * Helper function for POSTing data as JSON with fetch.
 *
 * @param {Object} options
 * @param {string} options.url - URL to POST data to
 * @param {FormData} options.formData - `FormData` instance
 * @return {Object} - Response body from URL that was POSTed to
 */
async function postFormDataAsJson({ url, formData }) {
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: formDataJsonString,
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Event handler for a form submit event.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
 *
 * @param {SubmitEvent} event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const url = form.action;

  try {
    const formData = new FormData(form);

    const responseData = await postFormDataAsJson({ url, formData });
    await loadPage(); //päivitetään taulukkoon

    console.log({ responseData });
  } catch (error) {
    console.error(error);
  }
}

const exampleForm = document.getElementById("puhelintieto_lomake");
exampleForm.addEventListener("submit", handleFormSubmit);

// Muokkauslomakkeen lähetyksen käsittelijä
const editForm = document.getElementById("puhelintieto_muokkauslomake");
editForm.addEventListener("submit", handleEditFormSubmit);
