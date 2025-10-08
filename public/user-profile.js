
$(function() {
    $("#changePassword").click(function() {
    let current = $("#currentPassword").val();
    let newPass = $("#newPassword").val();
    let confirm = $("#confirmPassword").val();

    if (!current || !newPass || !confirm) {
        alert("Please fill out all password fields.");
        return;
    }

    if (newPass !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    alert("Password updated successfully (UI only).");
    $("#passwordForm")[0].reset();
    });
});