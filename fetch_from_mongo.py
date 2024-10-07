from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

uri = 'mongodb://127.0.0.1:27017'
alp = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

# GET FACULTY DETAILS FROM THE DATABASE

def faculty_details(faculty_id):
    client = MongoClient(uri)
    db = client['FACULTY']
    collection = db['FACULTY INFORMATION']
    details = list(collection.find({'faculty_id':faculty_id}))
    details[0]['_id'] = str(details[0]['_id'])
    return details[0]

# GET THE LIST OF ALL STUDENT COLLECTIONS (BATCHES ex: 2021_AIE_A)

def get_batches():
    client = MongoClient(uri)
    list_db = client['STUDENTS']
    lis = {}
    lis['STUDENTS'] = list(list_db.list_collection_names())
    return lis

# GET BATCH COURSES

def get_batch_courses(student_id):
    client = MongoClient(uri)
    year = '20' + student_id[11:13]
    department = student_id[8:11]
    section = alp[int(student_id[13])]
    batch = year + '_' + department + '_' + section
    batch_database = client['COURSES']
    courses = list(batch_database[batch].find({}))
    for course in courses:
        fid = course['faculty_id']
        fdetails = faculty_details(fid)
        course['faculty_email'] = fdetails['college_email']
        course['faculty_name'] = fdetails['faculty_name']
        course['_id'] = str(course['_id'])
    return courses

# GET THE LIST OF ALL DATABASES AND COLLECTIONS (TOPICS AND SUBTOPICS)

def get_topics_and_subtopics():
    client = MongoClient(uri)
    list_db = client.list_database_names()
    lis = {}
    s_k = ['FACULTY','STUDENTS','COURSES','PRE-TEST','POST-TEST','TEST-HISTORY','EVALUATION-HISTORY','POST-EVALUATION','admin','config','local']
    for i in list_db:
        if i in s_k:
            continue
        lis[i] = client[i].list_collection_names()
    return lis

# CREATE TEST AND UPLOAD RANDOMLY PICKED QUESTIONS FOR EACH STUDENT

def upload_test(que): 
    all_questions = []
    client = MongoClient(uri)
    try:
        skip_keys = {'faculty_id', 'course_id', 'batch', 'test_name', 'test_start_time', 'test_end_time', 'test_date'}
        for database_name, questions in que.items():
            if database_name in skip_keys:  
                continue
            db = client[database_name]
            for question in questions:
                collection_name = question['sub_topic']
                difficulty_tag = question['difficulty_tag']
                num_questions = int(question['no_of_questions'])
                collection = db[collection_name]
                random_questions = list(collection.aggregate([
                    { '$match': { 'difficulty_tag': difficulty_tag } },
                    { '$sample': { 'size': num_questions } }
                ]))
                
                for q in random_questions:
                    q['_id'] = str(q['_id']) 
                    all_questions.append(q)

        st_db = client['STUDENTS']
        student_data = st_db[que['batch']]
        existing_db = client['PRE-TEST'] 
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')  
        student_questions_collection = existing_db[f"{que['faculty_id']}_{timestamp}"]
        
        details = list(student_data.find({}))
        
        for student_id in details:  
            student_questions = all_questions
            student_record = {
                'student_id': student_id['Roll Number'],
                'questions': student_questions
            }
            student_questions_collection.insert_one(student_record)
        
        test_record = {
            'faculty_id':que['faculty_id'],
            'test_id':f"{que['faculty_id']}_{timestamp}",
            'course_id':que['course_id'],
            'batch':que['batch'],
            'test_date':que['test_date'],
            'test_start_time':que['test_start_time'],
            'test_end_time':que['test_end_time'],
            'test_name':que['test_name']
        }
        test_history = client['TEST-HISTORY']
        test_history_collection = test_history['ALL TESTS']
        test_history_collection.insert_one(test_record)
        return f"Test {que['test_name']} (ID : {que['faculty_id']}_{timestamp}) has been created succesfully."
    finally:
        client.close()

# GET STUDENT NAME

def fetch_student_details(student_id):
    client = MongoClient(uri)
    year = '20' + student_id[11:13]
    department = student_id[8:11]
    section = alp[int(student_id[13])]
    batch = year + '_' + department + '_' + section
    batch_database = client['STUDENTS']
    student_list = batch_database[batch]
    student_info = list(student_list.find({'Roll Number': student_id}))
    student_info[0]['_id'] = str(student_info[0]['_id'])
    return student_info[0]

# GET STUDENT TESTS

def fetch_tests(inp):
    client = MongoClient(uri)
    pre_data_base = client['TEST-HISTORY']
    test_id = pre_data_base['ALL TESTS']
    branch = inp[8:11]
    batch = "20"+inp[11:13]
    section = alp[int(inp[13])]
    tests = list(test_id.find({'batch':f"{batch}_{branch}_{section}"}))

    for test in tests:
        test['_id'] = str(test['_id'])

    return tests

