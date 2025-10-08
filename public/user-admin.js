$(function(){

    let users = [
        {name: "Joshua Lim",email: "joshua_emmanuel_lim@dlsu.edu.ph", role: "Admin"},
        {name: "Djuvalle",  email: "djuvalle@dlsu.edu.ph"           , role: "User"},
        {name: "Nicole",    email: "nicole@dlsu.edu.ph"             , role: "User"},
        {name: "Luis",      email: "luis@dlsu.edu.ph"               , role: "User"}
    ];

    function renderTable() {
        let tbody = $("#userTable tbody");
        tbody.empty();
        $.each(users, function(i, u) {
            tbody.append(`
            <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>
                <button class="btn btn-warning btn-sm edit-btn" data-index="${i}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-index="${i}">Delete</button>
                </td>
            </tr>
            `);
        });
    }

    renderTable();    

    // Add Flights
    $("#addUserBtn").click(function(){
        $("#modalTitle").text("Add User");
        $("userForm")[0].reset();
        $("#editIndex").val("");
    });

    //Flight Saving
    $("#saveUserBtn").click(function(){
        let user = {
            name: $("#name").val(),
            email: $("#email").val(),
            role: $("#role").val()
        }

    let index = $("#editIndex").val();

    if (index === ""){
        users.push(user);
    }
    else{
        users[index] = user;
    }

    $("#userModal").modal("hide");
        renderTable();
    }); 

    $(document).on("click", ".edit-btn", function(){
        let i = $(this).data("index");
        let u = users[i];
        $("#modalTitle").text("Edit User");
        $("#name").val(u.name);
        $("#email").val(u.email);
        $("#role").val(u.role);

        $("#editIndex").val(i);
        $("#userModal").modal("show");
    });

    $(document).on("click", ".delete-btn", function(){
        let i = $(this).data("index");
        if(confirm("confirm delete this user?")){
            users.splice(i,1);
            renderTable();
        }
    })

});