let questions = JSON.parse(sessionStorage.getItem('questions'))
questions = questions[0]['questions']
let answers = questions
let test_id = sessionStorage.getItem('test_id')

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

let test_start_time = null;
let test_end_time = null;

document.addEventListener('DOMContentLoaded', function() {
    let timerInterval;

    fetch('/get-times', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test_id: test_id })
    })
    .then(response => {
        return response.json(); // Parse JSON response
    })
    .then(data => {
        // Update test_start_time and test_end_time
        const test_start_time = data[0]['test_start_time'];
        const test_end_time = data[0]['test_end_time'];
        
        console.log('Start Time:', test_start_time);
        console.log('End Time:', test_end_time);

        const [startHour, startMinute] = test_start_time.split(':').map(Number);
        const [endHour, endMinute] = test_end_time.split(':').map(Number);

        const startTime = new Date();
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);

        function updateTimer() {
            const currentTime = new Date();
            let remaining_seconds = Math.floor((endTime.getTime() - currentTime.getTime()) / 1000);
            const total_seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

            if (remaining_seconds < 0) {
                remaining_seconds = 0;
                clearInterval(timerInterval);
            }

            // Convert remaining seconds to hours, minutes, and seconds
            const remainingHours = Math.floor(remaining_seconds / 3600);
            const remainingMinutes = Math.floor((remaining_seconds % 3600) / 60);
            const remainingSecondsFinal = remaining_seconds % 60;

            // Format hours and minutes
            const formattedHours = remainingHours.toString().padStart(2, '0');
            const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
            const formattedSeconds = remainingSecondsFinal.toString().padStart(2, '0');

            const timeFormat = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

            // Update UI elements
            const timerDiv = document.getElementById("timer-bar-inner");
            const timeLeftDiv = document.getElementById("time-left");

            timerDiv.style.width = `${(remaining_seconds / total_seconds) * 100}%`;
            timeLeftDiv.innerText = timeFormat;

            // Check if time is up
            if (remaining_seconds <= 0) {
                let container = document.getElementById("container");
                container.innerHTML = `<h1 id="timeup-note">The test duration has reached its limit..</h1><p id="auto-submit">Your responses will be automatically saved.</p><button onclick="openDashboard()" id="open-dashboard">Go back to Home</button>`; 
                container.style.justifyContent = "center";
                container.style.alignItems = "center";
                container.style.flexDirection = "column";
            }

            const warningDiv = document.getElementById("warning-note");

            if (remaining_seconds === 60){
                openWarning();
                warningDiv.innerText = "Only 1 minute left. Hurry Up!";
            } else if (remaining_seconds === 10) {
                openWarning();
                warningDiv.innerText = "Only 10 seconds left. Hurry Up!!";
            }
        }
    })
    .catch(error => console.error('Error fetching times:', error));
});



