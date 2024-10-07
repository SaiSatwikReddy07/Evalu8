// -------------------------------------------------------------

function showPassword() {
    document.getElementById("show-password").style.display = "none"
    document.getElementById("hide-password").style.display = "flex"
    document.getElementById("password-for-login").type = "text"
}

function hidePassword() {
    document.getElementById("hide-password").style.display = "none"
    document.getElementById("show-password").style.display = "flex"
    document.getElementById("password-for-login").type = "password"
}

function redirect(){
    const studentRadioButton = document.getElementById('position-student');
    const facultyRadioButton = document.getElementById('position-faculty');

    if (studentRadioButton.checked) {
        const student_id = document.getElementById('username-for-login').value
        sessionStorage.setItem('student_id', student_id)

        fetch('/redirect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page: 'showStudentDashboard', student_id: student_id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.redirect_url) {
                sessionStorage.setItem('student_info', JSON.stringify(data.student_info))
                window.location.href = data.redirect_url;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    } else if (facultyRadioButton.checked) {

        const faculty_id = document.getElementById('username-for-login').value

        fetch('/redirect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page: 'showFacultyDashboard', faculty_id: faculty_id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.redirect_url) {
                sessionStorage.setItem('faculty_info', JSON.stringify(data.faculty_info))
                window.location.href = data.redirect_url;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
        
    }
}


document.addEventListener('DOMContentLoaded', function() {

    document.getElementById("go-to-signup").addEventListener("click", function() {
        document.getElementById("main-container").classList.add("show-signup");
        document.getElementById("main-container").classList.remove("show-login");
    });

    document.getElementById("go-to-login").addEventListener("click", function() {
        document.getElementById("main-container").classList.add("show-login");
        document.getElementById("main-container").classList.remove("show-signup");
    });
})