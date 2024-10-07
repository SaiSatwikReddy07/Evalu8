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

function openCreateCourse(){
    document.getElementById("courses").style.display = 'none'
    document.getElementById("tests").style.display = 'none'

    fetch('/get-batches')
    .then(response => response.json())
    .then(batches => {
        batches = batches['STUDENTS'];
        let batch_selection = document.getElementById('batches');
        if (batch_selection) {
            batches.forEach(batch => {
                let option = document.createElement('option');
                option.value = batch;
                option.textContent = batch.replaceAll('_', ' ');
                batch_selection.appendChild(option);
            });
        } else {
            console.error('Batch selection element not found');
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

    document.getElementById("create-course").innerHTML = `
        <div id="create-course-row-one">
            <input placeholder="Course Code" id="course-code">
            <input placeholder="Course Name" id="course-name">
            <select name="batches" id="batches">
                <!--
                <option value="2021_AIE_B">2021_AIE_B</option>
                <option value="2021_AIE_A">2021_AIE_A</option>
                -->
            </select>
        </div>
        <div id="create-course-button-row" class="create-course-button-row">
            <button id="cancel-add-course" onclick="closeCreateCourse()">Cancel</button>
            <button id="add-course" onclick="createCourse()">Add Course</button>
        </div>
    `
    document.getElementById("create-course").style.display = 'flex'
}

function closeCreateCourse(){
    document.getElementById("courses").style.display = 'flex'
    document.getElementById("tests").style.display = 'flex'
    document.getElementById("create-course").style.display = 'none'
}

let faculty_info = JSON.parse(sessionStorage.getItem('faculty_info'))
const faculty_id = faculty_info['faculty_id']

document.addEventListener('DOMContentLoaded', function(){

    const faculty_name = faculty_info['faculty_name']
    const faculty_date_of_birth = faculty_info['date_of_birth']

    const courses_string = faculty_info['courses'];
    const courses = courses_string.split(';').map(item => {
        const trimmed = item.trim();
        const elements = trimmed.slice(1, -1).split(', ');
        return elements;
    });

    const pinned_courses_string = faculty_info['pinned_courses'];
    const pinned_courses = pinned_courses_string.split(';').map(item => {
        const trimmed = item.trim();
        const elements = trimmed.slice(1, -1).split(', ');
        return elements;
    });

    document.getElementById('faculty-name').innerText = faculty_name

    let pinned_courses_container = document.getElementById('pinned-courses-container')

    pinned_courses.forEach(pinned_course => {

        let course_code = pinned_course[0]
        let course_name = pinned_course[1]
        let number_of_students = pinned_course[2]
        let batch = pinned_course[3]    

        let pinned_course_card = document.createElement('div')
        pinned_course_card.className = 'pinned-course';

        pinned_course_card.innerHTML = `
        <div class="course-code">${course_code}</div>
        <div class="others">
            <div class="course-name">${course_name}</div>
            <div class="information">
                <div class="students">
                    <i class="material-symbols-outlined">person</i>
                    <p class="no-of-students">${number_of_students}</p>
                </div>

                <div class="batch">
                    <i class="material-symbols-outlined">groups</i>
                    <p class="batch">${batch.replaceAll('_', ' ')}</p>
                </div>

                <button class="remove-pinned"><i class="material-symbols-outlined">delete</i></button>
            </div>
        </div>
        `
        pinned_courses_container.appendChild(pinned_course_card)
        
    });
})


document.addEventListener('DOMContentLoaded', function() {
    
    const displayQuote = () =>{ 
        
        let index = Math.floor(Math.random()*data.length); 
      
        let quote = document.getElementById("quote");

        let quote_text = data[index].text; 
  
        let author = data[index].author; 
      
        if(!author){ 
            author = "Anonymous, type.fit"
        } 

        quote.innerHTML =`<h2 id="quote-text">${quote_text}</h2><br><p id="quote-author">~ ${author.split(',')[0]}</p>`;
    } 
   
    fetch("https://type.fit/api/quotes") 
        .then(function(response) { 
            return response.json();  
        }) 
        .then(function(data) { 
            this.data = data;  
            displayQuote()  
    });
})

function createCourse(){
    course_id = document.getElementById('course-code').value
    course_name = document.getElementById('course-name').value
    batch = document.getElementById('batches').value

    course_info = {
        course_id: course_id,
        course_name: course_name,
        batch: batch,
        faculty_id: faculty_id
    }

    fetch('/create-course', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ course_info: course_info })
    })
    .then(response => {
        return response.json(); 
    })

    document.getElementById('create-course').innerHTML = `
    <p>Course ${course_id} with name ${course_name} has been created succesfully.</p>
    <div class="create-course-button-row">
        <button onclick="redirect('facultyCourses')">Open Courses</button>
        <button onclick="closeCreateCourse()">Go back</button>
    </div>
    `
}

