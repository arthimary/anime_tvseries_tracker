document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get("id");

    if (!showId) {
        document.getElementById("showDetails").innerHTML = "<p>Show not found!</p>";
        return;
    }

    fetch(`http://localhost/anime_tv_tracker/get_shows.php?id=${showId}`)
        .then(response => response.json())
        .then(show => {
            document.getElementById("showDetails").innerHTML = `
                <img src="${show.image_url}" alt="${show.title}">
                <h2>${show.title}</h2>
                <p><strong>Genre:</strong> ${show.genre}</p>
                <p><strong>Type:</strong> ${show.type}</p>
                <p><strong>Status:</strong> ${show.status}</p>
                <p><strong>Rating:</strong> ${show.rating}</p>
                <p>${show.description}</p>
            `;
        })
        .catch(error => console.error("Error fetching show details:", error));
});