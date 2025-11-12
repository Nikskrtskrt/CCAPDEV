$(document).ready(function () {
    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    const viewUserModal = new bootstrap.Modal(document.getElementById('viewUserModal'));

    const toastEl = $('#toastMsg');
    const toast = new bootstrap.Toast(toastEl[0]);

    function showToast(message, type = 'danger') {
        $('#toastMsg')
            .removeClass('text-bg-danger text-bg-success')
            .addClass(`text-bg-${type}`);

        $('#toastText').text(message);
        toast.show();
    }

    $(document).on('click','#addUserBtn', function () {
        $('#userModalTitle').text('Add New User');
        $('#userForm')[0].reset();
        $('#userId').val('');
        $('#password').prop('disabled', false);
        $('input, select').prop('disabled', false);
        $('#saveUserBtn').show();

        userModal.show();
    });

    $(document).on('click', '.view-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid user ID');

        $.ajax({
            url: `/api/users/${id}`,
            method: 'GET',

            success: function (data) {
                const user = data.user;
                const reservations = data.reservations;

                $('#viewUserModalTitle').text("User Information");
                $('#v_firstName').text(user.firstName);
                $('#v_lastName').text(user.lastName);
                $('#v_email').text(user.email);
                $('#v_role').text(user.role);
                $('#v_passportNo').text(user.passportNo);

                let tableHTML = '';

                if (reservations.length > 0) {
                    reservations.forEach(r => {
                        tableHTML += `
                            <tr>
                                <td>${r.flight?.flightNo || 'N/A'}</td>
                                <td>${r.flight?.date ? new Date(r.flight.date).toLocaleDateString() : 'N/A'}</td>
                                <td>${r.seatNo}</td>
                                <td>${r.fareClass}</td>
                                <td>${r.totalPrice}</td>
                                <td>${r.status}</td>
                            </tr>`;
                    });
                } else {
                    tableHTML = `
                        <tr>
                            <td colspan="6" class="text-center text-warning">
                                No reservations found.
                            </td>
                        </tr>`;
                }

                $('#reservationsTable tbody').html(tableHTML);

                viewUserModal.show();
            },

            error: function () {
                showToast('Failed to load user details.');
            }
        });
    });

    $(document).on('click', '.edit-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid user ID');

        $.ajax({
            url: `/api/users/${id}`,
            method: 'GET',

            success: function (data) {
                const user = data.user;

                $('#userModalTitle').text('Edit User');

                $('#userId').val(user._id);
                $('#firstName').val(user.firstName);
                $('#lastName').val(user.lastName);
                $('#email').val(user.email);
                $('#passportNo').val(user.passportNo);
                $('#role').val(user.role);

                $('input, select').prop('disabled', false);
                $('#saveUserBtn').show();

                userModal.show();
            },

            error: function () {
                showToast('Error loading user data');
            }
        });
    });

    $('#userForm').submit(function (e) {
        e.preventDefault();

        const id = $('#userId').val();

        const userData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#email').val(),
            passportNo: $('#passportNo').val(),
            role: $('#role').val(),
        };

        if (!id) {
            userData.password = 'Default123';
        }

        if (!userData.firstName || !userData.lastName || !userData.email || !userData.passportNo) {
            return showToast('Please fill in all fields');
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/users/${id}` : '/api/users';

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(userData),

            success: function () {
                showToast('User saved successfully!', 'success');
                userModal.hide();
                setTimeout(() => location.reload(), 900);
            },
            error: function (xhr) {
                showToast(xhr.responseJSON?.error || 'Error saving user');
            }
        });
    });

    $(document).on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        if (!id) return showToast('Invalid user ID');

        if (!confirm('Delete this user? All reservations will also be removed.')) return;

        $.ajax({
            url: `/api/users/${id}`,
            method: 'DELETE',

            success: function () {
                showToast('User deleted!', 'success');
                setTimeout(() => location.reload(), 700);
            },
            error: function () {
                showToast('Failed to delete user.');
            }
        });
    });

});
