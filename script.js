// Array to store registered users
var registeredUsers = [];

// Array to store transaction history
var transactions = [
    "Withdrawal $100",
    "Deposited $50",
    "Withdrawal $200"
];

// Get the list element for transactions
var transactionsList = document.getElementById('transactions');

// Loop through transactions and create list items
transactions.forEach(function(transaction) {
    var listItem = document.createElement('li');
    listItem.textContent = transaction;
    transactionsList.appendChild(listItem);
});

// Function to toggle between login and signup forms
function toggleForm(formId) {
    var loginForm = document.getElementById('loginForm');
    var signupForm = document.getElementById('signupForm');

    if (formId === 'loginForm') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else if (formId === 'signupForm') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';

        // Show step 1 and hide step 2 of signup form
        document.getElementById('signUpStep1').style.display = 'block';
        document.getElementById('signUpStep2').style.display = 'none';

        // Reset both steps of signup form
        document.getElementById('signUpStep1').reset();
        document.getElementById('signUpStep2').reset();
    }
}

// Function to handle user login
function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Check if username and password match a registered user
    var user = registeredUsers.find(function(user) {
        return user.username === username && user.password === password;
    });

    if (user) {
        // Hide login form, show logged in content, and display username
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('loggedInContent').style.display = 'block';
        document.getElementById('loggedInUsername').textContent = username;
    } else {
        alert("Invalid credentials. Please try again.");
    }
}

// Function to handle user logout
function logout() {
    // Show login form, hide logged in content, and clear username and password fields
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loggedInContent').style.display = 'none';
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
}

// Function to proceed to step 2 of signup
function proceedToStep2() {
    document.getElementById('signUpStep1').style.display = 'none';
    document.getElementById('signUpStep2').style.display = 'block';
}

// Function to go back to step 1 of signup
function goBack() {
    document.getElementById('signUpStep2').style.display = 'none';
    document.getElementById('signUpStep1').style.display = 'block';
}

// Event listener for login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var user = registeredUsers.find(function(user) {
        return user.username === username && user.password === password;
    });

    if (user) {
        // Redirect to sample.html upon successful login
        window.location.href = "sample.html";
    } else {
        alert("Invalid credentials. Please try again.");
    }
});

// Event listener for step 2 of signup form submission
document.getElementById('signUpStep2').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username2').value;
    var password = document.getElementById('password2').value;
    var confirmPassword = document.getElementById('confirmPassword2').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    var userExists = registeredUsers.some(function(user) {
        return user.username === username;
    });

    if (userExists) {
        alert("Username already exists. Please choose a different one.");
        return;
    }

    // Add user to registeredUsers array
    registeredUsers.push({ username: username, password: password });

    // Show step 1 and hide step 2 of signup form
    document.getElementById('signUpStep1').style.display = 'block';
    document.getElementById('signUpStep2').style.display = 'none';

    // Reset both steps of signup form
    document.getElementById('signUpStep1').reset();
    document.getElementById('signUpStep2').reset();

    // Toggle to login form
    toggleForm('loginForm');
});