# GET TEST INFO BY TEST ID

def get_times(test_id):
    client = MongoClient(uri)
    pre_data_base = client['TEST-HISTORY']
    collection = pre_data_base['ALL TESTS']
    info = list(collection.find({'test_id':test_id}))
    info[0]['_id'] = str(info[0]['_id'])
    return info

# GET QUESTIONS FOR THE STUDENT TO TAKE THE TEST

def get_test(inp):
    client = MongoClient(uri)
    pre_data_base = client['PRE-TEST']
    test_id = pre_data_base[inp['test_id']]
    questions = list(test_id.find({'student_id':inp['student_id']}))
    questions[0]['_id'] = str(questions[0]['_id'])
    return questions

# SUBMIT STUDENT'S TEST AND UPLOAD IT TO DATABASE

def submit_test(inp):
    client = MongoClient(uri)
    post_data_base = client['POST-TEST']
    test_collection = post_data_base[inp['test_id']]
    
    query = {'student_id': inp['student_id']}
    update = {'$set': {'exam_data': inp['answers']}}
    
    test_collection.update_one(query, update, upsert=True)

# FUNCTION TO ADD COURSE (ADDS COURSE IN BOTH COURSES DB AND FACULTY[faculty_id][courses] attribute.)

def add_courses(inp):
    client = MongoClient(uri)
    db = client['COURSES']
    co = db[inp['batch']]
    st_db = client['STUDENTS']
    no_of_students = st_db[inp['batch']].count_documents({})
    record = {
        'faculty_id':inp['faculty_id'],
        'course_id':inp['course_id'],
        'course_name':inp['course_name'],
        'batch':inp['batch'],
        "active_status":"Active",
        "no_of_students": no_of_students
    }
    co.insert_one(record)
    tup = f"({inp['course_id']}, {inp['course_name']}, {no_of_students}, {inp['batch']}, 'Active')"
    fac_db = client['FACULTY']
    fac_col = fac_db['FACULTY INFORMATION']
    rec = list(fac_col.find({
        'faculty_id':inp['faculty_id']
    }))
    if 'courses' in rec[0] :
        if rec[0]['courses'] == "" :
            updated_courses = rec[0]['courses'] + f"{tup}"
        else :
            updated_courses = rec[0]['courses'] + f"; {tup}"
        fac_col.update_one({'_id': rec[0]['_id']}, {'$set': {'courses': updated_courses}})

# ADD A PINNED COURSE FOR A FACULTY

def add_pinned_courses(inp):
    client = MongoClient(uri)
    
    tup = f"({inp['course_id']}, {inp['course_name']}, {inp['students']}, {inp['batch']})"
    fac_db = client['FACULTY']
    fac_col = fac_db['FACULTY INFORMATION']

    rec = list(fac_col.find({
        'faculty_id':inp['faculty_id']
    }))

    if 'pinned_courses' in rec[0] :
        if rec[0]['pinned_courses'] == "" :
            updated_pinned_courses = rec[0]['pinned_courses'] + f"{tup}"
        else :
            updated_pinned_courses = rec[0]['pinned_courses'] + f"; {tup}"
        fac_col.update_one({'_id': rec[0]['_id']}, {'$set': {'pinned_courses': updated_pinned_courses}})

# HELPER FUNCTION TO CHECK THE STATUS OF A TEST

def check_time_period(start_time_str, end_time_str, time_format='%Y-%m-%d %H:%M'):
    start_time = datetime.strptime(start_time_str, time_format)
    end_time = datetime.strptime(end_time_str, time_format)
    current_time = datetime.now()
    if current_time < start_time:
        return "upcoming"
    elif current_time > end_time:
        return "expired"
    else:
        return "active"
    
# GET ALL THE TESTS ADDED BY A FACULTY WITH ADDED STATUS ATTRIBUTE

def faculty_test_history(faculty_id):
    statuses = {
        'expired':[],
        'upcoming':[],
        'active':[]
    }

    client = MongoClient(uri)
    db = client['TEST-HISTORY']
    collection = db['ALL TESTS']
    tests = list(collection.find({'faculty_id': faculty_id}))
    for test in tests:
        start_time = test['test_date']+" "+test['test_start_time']
        end_time = test['test_date']+" "+test['test_end_time']
        status = check_time_period(start_time,end_time)
        statuses[status].append(test['test_id'])
    return statuses
    
# GET ALL THE TESTS SUBMITTED BY A STUDENT
    
