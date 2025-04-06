document.addEventListener("DOMContentLoaded", function () {
    loadShows();

    // Toggle Dark Mode
    const toggleBtn = document.getElementById("toggleDarkMode");
    if (toggleBtn) {
        const darkMode = localStorage.getItem("darkMode");
        if (darkMode === "enabled") {
            document.body.classList.add("dark-mode");
        }

        toggleBtn.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            const mode = document.body.classList.contains("dark-mode") ? "enabled" : "disabled";
            localStorage.setItem("darkMode", mode);
        });
    }

    // Add Show
    const form = document.getElementById("addShowForm");
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const showData = {
                title: document.getElementById("title").value,
                type: document.getElementById("type").value,
                genre: document.getElementById("genre").value,
                release_year: document.getElementById("release_year").value,
                status: document.getElementById("status").value,
                rating: document.getElementById("rating").value,
                description: document.getElementById("description").value,
                image_url: document.getElementById("image_url").value,
                user_id:1
            };

            try {
                const response = await fetch("http://localhost/anime_tv_tracker/add_show.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(showData)
                });

                const result = await response.json();
                alert(result.message || result.error);
                loadShows();
            }catch (error) {
                console.error("Error adding show:", error);
            }
        });
    }
});

function loadShows() {
    fetch("http://localhost/anime_tv_tracker/get_shows.php")
        .then(response => response.json())
        .then(shows => {
            const showGrid = document.getElementById("show-grid");
            showGrid.innerHTML = "";

            shows.forEach((show) => {
                const isFavorite = checkFavorite(show.id);

                const card = document.createElement("div");
                card.className = "show-card";
                card.innerHTML = `
                   <img src="${show.image_url}" alt="${show.title}">
                   <h3 class="show.title" data-id="${show.title}">${show.title}</h3>
                   <p><strong>Type:</strong> ${show.type}</p>
                   <p><strong>Genre:</strong> ${show.genre}</p>
                   <button onclick="viewDetails('${encodeURIComponent(JSON.stringify(show))}')">View Details</button>
                   <button onclick="deleteShow(${show.id})">Delete</button>
                `;
                const statusElement = document.createElement("p");
                statusElement.className = "show-status";
                statusElement.textContent = show.status;  // or whatever variable you used for status
                card.appendChild(statusElement);

                showGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading shows:", error);
        });
        document.querySelectorAll(".show-title").forEach(title => {
            title.addEventListener("click", () => {
              const showId = title.getAttribute("data-id");
              toggleFavorite(showId);
              title.classList.toggle("favorite-title");
            });
          
            // Show favorite style if it's already in favorites
            const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
            if (favorites.includes(title.getAttribute("data-id"))) {
              title.classList.add("favorite-title");
            }
          });
}
document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const cards = document.querySelectorAll(".show-card");
    let resultsFound = false;  // Flag to check if any result matches the search

    cards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        if (title.includes(query)) {
            card.style.display = "block";  // Show the card if it matches the search
            resultsFound = true;  // Mark that at least one result is found
        } else {
            card.style.display = "none";  // Hide the card if it doesn't match the search
        }
    });

    // Show "No results found"message if no results are found
    const noResultsMessage = document.getElementById("no-results");
    if (!resultsFound) {
        noResultsMessage.style.display = "block";
    } else {
        noResultsMessage.style.display = "none";
    }
});
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        this.classList.add("active");
  
        const selectedStatus = this.getAttribute("data-status");
        const cards = document.querySelectorAll(".show-card");
  
        cards.forEach(card => {
          const cardStatusElement = card.querySelector(".show-status");
          const cardStatus = cardStatusElement ? cardStatusElement.textContent.trim() : "";
  
           if (selectedStatus === "All" || cardStatus === selectedStatus) {
             card.style.display = "block";
           } else {
             card.style.display = "none";
           }
        });
    });
});
function viewDetails(showStr) {
    const show = JSON.parse(decodeURIComponent(showStr));
    const params = new URLSearchParams(show).toString();
    window.location.href = `show_details.html?${params}`;
}

function deleteShow(id) {
    if (confirm("Are you sure you want to delete this show?")) {
        fetch("http://localhost/anime_tv_tracker/delete_show.php", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        })
        .then(res => res.json())
        .then(result => {
            alert(result.message || result.error);
            loadShows();
        })
        .catch(err => {
            console.error("Error deleting show:", err);
        });
    }
}

