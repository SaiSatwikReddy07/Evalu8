let student_info = JSON.parse(sessionStorage.getItem('student_info'))

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
    sessionStorage.removeItem('student_info')
    sessionStorage.removeItem('student_id')
    redirect('login')
}

document.addEventListener('DOMContentLoaded', function(){

    `
Campus
"Coimbatore"

School
"School of AIE"

Mobile Number
9420020110

Personal Email
"aadya.goel@gmail.com"

College Email
"cb.en.u4aie21101@cb.students.amrita.edu"

Admission Type
"Merit"`

    const student_id = student_info['Roll Number']
    const name = student_info['Name']
    const program = student_info['Course']
    const admission_type = student_info['Admission Type']
    const batch = student_info['Batch']
    const campus = student_info['Campus']
    const school = student_info['School']
    const mobile_number = student_info['Mobile Number']
    const date_of_birth = student_info['DOB']
    const email = student_info['Personal Email']
    const college_email = student_info['College Email']

    document.getElementById('name').innerText = name
    document.getElementById('id').innerText = student_id
    document.getElementById('date-of-birth').innerText = date_of_birth
    document.getElementById('program').innerText = program
    document.getElementById('admission-type').innerText = admission_type
    document.getElementById('batch').innerText = batch
    document.getElementById('campus').innerText = campus
    document.getElementById('school').innerText = school
    document.getElementById('mobile-number').innerText = mobile_number
    document.getElementById('personal-email').innerText = email
    document.getElementById('college-email').innerText = college_email
})