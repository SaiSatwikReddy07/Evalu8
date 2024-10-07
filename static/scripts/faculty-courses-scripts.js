let faculty_info = JSON.parse(sessionStorage.getItem('faculty_info'))

function logout(){
    sessionStorage.removeItem('faculty_info')
    sessionStorage.removeItem('faculty_id')
    redirect('login')
}

document.addEventListener('DOMContentLoaded', function() {

    const faculty_id = faculty_info['faculty_id']

    fetch('/get-faculty-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ faculty_id: faculty_id })
    })
    .then(response => {
        return response.json(); 
    })
    .then(faculty_info => {

        sessionStorage.setItem['faculty_info', faculty_info]

        const faculty_name = faculty_info['faculty_name']
        const faculty_date_of_birth = faculty_info['date_of_birth']

        const courses_string = faculty_info['courses'];

        const courses = courses_string.split(';').map(item => {
            const trimmed = item.trim();
            const elements = trimmed.slice(1, -1).split(', ');
            return elements;
        });

        let active_courses_container = document.getElementById('active-container');
        let inactive_courses_container = document.getElementById('inactive-container');

        courses.forEach(course => {

            let course_code = course[0]
            let course_name = course[1]
            let number_of_students = course[2]
            let batch = course[3]
            let status = course[4]

            let course_card = document.createElement('div')
            course_card.className = 'course-card';

            course_card.innerHTML = `
                <h1 class="course-code" id="course-code">${course_code}</h1>

                <div class="information">
                    <p class="course-name" id="course-name">${course_name}</p>
                    <div class="student-info">
                        <p id="student-count"><span class="material-symbols-outlined">person</span> ${number_of_students} Students</p>
                        <p id="student-batch"><span class="material-symbols-outlined">groups</span> ${batch.replaceAll('_', ' ')}</p>
                        <p id="${status.toLowerCase()}">${status}</p>
                    </div>
                </div>

                <div class="button-column">
                    <button class="make-inactive">Mark Inactive</button>
                    <button class="pin-course" onclick='pinCourse(this)'>Pin Course</button>
                    <button class="open-course">Open course</button>
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

function pinCourse(button) {
    const course_card = button.closest('.course-card');
    let course_id = course_card.querySelector('#course-code').innerText;
    let course_name = course_card.querySelector('#course-name').innerText;
    let students = course_card.querySelector('#student-count').innerText.replace('person', '');
    let batch = course_card.querySelector('#student-batch').innerText.replace('groups', '');

    let faculty_id = faculty_info['faculty_id'];

    let info = {
        faculty_id: faculty_id,
        course_id: course_id,
        course_name: course_name,
        students: students,
        batch: batch
    };

    fetch('/pin-course', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pinned_course_info: info })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
}