function toggleFavorite(showId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(showId)) {
        favorites = favorites.filter(id => id !== showId);
    } else {
        favorites.push(showId);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadShows(); // refresh the cards to update the favorite button
}
function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    fetch("http://localhost/anime_tv_tracker/get_shows.php")
        .then(res => res.json())
        .then(shows => {
            const showGrid = document.getElementById("show-grid");
            showGrid.innerHTML = "";

            const favoriteShows = shows.filter(show => favorites.includes(show.id));

            if (favoriteShows.length === 0) {
                showGrid.innerHTML = "<p>No favorites added.</p>";
            } else {
                favoriteShows.forEach(show => {
                    const card = document.createElement("div");
                    card.className = "show-card";
                    card.innerHTML = `
                      <img src="${show.image_url}" alt="${show.title}">
                      <h3>${show.title}</h3>
                      <p><strong>Type:</strong> ${show.type}</p>
                      <p><strong>Genre:</strong> ${show.genre}</p>
                      <button onclick="viewDetails('${encodeURIComponent(JSON.stringify(show))}')">View Details</button>
                      <button onclick="deleteShow(${show.id})">Delete</button>
                      <p><strong>Status:</strong> ${show.status}</p>
                      `;
                    const reviewBtn = document.createElement("button");
                    reviewBtn.textContent = "Reviews";
                    reviewBtn.addEventListener("click", () => openReviewModal(show.id));
                    card.appendChild(reviewBtn);// Add the heart icon at the bottom-right
                    const favoriteIcon = document.createElement("div");
                    favoriteIcon.className = "favorite-icon";
                    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
                    favoriteIcon.innerHTML = favorites.includes(show.id) ? "★" : "☆";
                    favoriteIcon.onclick = () => toggleFavorite(show.id);

                    card.appendChild(favoriteIcon);
                    showGrid.appendChild(card);
                });
            }
        });
}
// Show modal
function openReviewModal(showId) {
    document.getElementById("reviewModal").style.display = "block";
    document.getElementById("reviewShowId").value = showId;
    loadReviews(showId);
}

// Close modal
document.getElementById("closeModal").onclick = function () {
    document.getElementById("reviewModal").style.display = "none";
};

// Submit review
document.getElementById("reviewForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const showId = document.getElementById("reviewShowId").value;
    const rating = document.getElementById("reviewRating").value;
    const review = document.getElementById("reviewText").value;

    fetch("../backend/add_review.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `show_id=${showId}&rating=${rating}&review=${encodeURIComponent(review)}`
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        loadReviews(showId);
        document.getElementById("reviewForm").reset();
    });
});

