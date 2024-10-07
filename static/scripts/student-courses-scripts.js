let student_info = JSON.parse(sessionStorage.getItem('student_info'))
let student_id = student_info['Roll Number']

function logout(){
    sessionStorage.removeItem('student_id')
    sessionStorage.removeItem('student_info')
    redirect('login')
}

// --------------------- REDIRECT CODE -----------------------

function redirect(page) {
    fetch('/redirect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: page })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    fetch('/get-batch-courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ student_id: student_id })
    })
    .then(response => {
        return response.json(); 
    })
    .then(courses => {

        let active_courses_container = document.getElementById('active-container');
        let inactive_courses_container = document.getElementById('inactive-container');

        courses.forEach(course => {
            let course_code = course['course_id']
            let course_name = course['course_name']
            let number_of_students = course['no_of_students']
            let batch = course['batch']
            let status = course['active_status']
            let faculty_email = course['faculty_email']
            let faculty_name = course['faculty_name']

            let course_card = document.createElement('div')
            course_card.className = 'course-card';

            course_card.innerHTML = `
                <h1 class="course-code">${course_code}</h1>

                <div class="information">
                    <p class="course-name">${course_name}</p>
                    <div class="faculty-info">
                        <p id="faculty_name"><span class="material-symbols-outlined">person</span>${faculty_name}</p>
                        <p id="faculty_email"><span class="material-symbols-outlined">mail</span>${faculty_email}</p>
                        <p id="${status.toLowerCase()}">${status}</p>
                    </div>
                </div>

                <div class="button-column">
                    <button class="open-course">Open course</button>
                    <button class="create-test">Contact Faculty</button>
                </div>
                `

            if (status === 'Active'){
                active_courses_container.appendChild(course_card)
            } else if (status === 'Inactive'){
                inactive_courses_container.appendChild(course_card)
            }
        });
    })
})


// --------------------- REDIRECT CODE -----------------------

function redirect(page) {
    fetch('/redirect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: page })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ---------------------------------------------------------

function openInactive(){
    let inactive = document.getElementById('inactive-container')
    let button = document.getElementById('open-inactive')

    if (inactive.style.display === '') {
        inactive.style.display = 'none';
    }

    if ( inactive.style.display === 'none') {
        inactive.style.display = 'flex'
        button.classList.add('rotate')
    } else {
        inactive.style.display = 'none'
        button.classList.remove('rotate')
    }
}