$(function(){
    let users = [];
    function loadUsers() {
        fetch('/api/users')
        .then(res => res.json())
        .then(data => {
    users = data;
    renderTable();
})
    .catch(() => alert('Failed to load users'));
}

function renderTable() {
    let tbody = $("#userTable tbody");
    tbody.empty();
    $.each(users, function(i, u) {
    tbody.append(`
<tr>
    <td>${u.fullName}</td>
    <td>${u.email}</td>
    <td>${u.role}</td>

    <td>
    <button class="btn btn-warning btn-sm edit-btn" data-id="${u._id}">Edit</button>
    <button class="btn btn-danger btn-sm delete-btn" data-id="${u._id}">Delete</button>
    </td>
</tr>
        `);
    });
}

loadUsers();    

    $("#addUserBtn").click(function(){
    $("#modalTitle").text("Add User");
    $("#userForm")[0].reset();
    $("#editIndex").val("");
    $("#password").prop('required', true);
    });

    $("#saveUserBtn").click(function(){
        let userId = $("#editIndex").val();
        let userData = {fullName: $("#name").val(), email: $("#email").val(), role: $("#role").val()
    };

if (!userId) {
    userData.password = $("#password").val();
    userData.passportNo = "N/A";
}

let method = userId ? 'PUT' : 'POST';
let url = userId ? `/api/users/${userId}` : '/api/users/register';

fetch(url, {
    method: method,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(userData)
})
    .then(res => res.json())
    .then(response => {
    alert(response.message || 'User saved successfully');
    $("#userModal").modal("hide");
    loadUsers();
})
.catch(() => alert('Failed to save user'));
}); 

$(document).on("click", ".edit-btn", function(){
    let userId = $(this).data("id");
    fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(u => {
        $("#modalTitle").text("Edit User");
        $("#name").val(u.fullName);
        $("#email").val(u.email);
        $("#role").val(u.role);
        $("#password").prop('required', false);
        $("#editIndex").val(userId);
        $("#userModal").modal("show");
    });
});

$(document).on("click", ".delete-btn", function(){
    let userId = $(this).data("id");
    if(confirm("Confirm delete this user?")){
    fetch(`/api/users/${userId}`, {method: 'DELETE'})
    .then(() => {
    alert('User deleted successfully');
    loadUsers();
})
    .catch(() => alert('Failed to delete user'));
        }
    });
});