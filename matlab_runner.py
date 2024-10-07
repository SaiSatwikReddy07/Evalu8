import matlab.engine
import os
import re
import time
import ast

alp = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

def path_creation(roll_number, matlab_code):

    matlab_code = re.sub(r'[^\S\r\n]+', ' ', matlab_code)

    branch = roll_number[8:11]
    batch = "20" + roll_number[11:13]
    section = chr(ord('A') + int(roll_number[13]))
    match = re.search(r'function\s+\[?(.*?)\]?\s*=\s*(\w+)', matlab_code)
    if not match:
        raise ValueError("Invalid MATLAB code format")
    f_n = match.group(2)
    
    directory_path = os.path.join(f"{batch}_{branch}_{section}", str(roll_number))
    os.makedirs(directory_path, exist_ok=True)
  
    file_path = os.path.join(directory_path, f'{f_n}.m')
    with open(file_path, 'w', newline='', encoding='utf-8') as file:
        file.write(matlab_code)
    
    o = match.group(1).strip()
    no_o = [i.strip() for i in o.split(',')]
    return file_path, f_n, no_o


def run_matlab_function(roll_number, student_code, test_cases, teacher_template):

    try :
        test_cases = re.sub(r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)', r'\1, \2', test_cases)
        test_cases = re.sub(r'(\d)\s+(\d)', r'\1, \2', test_cases)
        s = re.sub(r'\[([^\[\]]+)\]', lambda x: '[[' + x.group(1).replace(';', '],[') + ']]', test_cases)
        test_cases = ast.literal_eval(s)

        file_path, f_n, no_o = path_creation(roll_number, student_code)
        eng = matlab.engine.start_matlab()
        matlab_dir = os.path.dirname(file_path)
        eng.addpath(matlab_dir, nargout=0)
        
        results_student = []
        results_teacher = []
        passed_count = 0
        print(test_cases)
        for i, test_case in enumerate(test_cases):
            args = []
            for arg in test_case:
                if isinstance(arg, (int, float)):
                    args.append(matlab.double([arg]))
                elif isinstance(arg, str):
                    args.append(arg)
                else:
                    args.append(matlab.double(arg))
            
            matlab_outputs = eng.feval(f_n, *args, nargout=len(no_o))
            results_student.append(matlab_outputs)
        
        file_path, f_n, no_o = path_creation(roll_number, teacher_template)
        for i, test_case in enumerate(test_cases):
            args = []
            for arg in test_case:
                if isinstance(arg, (int, float)):
                    args.append(matlab.double([arg]))
                elif isinstance(arg, str):
                    args.append(arg)
                else:
                    args.append(matlab.double(arg))
            if i == 0:
                matlab_outputs = eng.feval(f_n, *args, nargout=len(no_o))
            matlab_outputs = eng.feval(f_n, *args, nargout=len(no_o))
            results_teacher.append(matlab_outputs)

            if matlab_outputs == results_student[i]:
                passed_count += 1

        return results_student, passed_count
    except Exception as e :
        return [str(e)], 0