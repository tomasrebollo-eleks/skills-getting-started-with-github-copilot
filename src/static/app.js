document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Crear lista de participantes con icono de eliminar
        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list no-bullets";
        details.participants.forEach(participant => {
          const li = document.createElement("li");
          li.className = "participant-item";
          li.innerHTML = ` 
            <span class="participant-email">${participant}</span> 
            <button class="delete-participant-btn" title="Eliminar" data-activity="${name}" data-email="${participant}"> 
              <span class="delete-icon" aria-hidden="true"> 
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> 
                  <rect x="5" y="8" width="1.5" height="6" rx="0.75" fill="#c62828"/> 
                  <rect x="9.25" y="8" width="1.5" height="6" rx="0.75" fill="#c62828"/> 
                  <rect x="13.5" y="8" width="1.5" height="6" rx="0.75" fill="#c62828"/> 
                  <rect x="3" y="5" width="14" height="2" rx="1" fill="#c62828"/> 
                  <rect x="7" y="2" width="6" height="2" rx="1" fill="#c62828"/> 
                  <rect x="4" y="7" width="12" height="10" rx="2" stroke="#c62828" stroke-width="1.5" fill="none"/> 
                </svg> 
              </span> 
            </button> 
          `; 
          participantsList.appendChild(li);
        });

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong></p>
        `;
        activityCard.appendChild(participantsList);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Delegar evento para eliminar participante
      activitiesList.addEventListener("click", async (e) => {
        if (e.target.closest(".delete-participant-btn")) {
          const btn = e.target.closest(".delete-participant-btn");
          const activity = btn.getAttribute("data-activity");
          const email = btn.getAttribute("data-email");
          if (confirm(`¿Eliminar a ${email} de ${activity}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/participant?email=${encodeURIComponent(email)}`, {
                method: "DELETE"
              });
              const result = await response.json();
              if (response.ok) {
                messageDiv.textContent = result.message;
                messageDiv.className = "success";
                fetchActivities();
              } else {
                messageDiv.textContent = result.detail || "Error al eliminar participante";
                messageDiv.className = "error";
              }
              messageDiv.classList.remove("hidden");
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
            } catch (error) {
              messageDiv.textContent = "No se pudo eliminar. Intenta de nuevo.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
            }
          }
        }
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Actualizar la lista de actividades
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
