<?php
session_start();
require '../backend/db_connect.php';

if (!isset($_SESSION["user_id"])) {
    header("Location: login.html");
    exit();
}

$user_id = $_SESSION["user_id"];
$stmt = $conn->prepare("SELECT username, email, profile_pic FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Profile</h2>
    <img src="<?= $user['profile_pic'] ?: 'default-avatar.png' ?>" alt="Profile Picture" width="100">
    <p><strong>Username:</strong> <?= $user['username'] ?></p>
    <p><strong>Email:</strong> <?= $user['email'] ?></p>
    <a href="edit_profile.html">Edit Profile</a>
    <a href="logout.php">Logout</a>
</body>
</html>