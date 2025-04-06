document.getElementById("editProfileForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const formData = new FormData(this);
    
    try {
        const response = await fetch("../backend/update_profile.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        alert(result.message);

        if (result.success) {
            window.location.href = "profile.php";
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
});