def student_test_history(student_id):
    statuses = {
        'expired':[],
        'upcoming':[],
        'active':[]
    }
    client = MongoClient(uri)
    db = client['TEST-HISTORY']
    col = db['ALL TESTS']
    branch = student_id[8:11]
    batch = "20" + student_id[11:13]
    section = alp[int(student_id[13])]
    tests = list(col.find({'batch':f"{batch}_{branch}_{section}"}))
    for test in tests:
        s_t = test['test_date'] + " " + test['test_start_time']
        e_t = test['test_date'] + " " + test['test_end_time']
        status = check_time_period(s_t,e_t)

        if status == "expired":
            statuses['expired'].append(test['test_id'])

        if status == 'active' or status=='upcoming':
            statuses[status].append(test['test_id'])
    return statuses

# GET A STUDENT'S TEST PAPER AND ALL THE EVALUATION INFO ABOUT THE TEST

def get_student_submission(test_id, student_id):
    client = MongoClient(uri)
    tests_db = client['POST-EVALUATION']
    collection = tests_db[test_id]
    student_paper = list(collection.find({'student_id': student_id}))
    if len(student_paper) == 0:
        student_paper = [None]
    else:
        student_paper[0]['_id'] = str(student_paper[0]['_id'])

    eval_db = client['EVALUATION-HISTORY']
    collection = eval_db[test_id]
    test_info = list(collection.find({'test_id': test_id}))
    test_info[0]['_id'] = str(test_info[0]['_id'])

    return student_paper[0], test_info[0]

# GET THE POSITION OF A STUDENT IN A TEST 

def get_student_position(student_id, test_id):
    client = MongoClient(uri)
    tests_db = client['POST-EVALUATION']
    collection = tests_db[test_id]
    test_data = list(collection.find({}))

    try :
        index = next((i for i, submission in enumerate(test_data) if submission['student_id'] == student_id), None)
        sorted_test_data = sorted(test_data, key=lambda x: x['total_marks'], reverse=True)
        position = next((i for i, submission in enumerate(sorted_test_data) if submission['student_id'] == student_id), None)
        return position+1
    except Exception as e:
        return 'Absent'


# GET BASIC INFORMATION ABOUT A TEST

def get_test_details(test_id) :
    client = MongoClient(uri)
    db = client['TEST-HISTORY']
    collection = db['ALL TESTS']
    test = list(collection.find({'test_id': test_id}))
    test[0]['_id'] = str(test[0]['_id'])
    return test[0]

# GET ALL THE SUBMISSIONS RECIEVED FOR A PARTICULAR TEST

def get_test_submissions(test_id) :
    client = MongoClient(uri)
    db = client['POST-TEST']
    collection = db[test_id]
    submissions = list(collection.find({}))
    for submission in submissions :
        submission['_id'] = str(submission['_id'])
    return submissions

# EVALUATE A TEST AND STORE THE INFORMATION IN TWO DIFFERENT DATABASES

def mark_test_evaluated(test_id, evaluation_data, student_test_data):
    client = MongoClient(uri)
    db = client['EVALUATION-HISTORY']
    test_history_collections = client['TEST-HISTORY']['ALL TESTS']
    basic_test_info = test_history_collections.find_one({'test_id': test_id})

    basic_test_info['no_of_attendees'] = evaluation_data['no_of_attendees']
    basic_test_info['highest_mark'] = evaluation_data['highest_mark']
    basic_test_info['average_mark'] = evaluation_data['average_mark']
    basic_test_info['least_mark'] = evaluation_data['least_mark']
    basic_test_info['no_of_easy'] = evaluation_data['no_of_easy']
    basic_test_info['no_of_medium'] = evaluation_data['no_of_medium']
    basic_test_info['no_of_hard'] = evaluation_data['no_of_hard']
    db[test_id].insert_one(basic_test_info)

    post_evaluation_collection = client['POST-EVALUATION'][test_id]

    for student_data in student_test_data:
        post_evaluation_collection.insert_one(student_data)

# GET ALL THE EVALUATED TESTS (THOSE THAT ARE PRESENT IN THE 'EVALUATION-HISTORY' DATABASE)

def get_all_evaluated_tests():
    client = MongoClient(uri)
    db = client['EVALUATION-HISTORY']
    all_evaluated_tests = list(db.list_collection_names())
    if 'DELETE' in all_evaluated_tests:
        all_evaluated_tests.remove('DELETE')
    return all_evaluated_tests

# GET THE INFORMATION ABOUT AN EVALUATED TEST

def get_evaluated_test_info(test_id):
    client = MongoClient(uri)
    db = client['EVALUATION-HISTORY']
    col = db[test_id]
    test_info = list(col.find({'test_id': test_id}))
    test_info[0]['_id'] = str(test_info[0]['_id'])
    return test_info

# GET ALL THE EVALUATED PAPERS OF A TEST

def get_evaluated_test_papers(test_id):
    client = MongoClient(uri)
    db = client['POST-EVALUATION']
    submissions = list(db[test_id].find({}))
    for submission in submissions:
        submission['_id'] = str(submission['_id'])
    return submissions