document.addEventListener("DOMContentLoaded", function () {

    function addMCQQuestion(question) {
        single_question_div = document.getElementById("all-questions")

        let question_data_div = document.createElement('div')
        question_data_div.className = "question-data"
        let question_number = questions.indexOf(question) + 1
        question_data_div.id = `Q-${question_number}`

        let qtype = question['question_type']
        let optionsHTML = ''
        if (qtype === 'Single correct'){
            optionsHTML = 
            `
            <div class="options">
                <div class="option">
                    <input type="radio" id="question-${question_number}-option-1" name="options-for-question-${question_number}">
                    <label for="question-${question_number}-option-1">${question['option_1']}</label>
                </div>

                <div class="option">
                    <input type="radio" id="question-${question_number}-option-2" name="options-for-question-${question_number}">
                    <label for="question-${question_number}-option-2">${question['option_2']}</label>
                </div>

                <div class="option">
                    <input type="radio" id="question-${question_number}-option-3" name="options-for-question-${question_number}">
                    <label for="question-${question_number}-option-3">${question['option_3']}</label>
                </div>

                <div class="option">
                    <input type="radio" id="question-${question_number}-option-4" name="options-for-question-${question_number}">
                    <label for="question-${question_number}-option-4">${question['option_4']}</label>
                </div>
            </div>
            `
        } else if (qtype === 'Multi correct'){
            optionsHTML = 
            `
            <div class="options">
                <div class="option">
                    <input type="checkbox" id="question-${question_number}-option-1" name="options-for-question-${question_number}">
                    <label for="question-${question_number}-option-1">${question['option_1']}</label>
                </div>

                <div class="option">
                    <input type="checkbox" id="question-${question_number}-option-2" name="options-for-question-${question_number}">
                    <label for="question-${question_number}-option-2">${question['option_2']}</label>
                </div>

                <div class="option">
                    <input type="checkbox" id="question-${question_number}-option-3" name="options-for-question-${question_number}">
                    <label for="question-${question_number}-option-3">${question['option_3']}</label>
                </div>

                <div class="option">
                    <input type="checkbox" id="question-${question_number}-option-4" name="options-for-question-${question_number}">
                    <label for="question-${question_number}-option-4">${question['option_4']}</label>
                </div>
            </div>
            `
        }


        question_data_div.innerHTML = 
        `
        <div id="question-number-head">Question <span id="question-number">${question_number}</span> </div>

        <div class="question">
            ${question['question_text']}
        </div>

        ${optionsHTML}

        <div class="test-buttons">
            <button id="previous" class="previous" onclick="previousQuestion(${question_number})"><i class="fa-solid fa-chevron-left"></i>Previous</button>
            <button id="save" class="save" onclick="saveAnswers()">Save</button>
            <button id="next" class="next" onclick="nextQuestion(${question_number})">Next<i class="fa-solid fa-chevron-right"></i></button>
        </div>
        `
    
        single_question_div.appendChild(question_data_div)
    }

    function addCodingQuestion(question) {
        single_question_div = document.getElementById("all-questions")

        let question_data_div = document.createElement('div')
        question_data_div.className = "question-data"

        let question_number = questions.indexOf(question) + 1
        question_data_div.id = `Q-${question_number}`

        question_data_div.innerHTML = 
        `
        <div id="question-number-head">Question <span id="question-number">${question_number}</span> </div>

        <div class="question">
            ${question['question_text']}
        </div>

        <div class="replace-options">
            <div class="e8-code-container" id="e8-code-container-${questions.indexOf(question) + 1}">
                <p id="code-editor-head">EVALU8 CODE EDITOR &lt;/&gt;<span class="code-language" id="code-language-${questions.indexOf(question) + 1}"></span></p>
        
                <div class="evalu8-code-editor" id="evalu8-code-editor-${questions.indexOf(question) + 1}"></div>
            </div>

            <div class="logs-and-desc">
                <div class="logs" id="code-logs-${questions.indexOf(question) + 1}" placeholder="Logs of your program will be shown here"></div>
                <div class="desc" id="code-desc-${questions.indexOf(question) + 1}" contenteditable='true' placeholder="Explain the logic of your program here..."></div>
            </div>
        </div>

        <div class="test-buttons">
            <button id="previous" class="previous" onclick="previousQuestion(${question_number})"><i class="fa-solid fa-chevron-left"></i>Previous</button>
            <button id="save" class="save" onclick="saveAnswers()">Save</button>
            <button id="next" class="next" onclick="nextQuestion(${question_number})">Next<i class="fa-solid fa-chevron-right"></i></button>
        </div>
        `
        single_question_div.appendChild(question_data_div)

        fetch('/readcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: questions[questions.indexOf(question)]['student_solution'] })
        })
        .then(response => response.text())
        .then(code => {
            let code_lines = code.split("\n");

            code_language = question['language']
            code_type = question['question_type']

            let code_container = document.getElementById(`e8-code-container-${questions.indexOf(question) + 1}`)

            let code_editor = document.getElementById(`evalu8-code-editor-${questions.indexOf(question) + 1}`);
            document.getElementById(`code-language-${questions.indexOf(question) + 1}`).innerText = code_language

            for (let code_line_number = 0; code_line_number < code_lines.length; code_line_number++) {
                
                let line = code_lines[code_line_number];

                let single_line = document.createElement('div')
                single_line.className = "code-row"

                let code_number = document.createElement('p')
                code_number.className = "code-row-number"

                let code_line = document.createElement('code')
                code_line.className = "code-row-text"

                if (code_language === 'Matlab') {

                    if (line.includes("%E8")) {
                        line = line.replace("%E8", "%E8 % Add your code here")
                        line_parts = line.replace(/ /g, '&nbsp;').split('%E8')
                        code_line.innerHTML = `<p>${line_parts[0]}<span class="comment">${line_parts[1]}</span></p>`;
                        code_line.contentEditable = true
                        code_line.spellcheck = false;

                        if (code_type === 'Fill in the blank') {
                            code_line.addEventListener('keydown', function(e) {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            });
                        }

                        code_number.innerHTML = `<p>${code_line_number + 1}</p>`
                        code_number.style.justifyContent = 'flex-end'
                    } else {
                        code_line.innerHTML = `<p>${line.replace(/ /g, '&nbsp;')}</p>`;
                        code_line.readOnly = true;
                        code_line.spellcheck = false;
                        
                        code_number.innerHTML = `<i id="lock-icon" class="fa-solid fa-lock"></i> ${code_line_number + 1}`
                    }

                    single_line.append(code_number)
                    single_line.appendChild(code_line);

                    code_editor.appendChild(single_line);

                } else if (code_language === 'Python') {

                    if (line.includes("#E8")) {
                        line = line.replace("#E8", "#E8 # Add your code here")
                        line_parts = line.replace(/ /g, '&nbsp;').split('#E8')
                        code_line.innerHTML = `<p>${line_parts[0]}<span class="comment">${line_parts[1]}</span></p>`;
                        code_line.contentEditable = true
                        code_line.spellcheck = false;

                        if (code_type === 'Fill in the blank') {
                            code_line.addEventListener('keydown', function(e) {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            });
                        }

                        code_number.innerHTML = `<p>${code_line_number + 1}</p>`
                        code_number.style.justifyContent = 'flex-end'
                    } else {
                        code_line.innerHTML = `<p>${line.replace(/ /g, '&nbsp;')}</p>`;
                        code_line.readOnly = true;
                        code_line.spellcheck = false;
                        
                        code_number.innerHTML = `<i id="lock-icon" class="fa-solid fa-lock"></i> ${code_line_number + 1}`
                    }

                    single_line.appendChild(code_number)
                    single_line.appendChild(code_line);

                    code_editor.appendChild(single_line);
                }
            }

            code_container.appendChild(code_editor)
            code_buttons = document.createElement('div')
            code_buttons.innerHTML = `
            <div id="code-button-row">
                <button onclick="runCode(this)">Run Code</button>
                <button>Reset Code</button>
            </div>`
            code_container.appendChild(code_buttons)

        })
    }

    questions.forEach(question => {
        if (question.question_type === 'Single correct' || question.question_type === 'Multi correct'){
            addMCQQuestion(question);
        } else if (question.question_type === 'Fill in the blank' || question.question_type === 'Full function'){
            addCodingQuestion(question)
        }
        
    });

    let question_buttons = document.getElementById("qn-buttons")

    for (let i = 1; i <= (questions.length) ; i++) {
        let button = document.createElement('button');
        button.innerText = i;
        button.addEventListener('click', () => showQuestion(i))
        question_buttons.appendChild(button);
    }
});

