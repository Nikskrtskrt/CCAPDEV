$(document).ready(function(){
    

    $('#loginForm').submit(function(e){
        e.preventDefault();

        $('#loginError').hide().text('');
        const $btn = $(this).find('button[type="submit"]');
        const originalText = $btn.text();

        $btn.prop('disabled', true).text('Logging in...');

        const loginData = {
            email: $('#email').val().trim(),
            password: $('#password').val()
        };

        $.ajax({
            url: '/login', 
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            success: function(response){
                window.location.href = response.redirectUrl;
            }, 
            error: function(xhr){
                $btn.prop('disabled', false).text(originalText);

                const errorMsg = xhr.responseJSON?.error || 'An unexpected error occured';
                $('#loginError').text(errorMsg).show();
            }
        });
    });

    $('#registerForm').submit(function(e){
        e.preventDefault();

        $('#registerError').hide().text('');
        const $btn = $(this).find('button[type="submit"]');
        const originalText = $btn.text();

        const password = $('#password').val();
        if(password.length < 6){
            $('#registerError').text('Password must be at least 6 characters long.').show();
            return;
        }
        
        $btn.prop('disabled', true).text('Registering...');

        const registerData = {
            firstName:  $('#firstName').val().trim(),
            lastName:   $('#lastName').val().trim(),
            email:      $('#email').val().trim(),
            passportNo: $('#passportNo').val().trim(),
            password:   password
        };

        $.ajax({
            url: '/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(registerData),
            success: function(response){
                alert('Registration successful! Please log in.');
                window.location.href = '/login';
            },
            error: function(xhr){
                $btn.prop('disabled', false).text(originalText);

                const errorMsg = xhr.responseJSON?.error || 'Registration failed';
                $('#registerError').text(errorMsg).show();
            }
        });
    });
});