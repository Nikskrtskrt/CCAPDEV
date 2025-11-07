$(function() {
    function loadProfile() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
        
        alert('Please login first');
        window.location.href = '/users/login';
        return;
            }

        fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(user => { $('#fullName').text(user.fullName || 'N/A'); $('#email').text(user.email || 'N/A'); $('#passportNo').text(user.passportNo || 'N/A'); $('#role').text(user.role || 'N/A');
                 })
            .catch(() => {
                alert('Failed to load profile');
            });
    }

    loadProfile();

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
        alert("Password updated successfully (UI only - add server route to make functional).");
        $("#passwordForm")[0].reset();
    });
});