function runCode(button) {

    const editor = button.closest('.e8-code-container').querySelector('.evalu8-code-editor');
    const question_number = Number(editor.id.split('-').at(-1)) - 1;
    const codeRows = editor.querySelectorAll('.code-row-text');
    let codeText = '';
    codeRows.forEach(row => {
        codeText += row.innerText + '\n';
    });

    document.getElementById('code-under-execution').style.display = 'flex';

    let question_div = document.getElementById(`Q-${question_number + 1}`)
    let logs = question_div.querySelector('.replace-options').querySelector('.logs-and-desc').querySelector('.logs')
        
    logs.innerHTML = ''

    const student_info = JSON.parse(sessionStorage.getItem('student_info'))
    const student_id = student_info['Roll Number']
    let test_cases = '[' 
    let no_of_test_cases = 0

    if (questions[question_number]['test_case_1'].length > 0) {
        test_cases += '[' + questions[question_number]['test_case_1'].trim() + '],';
        no_of_test_cases += 1
    }

    if (questions[question_number]['test_case_2'].length > 0) {
        test_cases += '[' + questions[question_number]['test_case_2'].trim() + '],';
        no_of_test_cases += 1
    }

    if (questions[question_number]['test_case_3'].length > 0) {
        test_cases += '[' + questions[question_number]['test_case_3'].trim() + '],';
        no_of_test_cases += 1
    }

    if (questions[question_number]['test_case_4'].length > 0) {
        test_cases += '[' + questions[question_number]['test_case_4'].trim() + ']';
        no_of_test_cases += 1
    }

    test_cases += ']'

    const solution = questions[question_number]['reference_solution']

    fetch('/run-matlab-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({student_code : codeText, student_id: student_id, test_cases: test_cases, teacher_template_link: solution})
    })
    .then(response => {
        return response.json();
    }).then( response => {
        let question_div = document.getElementById(`Q-${question_number + 1}`)
        let logs = question_div.querySelector('.replace-options').querySelector('.logs-and-desc').querySelector('.logs')
        
        if (response['passed_count'] == no_of_test_cases){
            logs.innerHTML = `
            <h2 class="matlab-status-all-pass">${response['passed_count']} out of ${no_of_test_cases} test cases passed !</h2><br>
            <p class="matlab-result">${response['results'].join(', ')}</p>`
        } else {
            logs.innerHTML = `
            <h2 class="matlab-status-not-all-pass">${response['passed_count']} out of ${no_of_test_cases} test cases passed !</h2><br>
            <p class="matlab-result">${response['results'].join(', ')}</p>`
        }
    }).finally(() => {
        document.getElementById('code-under-execution').style.display = 'none';
    });

}

