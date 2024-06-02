pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Marketplace {
    
    struct Student {
        uint id;
        string name;
        string dateOfBirth;
        string gender;
        string residence;
        string phoneNumber;
    }
    
    struct Course {
        uint id;
        string courseName;
        uint credits;
        uint instructor;
        uint option;
    }

    struct Enrollment {
        uint id;
        uint student_id;
        uint course_id;
        string grade_mid;
        string grade_fi;
    }

    struct Instructor {
       uint id;
       string name;
       uint degree;
       string email;
       string phone;
    }

      struct Log {
        uint id;
        uint timestamp;
        string content;
        uint studentId;
        uint courseId;
    }
    mapping(uint => Student) public students;
    mapping(uint => Course) public courses;
    mapping(uint => Enrollment) public enrollments;
     mapping(uint => Instructor) public instructors;
    uint public studentCount;
    uint public courseCount;
    uint public enrollmentCount;
     uint public instructorCount;

    Student[] public allStudents;
     Course[] public allCourses;
     Enrollment[] public allEnrollments;
      Instructor[] public allInstructors;

     uint public nextEnrollmentId = 0;
      uint public nextInstructorId = 0;

       event EnrollmentUpdated(uint indexed enrollmentId, string newGradeMid, string newGradeFinal);
         event LogAdded(uint indexed id, uint indexed timestamp, string content, uint studentId, uint courseId);

      
    mapping(uint => bool) public updatedEnrollments;

      Log[] public logs;
    uint public logCount;
    
    function addStudent(uint _id, string memory _name, string memory _dateOfBirth, string memory _gender, string memory _residence, string memory _phoneNumber) public {
        require(students[_id].id == 0, "Student ID already exists");
        
        students[_id] = Student(_id, _name, _dateOfBirth, _gender, _residence, _phoneNumber);
        studentCount++;
        allStudents.push(students[_id]);
    }

    function addCourse(uint _id, string memory _courseName, uint _credits, uint _instructor, uint _option) public {
        courses[_id] = Course(_id, _courseName, _credits, _instructor, _option);
        courseCount++;

        allCourses.push(courses[_id]);
    }

    function addEnrollment(uint _student_id, uint _course_id, string memory _grade_mid, string memory _grade_final) public {
        uint enrollmentId = nextEnrollmentId++;
        enrollments[enrollmentId] = Enrollment(enrollmentId, _student_id, _course_id, _grade_mid, _grade_final);
        enrollmentCount++;
        allEnrollments.push(enrollments[enrollmentId]);
    }

    function addInstructor(uint _id, string memory _name, uint _degree, string memory _email, string memory _phone) public {
        require(instructors[_id].id == 0, "Instructor ID already exists");
        instructors[_id] = Instructor(_id, _name, _degree, _email, _phone);
        instructorCount++;
        allInstructors.push(instructors[_id]);
    }

    function getallStudents() public view returns(Student[] memory) {
        return allStudents;
    }

    function studentExists(uint _id) public view returns (bool) {
        return students[_id].id != 0;
    }

function instructorExists(uint _id) public view returns (bool) {
    return instructors[_id].id != 0;
}

function courseExists(uint _id) public view returns (bool) {
    return courses[_id].id != 0;
}

function enrollmentExists(uint _studentId, uint _courseId) public view returns (bool) {
    for (uint i = 0; i < allEnrollments.length; i++) {
        if (allEnrollments[i].student_id == _studentId && allEnrollments[i].course_id == _courseId) {
            return true;
        }
    }
    return false;
}
     function getallCourses() public view returns(Course[] memory) {
        return allCourses;
    }

    function getallEnrollments() public view returns(Enrollment[] memory) {
        return allEnrollments;
    }

    function getAllInstructors() public view returns (Instructor[] memory) {
        return allInstructors;
    }

    function getEnrollmentsByStudentId(uint _studentId) public view returns (Enrollment[] memory) {
    Enrollment[] memory studentEnrollments = new Enrollment[](enrollmentCount);
    uint studentEnrollmentCount = 0;
    for (uint i = 0; i < allEnrollments.length; i++) {
       
        if (allEnrollments[i].student_id == _studentId) {
            studentEnrollments[studentEnrollmentCount] = allEnrollments[i];
            studentEnrollmentCount++;
        }
    }
    Enrollment[] memory result = new Enrollment[](studentEnrollmentCount);
    for (uint j = 0; j < studentEnrollmentCount; j++) {
        result[j] = studentEnrollments[j];
    }

    return result;
}

    function getStudentById(uint _studentId) public view returns (uint, string memory, string memory, string memory, string memory, string memory) {
        require(studentExists(_studentId), "Student does not exist");
        Student memory student = students[_studentId];
        return (student.id, student.name, student.dateOfBirth, student.gender, student.residence, student.phoneNumber);
    }

function getCourseById(uint _courseId) public view returns (uint, string memory, uint, uint, uint) {
    require(courses[_courseId].id != 0, "Course does not exist");
    Course memory course = courses[_courseId];
    return (course.id, course.courseName, course.credits, course.instructor, course.option);
}

function getInstructorById(uint _instructorId) public view returns (uint, string memory, uint, string memory, string memory) {
    require(instructors[_instructorId].id != 0, "Instructor does not exist");
    Instructor memory instructor = instructors[_instructorId];
    return (instructor.id, instructor.name, instructor.degree, instructor.email, instructor.phone);
}

function updateEnrollment(uint _enrollmentId, string memory _gradeMid, string memory _gradeFinal, uint _courseId) public {
    
    Enrollment storage enrollmentToUpdate = enrollments[_enrollmentId];

    string memory logContent = "Điểm có những thay đổi: ";

   
    if (keccak256(abi.encodePacked(enrollmentToUpdate.grade_mid)) != keccak256(abi.encodePacked(_gradeMid))) {
        logContent = string(abi.encodePacked(logContent, "điểm GK đổi từ '", enrollmentToUpdate.grade_mid, "' thành '", _gradeMid, "', "));
    }
    if (keccak256(abi.encodePacked(enrollmentToUpdate.grade_fi)) != keccak256(abi.encodePacked(_gradeFinal))) {
        logContent = string(abi.encodePacked(logContent, "điểm TK đổi từ '", enrollmentToUpdate.grade_fi, "' thành '", _gradeFinal, "', "));
    }

    
    if (bytes(logContent).length > 0 && bytes(logContent)[bytes(logContent).length - 1] == ',') {
        bytes memory trimmedBytes = new bytes(bytes(logContent).length - 2);
        for (uint i = 0; i < bytes(logContent).length - 2; i++) {
            trimmedBytes[i] = bytes(logContent)[i];
        }
        logContent = string(trimmedBytes);
    }

    if (bytes(logContent).length > 0) {
        _addLog(logContent, enrollmentToUpdate.student_id, _courseId);

      
        enrollmentToUpdate.grade_mid = _gradeMid;
        enrollmentToUpdate.grade_fi = _gradeFinal;
 
    for (uint i = 0; i < allEnrollments.length; i++) {
        if (allEnrollments[i].id == _enrollmentId) {
         
            allEnrollments[i].grade_mid = _gradeMid;
            allEnrollments[i].grade_fi = _gradeFinal;
            break;
        }
    }

    updatedEnrollments[_enrollmentId] = true;

    emit EnrollmentUpdated(_enrollmentId, _gradeMid, _gradeFinal);
    }


  
}

function addGrade(uint _enrollmentId, string memory _gradeMid, string memory _gradeFinal, uint _courseId) public {
 
    Enrollment storage enrollmentToUpdate = enrollments[_enrollmentId];

    
  
        enrollmentToUpdate.grade_mid = _gradeMid;
        enrollmentToUpdate.grade_fi = _gradeFinal;

    for (uint i = 0; i < allEnrollments.length; i++) {
        if (allEnrollments[i].id == _enrollmentId) {
            allEnrollments[i].grade_mid = _gradeMid;
            allEnrollments[i].grade_fi = _gradeFinal;
            break;
        }
    }
    updatedEnrollments[_enrollmentId] = true;
    emit EnrollmentUpdated(_enrollmentId, _gradeMid, _gradeFinal);
    
}


 function _addLog(string memory _content, uint _studentId, uint _courseId) public {
        uint timestamp = block.timestamp;
        Log memory newLog = Log(logCount + 1, timestamp, _content, _studentId, _courseId);
        logs.push(newLog);
        emit LogAdded(logCount + 1, timestamp, _content, _studentId,_courseId);
        logCount++;
    }

    function getLogsCount() public view returns (uint) {
        return logCount;
    }

    function getLog(uint _index) public view returns (uint id, uint timestamp, string memory content, uint studentId, uint courseId) {
        require(_index < logs.length, "Invalid log index");
        Log memory log = logs[_index];
        return (log.id, log.timestamp, log.content, log.studentId, log.courseId);
    }

 function updateStudent(uint _id, string memory _name, string memory _dateOfBirth, string memory _gender, string memory _residence, string memory _phoneNumber) public {
    students[_id] = Student(_id, _name, _dateOfBirth, _gender, _residence, _phoneNumber);
    for (uint i = 0; i < allStudents.length; i++) {
        if (allStudents[i].id == _id) {
            allStudents[i] = students[_id];
            break;
        }
    }
}

function updateCourse(uint _id, string memory _courseName, uint _credits, uint _instructor, uint _option) public {
    courses[_id] = Course(_id, _courseName, _credits, _instructor, _option);
    for (uint i = 0; i < allCourses.length; i++) {
        if (allCourses[i].id == _id) {
            allCourses[i] = courses[_id];
            break;
        }
    }
}

function updateInstructor(uint _id, string memory _name, uint _degree, string memory _email, string memory _phone) public {
    
    instructors[_id] = Instructor(_id, _name, _degree, _email, _phone);
    
    for (uint i = 0; i < allInstructors.length; i++) {
        if (allInstructors[i].id == _id) {
            allInstructors[i] = instructors[_id];
            break;
        }
    }
}

}