// Load reviews
function loadReviews(showId) {
    fetch(`../backend/get_reviews.php?show_id=${showId}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("reviewsContainer");
            container.innerHTML = "";
            if (data.length === 0) {
                container.innerHTML = "<p>No reviews yet.</p>";
                return;
            }
            data.forEach(review => {
                const div = document.createElement("div");
                div.style = "background: #f9f9f9; padding: 10px; border-radius: 10px; box-shadow: 0 0 5px rgba(0,0,0,0.1); margin-bottom: 15px;";
                div.innerHTML = `
                    <p><strong>Rating:</strong> ${"⭐️".repeat(review.rating)} (${review.rating}/10)</p>
                    <p>${review.text}</p>
                `;
                reviewsContainer.appendChild(div);
            });
        });
}
function checkFavorite(showId) {const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    return favorites.includes(showId);
}

function toggleFavorite(showId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(showId)) {
        favorites = favorites.filter(id => id !== showId);
    } else {
        favorites.push(showId);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadShows(); // refresh the cards to update the favorite button
}
// Show modal
function openReviewModal(showId) {
    document.getElementById("reviewModal").style.display = "block";
    document.getElementById("reviewShowId").value = showId;
    loadReviews(showId);
}

// Close modal
document.getElementById("closeModal").onclick = function () {
    document.getElementById("reviewModal").style.display = "none";
};

// Submit review
document.getElementById("reviewForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const showId = document.getElementById("reviewShowId").value;
    const rating = document.getElementById("reviewRating").value;
    const review = document.getElementById("reviewText").value;

    fetch("../backend/add_review.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `show_id=${showId}&rating=${rating}&review=${encodeURIComponent(review)}`
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        loadReviews(showId);
        document.getElementById("reviewForm").reset();
    });
});// Load reviews
function loadReviews(showId) {
    fetch(`../backend/get_reviews.php?show_id=${showId}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("reviewsContainer");
            container.innerHTML = "";
            if (data.length === 0) {
                container.innerHTML = "<p>No reviews yet.</p>";
                return;
            }
            data.forEach(review => {
                const div = document.createElement("div");
                div.style = "background: #f9f9f9; padding: 10px; border-radius: 10px; box-shadow: 0 0 5px rgba(0,0,0,0.1); margin-bottom: 15px;";
                div.innerHTML = `
                    <p><strong>Rating:</strong> ${"⭐️".repeat(review.rating)} (${review.rating}/10)</p>
                    <p>${review.text}</p>
                `;
                reviewsContainer.appendChild(div);
            });
        });
}
function toggleFavorite(showId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(showId)) {
        favorites = favorites.filter(id => id !== showId);
    } else {
        favorites.push(showId);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadShows(); // or whatever function reloads the show grid
}
function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    fetch("http://localhost/anime_tv_tracker/get_shows.php")
        .then(res => res.json())
        .then(shows => {
            const showGrid = document.getElementById("show-grid");
            showGrid.innerHTML = "";

            const favoriteShows = shows.filter(show => favorites.includes(show.id));

            if (favoriteShows.length === 0) {
                showGrid.innerHTML = "<p>No favorites added.</p>";
            } else {
                favoriteShows.forEach(show => {
                    const card = document.createElement("div");
                    card.className = "show-card";
                    card.innerHTML = `
                      <img src="${show.image_url}" alt="${show.title}">
                      <h3>${show.title}</h3>
                      <p><strong>Type:</strong> ${show.type}</p>
                      <p><strong>Genre:</strong> ${show.genre}</p>
                      <button onclick="viewDetails('${encodeURIComponent(JSON.stringify(show))}')">View Details</button>
                      <button onclick="deleteShow(${show.id})">Delete</button>
                      <p><strong>Status:</strong> ${show.status}</p>
                      `;
                    const reviewBtn = document.createElement("button");
                    reviewBtn.textContent = "Reviews";
                    reviewBtn.addEventListener("click", () => openReviewModal(show.id));
                    card.appendChild(reviewBtn);

                    // Add the heart icon at the bottom-right
                    const favoriteIcon = document.createElement("div");
                    favoriteIcon.className = "favorite-icon";
                    favoriteIcon.innerHTML = favorites.includes(show.id) ? "★" : "☆";
                    favoriteIcon.onclick = () => toggleFavorite(show.id);

                    card.appendChild(favoriteIcon);
                    showGrid.appendChild(card);
                });
            }
        });
}
// Show modal
function openReviewModal(showId) {
    document.getElementById("reviewModal").style.display = "block";
    document.getElementById("reviewShowId").value = showId;
    loadReviews(showId);
}

// Close modal
document.getElementById("closeModal").onclick = function () {
    document.getElementById("reviewModal").style.display = "none";
};

// Submit review
document.getElementById("reviewForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const showId = document.getElementById("reviewShowId").value;
    const rating = document.getElementById("reviewRating").value;
    const review = document.getElementById("reviewText").value;fetch("../backend/add_review.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `show_id=${showId}&rating=${rating}&review=${encodeURIComponent(review)}`
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        loadReviews(showId);
        document.getElementById("reviewForm").reset();
    });
});

// Load reviews
function loadReviews(showId) {
    fetch(`../backend/get_reviews.php?show_id=${showId}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("reviewsContainer");
            container.innerHTML = "";
            if (data.length === 0) {
                container.innerHTML = "<p>No reviews yet.</p>";
                return;
            }
            data.forEach(review => {
                const div = document.createElement("div");
                div.style = "background: #f9f9f9; padding: 10px; border-radius: 10px; box-shadow: 0 0 5px rgba(0,0,0,0.1); margin-bottom: 15px;";
                div.innerHTML = `
                    <p><strong>Rating:</strong> ${"⭐️".repeat(review.rating)} (${review.rating}/10)</p>
                    <p>${review.text}</p>
                `;
                reviewsContainer.appendChild(div);
            });
        });
}
