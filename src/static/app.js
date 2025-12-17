
document.addEventListener('DOMContentLoaded', function() {
  // Registration participants (localStorage demo)
  const form = document.getElementById('registration-form');
  const participantsList = document.getElementById('participants-list');
  if (participantsList) {
    participantsList.style.listStyleType = 'none';
    participantsList.style.paddingLeft = '0';
  }

  function getParticipants() {
    return JSON.parse(localStorage.getItem('participants') || '[]');
  }
  function setParticipants(participants) {
    localStorage.setItem('participants', JSON.stringify(participants));
  }
  function renderParticipants() {
    if (!participantsList) return;
    participantsList.innerHTML = '';
    const participants = getParticipants();
    participants.forEach((name, idx) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      const span = document.createElement('span');
      span.textContent = name;
      span.style.flexGrow = '1';
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.title = 'Unregister';
      deleteBtn.style.marginLeft = '8px';
      deleteBtn.style.background = 'none';
      deleteBtn.style.border = 'none';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.fontSize = '1em';
      deleteBtn.setAttribute('aria-label', 'Unregister participant');
      deleteBtn.addEventListener('click', function() {
        const updated = getParticipants();
        updated.splice(idx, 1);
        setParticipants(updated);
        renderParticipants();
      });
      li.appendChild(span);
      li.appendChild(deleteBtn);
      participantsList.appendChild(li);
    });
  }
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const nameInput = document.getElementById('name');
      const name = nameInput.value.trim();
      if (name) {
        const participants = getParticipants();
        participants.push(name);
        setParticipants(participants);
        renderParticipants();
        nameInput.value = '';
      }
    });
    renderParticipants();
  }

  // Activities API logic (if present)
  const activitiesList = document.getElementById('activities-list');
  const activitySelect = document.getElementById('activity');
  const signupForm = document.getElementById('signup-form');
  const messageDiv = document.getElementById('message');

  async function fetchActivities() {
    if (!activitiesList || !activitySelect) return;
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      activitiesList.innerHTML = "";
        // Always add the default option first
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        const spotsLeft = details.max_participants - details.participants.length;
        const participantsListHtml = details.participants.length > 0
          ? `<ul class="participants-list">${details.participants.map(p => `<li>${p}</li>`).join('')}</ul>`
          : '<p>No participants yet.</p>';
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Current Participants:</h5>
            ${participantsListHtml}
          </div>
        `;
        activitiesList.appendChild(activityCard);
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  if (signupForm && messageDiv && activitySelect && activitiesList) {
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
        } else {
          messageDiv.textContent = result.detail || "An error occurred";
          messageDiv.className = "error";
        }
        messageDiv.classList.remove("hidden");
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
    fetchActivities();
    } else if (activitiesList && activitySelect) {
      // If only activities UI is present, still fetch activities
      fetchActivities();
    }
  }
});

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

        const participantsList = details.participants.length > 0
          ? `<ul class="participants-list">${details.participants.map(p => `<li>${p}</li>`).join('')}</ul>`
          : '<p>No participants yet.</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Current Participants:</h5>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
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
