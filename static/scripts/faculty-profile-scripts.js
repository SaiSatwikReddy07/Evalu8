let faculty_info = JSON.parse(sessionStorage.getItem('faculty_info'))

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

function logout(){
    sessionStorage.removeItem('faculty_info')
    sessionStorage.removeItem('faculty_id')
    redirect('login')
}

document.addEventListener('DOMContentLoaded', function(){

    const faculty_id = faculty_info['faculty_id']
    const name = faculty_info['faculty_name']
    const program = faculty_info['program']
    const specailization = faculty_info['specialization']
    const batch = faculty_info['batch']
    const campus = faculty_info['campus']
    const school = faculty_info['school']
    const mobile_number = faculty_info['mobile_number']
    const date_of_birth = faculty_info['date_of_birth']
    const email = faculty_info['email']
    const college_email = faculty_info['college_email']

    document.getElementById('name').innerText = name
    document.getElementById('id').innerText = faculty_id
    document.getElementById('date-of-birth').innerText = date_of_birth
    document.getElementById('program').innerText = program
    document.getElementById('specialization').innerText = specailization
    document.getElementById('batch').innerText = batch
    document.getElementById('campus').innerText = campus
    document.getElementById('school').innerText = school
    document.getElementById('mobile-number').innerText = mobile_number
    document.getElementById('personal-email').innerText = email
    document.getElementById('college-email').innerText = college_email
})