function activateButton(n) {
    const buttons = document.getElementById('qn-buttons').getElementsByTagName('button');
    if (n < buttons.length) {
        buttons[n].classList.add('active');
    }
}

function deactivateButton(n) {
    const buttons = document.getElementById('qn-buttons').getElementsByTagName('button');
    if (n < buttons.length) {
        buttons[n].classList.remove('active');
    }
}

function nextQuestion(qno){
    if (qno + 1 <= questions.length) {
        let new_question = document.getElementById(`Q-${qno + 1}`)
        new_question.style.display = "flex"
        deactivateButton(qno - 1)

        let curr_question = document.getElementById(`Q-${qno}`)
        curr_question.style.display = "none"
        activateButton(qno)
    }
}

function previousQuestion(qno){
    if (qno - 1 > 0) {
        let new_question = document.getElementById(`Q-${qno - 1}`)
        new_question.style.display = "flex"
        deactivateButton(qno-1)

        let curr_question = document.getElementById(`Q-${qno}`)
        curr_question.style.display = "none"
        document.getElementById('qn-buttons')
        activateButton(qno-2)
    }
}

function showQuestion(qno){
    const all_questions = document.querySelectorAll('.question-data');
    all_questions.forEach(each_question => {
        each_question.style.display = 'none';
    });

    let new_question = document.getElementById(`Q-${qno}`)
    new_question.style.display = "flex"

    const buttons = document.getElementById('qn-buttons').getElementsByTagName('button');

    for (let button of buttons) {
        button.classList.remove('active');
    }
}

// EVENT LISTENER TO CHANGE THE TEXT INSIDE THE SAVE BUTTON OF THE LAST QUESTION TO 'SUBMIT'

document.addEventListener('DOMContentLoaded', function() {
    const total_questions = document.querySelectorAll('.question-data');

    const lastQuestionDiv = total_questions[total_questions.length - 1];
    const saveButton = lastQuestionDiv.querySelector('.test-buttons #save');
    if (saveButton) {
        saveButton.innerText = 'Submit';
        saveButton.addEventListener('click', submitTest)
    }
});

// EVENT LISTENER TO RENDER THE LATEX

document.addEventListener("DOMContentLoaded", function (){
    renderMathInElement(document.body, {
        delimiters: [
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
        ]
    });
});

