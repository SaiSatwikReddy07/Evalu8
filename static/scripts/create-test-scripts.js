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

let faculty_info = JSON.parse(sessionStorage.getItem('faculty_info'))

const faculty_id = faculty_info['faculty_id']
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

// --------------- TOPICS AND SUBTOPICS ----------------

let topics = []

document.addEventListener('DOMContentLoaded', function() {

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

    fetch('/get-topics')
    .then(response => response.json())
    .then(data => {
        const topics = Object.keys(data);
        const allTopicsSelects = document.getElementsByClassName('topics');
        if (allTopicsSelects.length > 0) {
            for (let topics_selection of allTopicsSelects) {
                topics.forEach(topic => {
                    let option = document.createElement('option');
                    option.value = topic;
                    option.textContent = topic.replaceAll('_', ' ');
                    topics_selection.appendChild(option);
                });
            }

            const defaultTopic = topics[0];
            updateAllSubtopics(defaultTopic, data);

            document.querySelectorAll('.topics').forEach(select => {
                select.addEventListener('change', function() {
                    const selectedTopic = this.value;
                    const subtopicsSelect = this.closest('.question-requirement').querySelector('.subtopics');
                    updateSubtopics(selectedTopic, subtopicsSelect, data);
                });
            });
        } else {
            console.error('No topics select elements found');
        }

        function updateAllSubtopics(topic, data) {
            document.querySelectorAll('.subtopics').forEach(select => {
                updateSubtopics(topic, select, data);
            });
        }

        function updateSubtopics(topic, subtopics_selection, data) {
            const subtopics = data[topic] || [];
            subtopics_selection.innerHTML = '';

            subtopics.forEach(subtopic => {
                let option = document.createElement('option');
                option.value = subtopic;
                option.textContent = subtopic;
                subtopics_selection.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

});

function addQuestionRequirement() {
    let container = document.getElementById('question-requirements');

    let new_requirement = document.createElement('div');
    new_requirement.className = 'question-requirement';

    new_requirement.innerHTML = `
        <label for="topics">Topic :
            <select name="topics" class="topics custom-select"></select>
        </label>

        <label for="subtopics">Sub-topic :
            <select name="subtopics" class="subtopics custom-select"></select>
        </label>

        <label for="difficulty">Difficulty :
            <select name="difficulty" class="difficulty custom-select">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>
        </label>

        <label for="number-of-questions">Questions :
            <input type="number" placeholder="No. of questions" class="number-of-questions">
        </label>

        <button class="delete-questions" onclick="deleteQuestionRequirement(event)">Delete</button>
    `;

    container.appendChild(new_requirement);
    populateSelectElements(new_requirement);
}

function deleteQuestionRequirement(event) {
    const deleteButtons = document.querySelectorAll('.delete-questions');

    if (deleteButtons.length > 1) {
        event.target.closest('.question-requirement').remove();
    } else {
        document.getElementById('warning').style.display = 'flex';
    }
}

function closeWarning(){
    document.getElementById('warning').style.display = 'none';
}

function closeLog(){
    document.getElementById('test-creation-log').style.display = 'none';
}

function populateSelectElements(requirement) {
    fetch('/get-topics')
    .then(response => response.json())
    .then(data => {
        const topics = Object.keys(data);
        const topics_selection = requirement.querySelector('.topics');
        const subtopics_selection = requirement.querySelector('.subtopics');

        if (topics_selection && subtopics_selection) {
            topics.forEach(topic => {
                let option = document.createElement('option');
                option.value = topic;
                option.textContent = topic.replaceAll('_', ' ');
                topics_selection.appendChild(option);
            });

            const defaultTopic = topics[0];
            updateSubtopics(defaultTopic, subtopics_selection, data);

            topics_selection.addEventListener('change', function() {
                const selectedTopic = topics_selection.value;
                updateSubtopics(selectedTopic, subtopics_selection, data);
            });
        } else {
            console.error('Topics or Subtopics select elements not found in the new requirement');
        }

        function updateSubtopics(topic, subtopics_selection, data) {
            const subtopics = data[topic] || [];
            subtopics_selection.innerHTML = '';

            subtopics.forEach(subtopic => {
                let option = document.createElement('option');
                option.value = subtopic;
                option.textContent = subtopic;
                subtopics_selection.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function retrieveTestData() {
    document.getElementById('loading').style.display = 'flex';

    const courseId = document.getElementById('course-id').value;
    const batch = document.getElementById('batches').value;
    const testName = document.getElementById('test-name').value;
    const testDate = document.getElementById('test-date').value;
    const testStartTime = document.getElementById('test-start-time').value;
    const testEndTime = document.getElementById('test-end-time').value;

    const testData = {
        faculty_id: faculty_id, 
        course_id: courseId,
        batch: batch,
        test_date: testDate,
        test_name: testName,
        test_start_time: testStartTime,
        test_end_time: testEndTime,
    };

    const questionRequirements = document.querySelectorAll('.question-requirement');

    questionRequirements.forEach(requirement => {
        const topicSelect = requirement.querySelector('.topics');
        const subTopicSelect = requirement.querySelector('.subtopics');
        const difficultySelect = requirement.querySelector('.difficulty');
        const numberOfQuestionsInput = requirement.querySelector('.number-of-questions');

        if (topicSelect && subTopicSelect && difficultySelect && numberOfQuestionsInput) {
            const topic = topicSelect.value;
            const subTopic = subTopicSelect.value;
            const difficulty = difficultySelect.value;
            const numberOfQuestions = numberOfQuestionsInput.value;

            if (!testData[topic]) {
                testData[topic] = [];
            }

            testData[topic].push({
                sub_topic: subTopic,
                difficulty_tag: difficulty,
                no_of_questions: Number(numberOfQuestions)
            });
        } else {
            console.error('One or more elements missing in a question requirement');
        }
    });

    fetch('/upload-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('test-creation-log').style.display = 'flex';
        document.getElementById('log-text').innerText = data;
    })
    .catch(error => {
        console.error('Error sending data to Flask:', error);
    });
}

function logout(){
    sessionStorage.removeItem('faculty_info')
    sessionStorage.removeItem('faculty_id')
    redirect('login')
}
