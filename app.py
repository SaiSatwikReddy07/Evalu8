from flask import Flask, render_template, request
import requests
import re
import flask
from flask import jsonify, Flask, render_template, redirect, url_for, request, session

import fetch_from_mongo as mongo
import matlab_runner as matlab

app = Flask(__name__)

# --------------------------- HELPER FUNCTIONS ---------------------------

def extract_file_id(url):
    # Example Google Drive URL: https://drive.google.com/file/d/1IsB1Fat019aKIcFaPaETwt8rDBD281qb/view?usp=sharing
    match = re.search(r"/d/([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    else:
        return None

def read_google_drive_file(file_id):
    base_url = "https://drive.google.com/uc?export=download&id="
    download_url = f"{base_url}{file_id}"

    response = requests.get(download_url)
    if response.status_code == 200:
        return response.text
    else:
        return f"Error fetching file: {response.status_code} - {response.text}"


# --------------------------- FLASK ROUTES ---------------------------

# ROUTE TO OPEN THE HOME PAGE

@app.route('/')
def index():
    return render_template('home.html')

# ROUTE TO OPEN THE LOGIN PAGE

@app.route('/login')
def login():
    return render_template('login.html')

# ROUTE TO OPEN THE STUDENT DASHBOARD PAGE

@app.route('/student-dashboard')
def showStudentDashboard():
    return render_template('student-dashboard.html')

# ROUTE TO OPEN THE FACULTY DASHBOARD PAGE

@app.route('/faculty-dashboard')
def showFacultyDashboard():
    return render_template('faculty-dashboard.html')

# ROUTE TO OPEN THE TAKE-TEST PAGE

@app.route('/test')
def takeTest():
    return render_template('take-test.html')

# ROUTE TO OPEN THE CREATE-TEST PAGE

@app.route('/create-test')
def createTest():
    return render_template('create-test.html')

# ROUTE TO OPEN THE FACULTY-COURSES-PAGE

@app.route('/faculty-courses')
def facultyCourses():
    return render_template('faculty-courses.html')

# ROUTE TO OPEN THE STUDENT-COURSES-PAGE

@app.route('/student-courses')
def studentCourses():
    return render_template('student-courses.html')

# ROUTE TO OPEN THE FACULTY-PROFILE PAGE

@app.route('/faculty-profile')
def facultyProfile():
    return render_template('faculty-profile.html')

# ROUTE TO OPEN THE STUDENT-PROFILE PAGE

@app.route('/student-profile')
def studentProfile():
    return render_template('student-profile.html')

# ROUTE TO OPEN THE FACULTY-TEST-HISTORY-PAGE

@app.route('/faculty-test-history')
def facultyTestHistory():
    return render_template('faculty-test-history.html')

# ROUTE TO OPEN THE STUDENT-TEST-HISTORY-PAGE

@app.route('/student-test-history')
def studentTestHistory():
    return render_template('student-test-history.html')

# ROUTE TO REDIRECT TO ANY PAGE FROM ANY PAGE

@app.route('/redirect', methods=['POST'])
def openpage():
    data = request.json
    page = data.get('page')

    faculty_id = data.get('faculty_id')
    student_id = data.get('student_id')

    if page == 'showFacultyDashboard' and faculty_id:
        result = mongo.faculty_details(faculty_id)
        return jsonify({'redirect_url': url_for(page), 'faculty_info': result})
    
    elif page == 'showStudentDashboard' and student_id:
        result = mongo.fetch_student_details(student_id)
        return jsonify({'redirect_url': url_for(page), 'student_info': result})
    
    return redirect(url_for(page))

# ROUTE TO UPLOAD A TEST

@app.route('/upload-test', methods=['POST'])
def uploadTest():
    data = request.json
    test_id = mongo.upload_test(data)
    return test_id

# ROUTE TO GET THE TEST QUESTIONS FOR A STUDENT (DISPLAYING THE TEST)

@app.route('/load-test', methods=['POST'])
def loadTest():
    data = request.json
    test_id = data.get('test_id')
    student_id = data.get('student_id')
    input = {'test_id': test_id, 'student_id': student_id}
    questions = mongo.get_test(input)
    return jsonify({'redirect_url': url_for('takeTest'), 'questions': questions})

# ROUTE TO GET THE START-TIME AND END-TIME OF A TEST (HELPER FUNCTION TO UPDATE THE TIMER BAR)

@app.route('/get-times', methods=['POST'])
def getTimes():
    data = request.json
    test_id = data.get('test_id')
    return jsonify(mongo.get_times(test_id))

# ROUTE TO HANDLE THE TEST SUBMISSION

@app.route('/submit-test', methods=['POST'])
def submitTest():
    data = request.json
    student_answers = data.get('student_answers')
    return jsonify(mongo.submit_test(student_answers))

# ROUTE TO GET ALL THE BASIC INFORMATION OF A TEST (FROM TEST-HISTORY COLLECTION)

@app.route('/fetch-test-details', methods=['POST'])
def fetchTestDetails():
    test_id = request.json
    test_id = test_id.get('test_id')
    return jsonify(mongo.get_test_details(test_id))

# ROUTE TO GET ALL THE SUBMISSIONS OF A TEST (FROM POST-TEST COLLECTION)

@app.route('/fetch-test-submissions', methods=['POST'])
def fetchTestSubmissions():
    test_id = request.json
    test_id = test_id.get('test_id')
    return jsonify(mongo.get_test_submissions(test_id))

# ROUTE TO GET THE SUBMITTED PAPER OF A STUDENT AND ALL THE EVALUATION INFO OF A TEST

@app.route('/fetch-student-paper-and-overview', methods=['POST'])
def fetchStudentPaperAndOverview():
    data = request.json
    student_id = data.get('student_id')
    test_id = data.get('test_id')
    student_paper, test_info = mongo.get_student_submission(student_id=student_id, test_id=test_id)
    return jsonify({'student_paper': student_paper, 'test_info':test_info})

# ROUTE TO GET THE POSITION OF THE STUDENT IN THE TEST

@app.route('/fetch-student-position', methods=['POST'])
def fetchStudentPosition():
    data = request.json
    student_id = data.get('student_id')
    test_id = data.get('test_id')
    position = mongo.get_student_position(student_id=student_id, test_id=test_id)
    return jsonify(position)

# ROUTE TO GET ALL THE TESTS SCHEDULED FOR A STUDENT (student-test-history page)

@app.route('/get-student-tests', methods=['POST'])
def getStudentTests():
    student_id = request.json
    student_id = student_id.get('student_id')
    return jsonify(mongo.student_test_history(student_id))

# ROUTE TO EVALUATE A TEST FOR ALL STUDENTS

@app.route('/mark-test-evaluated', methods=['POST'])
def markTestEvaluated():
    inputs = request.json
    test_id = inputs.get('test_id')
    evaluation_data = inputs.get('evaluation_data')
    student_test_data = inputs.get('student_test_data')
    mongo.mark_test_evaluated(test_id=test_id, evaluation_data=evaluation_data, student_test_data=student_test_data)
    return '0'

# ROUTE TO GET THE INFORMATION OF AN EVALUATED TEST

@app.route('/fetch-evaluation-info', methods=['POST'])
def getEvaluationInfo():
    test_id = request.json
    test_id = test_id.get('test_id')
    return jsonify(mongo.get_evaluated_test_info(test_id))

# ROUTE TO GET ALL THE SUBMISSIONS OF AN EVALUATED TEST

@app.route('/fetch-evaluated-test-papers', methods=['POST'])
def getEvaluatedTestPapers():
    test_id = request.json
    test_id = test_id.get('test_id')
    return jsonify(mongo.get_evaluated_test_papers(test_id))

# ROUTE TO GET ALL THE EVALUATED TESTS

@app.route('/fetch-all-evaluated-tests', methods=['POST'])
def getAllEvaluatedTests():
    return jsonify(mongo.get_all_evaluated_tests())

# ROUTE TO GET ALL THE BATCHES

@app.route('/get-batches')
def getBatches():
    return jsonify(mongo.get_batches())

# ROUTE TO GET ALL THE AVAILABLE TOPICS (ex: Linear Algebra, Gate, etc.)

@app.route('/get-topics')
def getTopics():
    return jsonify(mongo.get_topics_and_subtopics())

# ROUTE TO GET ALL THE TESTS FOR A BATCH OF STUDENTS (SAME AS FOR A PARTICULAR STUDENT)

@app.route('/fetch-all-tests', methods=['POST'])
def fetchTests():
    sid = request.json
    sid = sid.get('student_id')
    return jsonify(mongo.fetch_tests(sid))

# ROUTE TO GET THE INFORMATION ABOUT A FACULTY

@app.route('/get-faculty-info', methods=['POST'])
def getFacultyInfo():
    data = request.json
    fid = data.get('faculty_id')
    return jsonify(mongo.faculty_details(fid))

# ROUTE TO GET ALL THE TESTS THAT A FACULTY HAS CREATED

@app.route('/get-faculty-tests', methods = ['POST'])
def getFacultyTests():
    data = request.json
    fid = data.get('faculty_id')
    return jsonify(mongo.faculty_test_history(fid))

# ROUTE TO GET ALL THE COURSES THAT A BATCH OF STUDENTS WERE ADDED TO (SAME AS FOR A PARTICULAR STUDENT)

@app.route('/get-batch-courses', methods=['POST'])
def batchCourseInfo():
    data = request.json
    sid = data.get('student_id')
    courses = mongo.get_batch_courses(sid)
    return jsonify(courses) 

# ROUTE TO HANDLE THE CREATION OF A COURSE

@app.route('/create-course', methods=['POST'])
def createCourse():
    data = request.json
    course_info = data.get('course_info')
    mongo.add_courses(course_info)
    return '0'

# ROUTE TO PIN A COURSE

@app.route('/pin-course', methods=['POST'])
def pinCourse():
    data = request.json
    course_info = data.get('pinned_course_info')
    mongo.add_pinned_courses(course_info)
    return '0'

# ROUTE TO EXECUTE A MATLAB FUNCTION

@app.route('/run-matlab-code', methods=['POST'])
def runMatlab():
    data = request.json
    code = data.get('student_code')
    student_id = data.get('student_id')
    test_cases = data.get('test_cases')
    teacher_template_link = data.get('teacher_template_link')
    teacher_template_code = readFromDriveFunction(teacher_template_link)
    results, passed_count = matlab.run_matlab_function(student_code=code, teacher_template=teacher_template_code, test_cases=test_cases, roll_number=student_id)
    return jsonify({'results': results, 'passed_count': passed_count})

# ROUTE TO READ THE CODE FROM THE GOOGLE DRIVE (HELPER FUNCTION TO DISPLAY THE CODE)

@app.route('/readcode', methods=['POST'])
def readFromDrive():
    try:
        data = request.json
        google_drive_url = data.get('url')

        file_id = extract_file_id(google_drive_url)
        
        if file_id:
            file_content = read_google_drive_file(file_id)
            return file_content
        else:
            error_message = "Invalid Google Drive URL format. Please provide a valid sharing link."
            return error_message
    except Exception as e :
        print(e)

# FUNCTION TO READ THE CODE (FUNCTION VARIANT OF THE ABOVE ROUTE)

def readFromDriveFunction(google_drive_url):
    try:
        file_id = extract_file_id(google_drive_url)
        
        if file_id:
            file_content = read_google_drive_file(file_id)
            return file_content
        else:
            error_message = "Invalid Google Drive URL format. Please provide a valid sharing link."
            return error_message
    except Exception as e :
        print(e)

# START THE SERVER

if __name__ == '__main__':
    app.run(debug=True)
