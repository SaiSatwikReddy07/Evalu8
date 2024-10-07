const student_info = JSON.parse(sessionStorage.getItem('student_info'))

const student_id = student_info['Roll Number']
const student_name = student_info['Name']

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

    document.getElementById('student-name').innerText = student_name

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

    window.addEventListener('message', (event) => {
        const tiles = document.querySelectorAll('.tile');
        let clickedDate = event.data;
        let [date, month, year] = clickedDate.split('/');
        if (date.length < 2) { date = '0' + date }
        if (month.length < 2) { month = '0' + month }
        let formattedDate = `${date}/${month}/${year}`;

        document.querySelectorAll('.tile').forEach(tile => {
            let tileDate = tile.querySelector('.test-date').innerText;
            if (formattedDate !== tileDate) {
                tile.style.display = "none";
            } else {
                tile.style.display = "flex";
            }
        });

        let anyTileVisible = false;
        for (const tile of tiles) {
            if (tile.style.display !== "none") {
                anyTileVisible = true;
                break;
            }
        }

        if (!anyTileVisible) {
            document.getElementById("no-tests").style.display = "flex";
            document.getElementById('no-tests-onload').style.display = 'none';
        } else {
            document.getElementById("no-tests").style.display = "none";
        }
    });

    const daysTag = document.querySelector(".days"),
        currentDate = document.querySelector(".current-date"),
        prevNextIcon = document.querySelectorAll(".icons span");

    let date = new Date(),
        currYear = date.getFullYear(),
        currMonth = date.getMonth();

    const months = ["January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"];

    const renderCalendar = () => {
        let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
            lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
            lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
            lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
        let liTag = "";

        for (let i = firstDayofMonth; i > 0; i--) {
            liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
        }

        for (let i = 1; i <= lastDateofMonth; i++) {
            let isToday = i === date.getDate() && currMonth === new Date().getMonth()
                        && currYear === new Date().getFullYear() ? "active" : "notactive";
            liTag += `<li class="${isToday}">${i}</li>`;
        }

        for (let i = lastDayofMonth; i < 6; i++) {
            liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
        }
        currentDate.innerText = `${months[currMonth]} ${currYear}`;
        daysTag.innerHTML = liTag;

        document.querySelectorAll('.days li').forEach(day => {
            day.addEventListener('click', (event) => {
                const day = event.target.innerText;
                const fullDate = `${day}/${currMonth + 1}/${currYear}`;
                window.parent.postMessage(fullDate, '*');
            });
        });
    }

    renderCalendar();

    prevNextIcon.forEach(icon => {
        icon.addEventListener("click", () => {
            currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
            if (currMonth < 0 || currMonth > 11) {
                date = new Date(currYear, currMonth, new Date().getDate());
                currYear = date.getFullYear();
                currMonth = date.getMonth();
            } else {
                date = new Date();
            }
            renderCalendar();
        });
    });
});


function loadTest(test_id) {

    sessionStorage.setItem('test_id', test_id)

    fetch('/load-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'test_id': test_id, 'student_id': student_id})
    })
    .then(response => response.json())
    .then(data => {
        questions = data['questions']
        sessionStorage.setItem('questions', JSON.stringify(questions))
        console.log(questions)
        window.location.href = data.redirect_url;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}


document.addEventListener('DOMContentLoaded', function() {

    fetch('/fetch-all-tests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'student_id': student_id})
    })
    .then(response => response.json())
    .then(tests => {

        let container = document.getElementById('activity-tiles')

        if (tests.length > 0) {

            let count = 0
            tests.forEach(test => {
                let result = addTestStatus(test)
                if (result['status'] === 'Active' || result['status'] === 'Upcoming'){
                    count += 1
                }
            })

            if (count === 0){
                document.getElementById("no-tests-onload").style.display = "flex";
            }

            tests.forEach(test => {
                let result = addTestStatus(test)
                    if (result['status'] === 'Active' || result['status'] === 'Upcoming') {
                        let card = document.createElement('div')
                        card.className = 'tile'
                        card.innerHTML = `
                        <h1 class="course-code">${test['course_id']}</h1>
                        <div class="test-details">
                            <p class="test-name">${test['test_name']}</p>
                            <p class="status">${result['status']}</p>
                        </div>

                        <div class="test-times">
                            <p class="test-date">${formatDate(test['test_date'])}</p>
                            <p class="test-time"><i class="material-symbols-outlined" id="timer-icon">timer</i>${calculateDuration(test['test_start_time'], test['test_end_time']) + ' mins'}</p>
                        </div>

                        
                        `
                        if (result['status'] === 'Active'){
                            card.innerHTML += `<button class="take-test" onclick="loadTest('${test['test_id']}')">Take test</button>`
                        } else if (result['status'] === 'Upcoming'){
                            card.innerHTML += `<button class="take-test" onclick="">Take test</button>`
                        }

                        container.appendChild(card)
                        }
                    })
        } else {
            document.getElementById("no-tests-onload").style.display = "flex";
        }

        document.querySelectorAll('.tile').forEach(tile => {
            const statusElement = tile.querySelector('.status');
            if (statusElement) {
                if (statusElement.innerText.trim() === "Upcoming") {
                    tile.querySelector('.take-test').style.opacity = 0.7;
                    tile.querySelector('.take-test').innerText = "Locked";
                } else {
                    statusElement.style.backgroundColor = "rgba(35, 150, 15, 0.5)";
                    tile.querySelector('.take-test').classList.add('take-test-transition');
                }
            }
        });

    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

})

function formatDate(inputDate) {
    const parts = inputDate.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return formattedDate;
}

function calculateDuration(startTime, endTime) {
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');

    const startDate = new Date();
    startDate.setHours(parseInt(startParts[0]));
    startDate.setMinutes(parseInt(startParts[1]));

    const endDate = new Date();
    endDate.setHours(parseInt(endParts[0]));
    endDate.setMinutes(parseInt(endParts[1]));

    const durationMs = endDate - startDate;
    const durationMinutes = durationMs / (1000 * 60); 

    return durationMinutes;
}

function addTestStatus(testData) {
    const currentDate = new Date(); 
    const testDate = new Date(testData.test_date); 
    const startTimeParts = testData.test_start_time.split(':'); 
    const endTimeParts = testData.test_end_time.split(':'); 

    testDate.setHours(parseInt(startTimeParts[0]));
    testDate.setMinutes(parseInt(startTimeParts[1]));

    const testEndDate = new Date(testDate);
    testEndDate.setHours(parseInt(endTimeParts[0]));
    testEndDate.setMinutes(parseInt(endTimeParts[1]));

    if (currentDate > testEndDate) {
        testData.status = 'Expired';
    } else if (currentDate >= testDate && currentDate <= testEndDate) {
        testData.status = 'Active';
    } else {
        testData.status = 'Upcoming';
    }

    return testData;
}

function logout(){
    sessionStorage.removeItem('student_id')
    sessionStorage.removeItem('student_info')
    redirect('login')
}