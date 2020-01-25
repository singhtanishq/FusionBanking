function toggleForm(formId) {
    var loginForm = document.getElementById('loginForm');
    var signupForm = document.getElementById('signupForm');

    if (formId === 'loginForm') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else if (formId === 'signupForm') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';

        // Reset the signup form fields
        document.getElementById('signUpStep1').style.display = 'block';
        document.getElementById('signUpStep2').style.display = 'none';
        document.getElementById('signUpStep1').reset();
        document.getElementById('signUpStep2').reset();
    }
}

function proceedToStep2() {
    document.getElementById('signUpStep1').style.display = 'none';
    document.getElementById('signUpStep2').style.display = 'block';
}

function goBack() {
    document.getElementById('signUpStep2').style.display = 'none';
    document.getElementById('signUpStep1').style.display = 'block';
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (username === "admin" && password === "password123") {
        window.location.href = "sample.html";
    } else {
        alert("Invalid credentials. Please try again.");
    }
});

document.getElementById('signUpStep2').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username2').value;
    var password = document.getElementById('password2').value;
    var confirmPassword = document.getElementById('confirmPassword2').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    alert("User registered successfully!");
    
    document.getElementById('signUpStep1').style.display = 'block';
    document.getElementById('signUpStep2').style.display = 'none';
    document.getElementById('signUpStep1').reset();
    document.getElementById('signUpStep2').reset();
    
    toggleForm('loginForm');
});