// COLLECT THE ANSWERS FOR THE QUESTIONS

function saveAnswers(){
    let submission = []
    for (let index = 0; index < questions.length; index++) {
        if (questions[index].question_type === 'Single correct' || questions[index].question_type === 'Multi correct'){
            let answer = saveMCQAnswer(index)
            answers[index]['submitted_answers'] = answer
            submission.push(answer)
        } else if (questions[index].question_type === 'Fill in the blank' || questions[index].question_type === 'Full function') {
            let answer = saveCodeAnswer(index)
            answers[index]['submitted_answers'] = answer
            submission.push(answer)
        }
    }
    return answers
}

function saveMCQAnswer(index_of_question) {

    let question_number = index_of_question + 1;
    const quest = document.getElementById(`Q-${question_number}`);

    if (!quest) {
        console.error(`Question with ID Q-${question_number} not found.`);
        return null; // or handle the error as per your application logic
    }

    const optionsDiv = quest.querySelector('.options');

    if (optionsDiv) {
        const checkedOptions = optionsDiv.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
        if (checkedOptions.length > 0) {
            const selectedIds = Array.from(checkedOptions).map(option => option.id.split('option-')[1]).join(',');
            submitted_answer = selectedIds;
        } else {
            submitted_answer = 'None'; // No option selected
        }
    } else {
        submitted_answer = 'Options not found';
    }

    return submitted_answer;
}



function saveCodeAnswer(index_of_question){

    let question_number = index_of_question + 1;

    const quest = document.getElementById(`Q-${question_number}`); // Select all question-data divs

    let submitted_answer = {};

    // Get the code from the editor
    const codeDiv = quest.querySelector('.evalu8-code-editor');
        
    if (codeDiv) {
        const codelines = codeDiv.querySelectorAll('.code-row-text');
        let submitted_code = ""
        codelines.forEach(codeline => {
            submitted_code += codeline.innerText
        })
        submitted_answer['submitted_code'] = submitted_code;
    } else {
        submitted_answer['submitted_code'] = 'Options not found';
    }

    // Get the description/logic of the code
    const descDiv = quest.querySelector('.desc')
    let submitted_desc = descDiv.innerText
    submitted_answer['submitted_desc'] = submitted_desc

    // Get the description/logic of the code
    const logsDiv = quest.querySelector('.logs')
    let submitted_logs = logsDiv.innerText
    submitted_answer['submitted_logs'] = submitted_logs

    // console.log(submittedCodes);
    return submitted_answer
    }
    

function submitTest() {
    // Start loading animation
    document.getElementById('loading').style.display = 'flex';

    // Wait for at least 1 second before executing the function calls
    const delayPromise = new Promise(resolve => {
        setTimeout(resolve, 1000);
    });

    const student_info = JSON.parse(sessionStorage.getItem('student_info'))

    const student_id = student_info['Roll Number']

    let all_answers = saveAnswers() 
    let student_answers = {
        test_id: test_id,
        student_id: student_id,
        answers: all_answers
    }

    // Wait for both saveMCQAnswers and saveCodeAnswers to complete, along with the delayPromise
    Promise.all([delayPromise])
        .then(results => {

            fetch('/submit-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ student_answers: student_answers })
            })
            .then(response => {
                return response.json(); // Parse JSON response
            })
            .then(data => {
            // Update UI after successful completion
            document.getElementById('loading').style.display = 'none';
            let container = document.getElementById("container");
            container.innerHTML = `<h1 id="completed-note">You have successfully submitted the test.</h1><p id="auto-submit">All the best for the next one.</p><button onclick="redirect('showStudentDashboard')" id="open-dashboard">Go back to Home</button>`;
            container.style.justifyContent = "center";
            container.style.alignItems = "center";
            container.style.flexDirection = "column";

            })

            console.log(submission);
            return submission;
        })
        .catch(error => {
            console.error('Error submitting test:', error);
        });
}


document.addEventListener('DOMContentLoaded', function(){
    activateButton(0)
})

function logout(){
    sessionStorage.removeItem('student_id')
    sessionStorage.removeItem('student_info')
    redirect('login')
}