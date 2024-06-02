import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Marketplace from '../abis/Marketplace.json';
import AddStudent from './AddStudent';
import StudentList from './StudentList';
import AddCourse from './AddCourse';
import CourseList from './CourseList';
import AddEnrollment from './AddEnrollment';
import EnrollmentList from './EnrollmentList';
import AddInstructor from './AddInstructor';
import InstructorList from './InstructorList';
import Header from './Header';
import { Routes, Route, useLocation } from "react-router-dom";
import StudentDetail from './StudentDetail';
import InstructorDetail from './InstructorDetail';
import AddGrade from './AddGrade';
import UpdateGrade from './UpdateGrade';
import LogList from './LogList';
import Header2 from './Header2';
import Login from './Login';
import StudentUserDetail from './User/StudentUserDetail'
import InstructorUserDetail from './User/InstructorUserDetail'
import Certificate from './User/Certificate'



const App = () => {
  const location = useLocation();

  // Kiểm tra nếu đường dẫn là '/login' thì không hiển thị header
  const hideHeader = location.pathname === "/" || location.pathname === "/signup";
  const showHeader2 = location.pathname === "/add-enrollment" || location.pathname.includes("/student-user-detail")
  || location.pathname.includes("/instructor-user-detail") || location.pathname.includes("/certificate")
  ;

  return (
    <div>
      {/* <AddStudent/> */}
      {/* <StudentList/> */}
      {/* <AddCourse/> */}
      {/* <CourseList/> */}
      {/* <AddEnrollment/> */}
      {/* <EnrollmentList/> */}
      {/* <AddInstructor/> */}
      {/* <InstructorList/> */}

      <div className="App">
       
      {!hideHeader && !showHeader2 && <Header  />}
      {showHeader2 && <Header2 />} 
      <main>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/student-list" element={<StudentList />} />
          <Route path="/add-course" element={<AddCourse />} />
          <Route path="/course-list" element={<CourseList />} />
          <Route path="/add-enrollment" element={<AddEnrollment />} />
          <Route path="/enrollment-list" element={<EnrollmentList />} />
          <Route path="/add-instructor" element={<AddInstructor />} />
          <Route path="/instructor-list" element={<InstructorList />} />
          <Route path="/log-list" element={<LogList />} />
        
          {/* admin */}
          {/* <Route path="/work-list-admin" element={<Worklist/>} />
          <Route path="/create-list-admin" element={<CreateListAdmin/>} />
          <Route path="/hidden-work-admin" element={<HiddenWorkAdmin/>} /> */}

           {/* Thêm định tuyến cho trang chi tiết trang */}
           <Route path="/students/:studentId" element={<StudentDetail />} />
      
           <Route path="/student-user-detail/:studentId" element={<StudentUserDetail />} />

           <Route path="/certificate/:studentId" element={<Certificate />} />

           <Route path="/instructor/:instructorId" element={<InstructorDetail />} />
           <Route path="/instructor-user-detail/:instructorId" element={<InstructorUserDetail />} />
           <Route path="/add-grade/:studentId_0/:courseId_0/:id" element={<AddGrade />} />
           <Route path="/update-grade/:studentId_0/:courseId_0/:id/:grade_mid/:grade_fi" element={<UpdateGrade />} />
           {/* <Route path="/userdetail/:userId" element={<UserDetail />} /> */}


           <Route path="/" element={<Login />} />

        </Routes>
      </main>
      
    </div>
    </div>



  );
};

export default App;
