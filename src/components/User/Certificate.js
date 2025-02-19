// StudentDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import MarketplaceContract from '../../abis/Marketplace.json';
import '../Style/studentdetail.css'
import QRCode from "qrcode.react";





const StudentDetail = () => {
  const [enrollments, setEnrollments] = useState([]);
  const { studentId } = useParams();
  const [contract, setContract] = useState(null); // Khai báo contract
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]); 
  const [instructors, setInstructors] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const handleSaveAsPDF = () => {
    // Lấy phần tử HTML muốn chuyển đổi thành PDF
    const element = document.getElementById('student-detail');

    // Kiểm tra xem trình duyệt có hỗ trợ API print không
    if (window && 'print' in window) {
      // Chuyển đổi HTML thành chuỗi và in ra PDF
      window.print();
    } else {
      // Trường hợp trình duyệt không hỗ trợ, thông báo cho người dùng
      alert('Trình duyệt của bạn không hỗ trợ tính năng này.');
    }
  };

  useEffect(() => {
    const initContract = async () => {
      try {
        // Khởi tạo Web3
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        // Lấy id của mạng hiện tại
        const networkId = await web3.eth.net.getId();
        
        // Lấy thông tin hợp đồng từ JSON ABI
        const deployedNetwork = MarketplaceContract.networks[networkId];

        // Tạo một instance của contract
        const instance = new web3.eth.Contract(
          MarketplaceContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        
        // Lưu trữ contract vào state
        setContract(instance);
      } catch (error) {
        console.error('Error initializing contract', error);
      }
    };

    initContract();
  }, []);

 // Hàm fetchEnrollments
 const fetchEnrollments = async () => {
  try {
    if (contract) {
      const studentEnrollments = await contract.methods.getEnrollmentsByStudentId(studentId).call();
      setEnrollments(studentEnrollments);
    }
  } catch (error) {
    console.error('Error fetching enrollments', error);
  }
};

// useEffect(() => {
//   const initContract = async () => {
//     try {
//       const web3 = new Web3(window.ethereum);
//       await window.ethereum.enable();
//       const networkId = await web3.eth.net.getId();
//       const deployedNetwork = MarketplaceContract.networks[networkId];
//       const instance = new web3.eth.Contract(
//         MarketplaceContract.abi,
//         deployedNetwork && deployedNetwork.address,
//       );
//       setContract(instance);
//     } catch (error) {
//       console.error('Error initializing contract', error);
//     }
//   };
//   initContract();
// }, []);

useEffect(() => {
  if (contract) {
    fetchEnrollments();
  }
}, [contract, studentId]);

useEffect(() => {
  const updateEnrollmentListener = async () => {
    try {
      if (contract) {
        contract.events.EnrollmentUpdated({}, (error, event) => {
          if (!error) {
            fetchEnrollments();
          } else {
            console.error('Error listening to EnrollmentUpdated event:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error setting up event listener for EnrollmentUpdated:', error);
    }
  };
  updateEnrollmentListener();
}, [contract]);


  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        // Kiểm tra contract đã được khởi tạo hay chưa
        if (contract) {
          // Call the contract to get student info by ID
          const studentInfo = await contract.methods.getStudentById(studentId).call();
          setStudent(studentInfo);
        }
      } catch (error) {
        console.error('Error fetching student info', error);
      }
    };
    
    // Kiểm tra contract trước khi gọi fetchStudentInfo
    if (contract) {
      fetchStudentInfo();
    }
  }, [contract, studentId]);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        if (contract && enrollments.length > 0) {
          const courseIds = enrollments.map(enrollment => enrollment.course_id);
          const courseInfoPromises = courseIds.map(courseId => contract.methods.getCourseById(courseId).call());
          
        

          const courseInfos = await Promise.all(courseInfoPromises);
          const formattedCourses = courseInfos.map(courseInfo => ({
            id: courseInfo[0],
            courseName: courseInfo[1],
            credits: courseInfo[2],
            instructor: courseInfo[3],
            option: courseInfo[4]
          }));
          setCourses(formattedCourses);
        }
      } catch (error) {
        console.error('Error fetching course info', error);
      }
    };
    
    if (contract && enrollments.length > 0) {
      fetchCourseInfo();
    }
  }, [contract, enrollments]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        if (contract && enrollments.length > 0) {
          const instructorIds = enrollments.map(enrollment => enrollment.instructor);
          const validInstructorIds = instructorIds.filter(id => id !== undefined); // Lọc ra các id hợp lệ
          const instructorInfoPromises = validInstructorIds.map(instructorId => contract.methods.getInstructorById(instructorId).call());
          const instructorInfos = await Promise.all(instructorInfoPromises);
          setInstructors(instructorInfos);
        }
      } catch (error) {
        console.error('Error fetching instructor info', error);
      }
    };
    if (contract && enrollments.length > 0) {
      fetchInstructors();
    }
  }, [contract, enrollments]);
  // Function to format date
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const calculateGPAs = () => {
    let totalCredits = 0;
    let totalGradePoints4 = 0;
    let totalGradePoints10 = 0;
  
    enrollments.forEach((enrollment, index) => {
      // Kiểm tra điểm CK có giá trị là chuỗi trống không
      if (enrollment.grade_fi.trim() !== '') {
        const credits = courses[index] ? parseInt(courses[index].credits) : 0;
        const grade4 = calculateGPA4FromGPA10(parseFloat(enrollment.grade_fi));
        const grade10 = grade4 * 2.5; // Ước lượng, cần kiểm tra với quy định cụ thể của trường
  
        totalCredits += credits;
        totalGradePoints4 += credits * grade4;
        totalGradePoints10 += credits * grade10;
      }
    });
  
    const GPA4 = totalCredits === 0 ? 0 : totalGradePoints4 / totalCredits;
    const GPA10 = totalCredits === 0 ? 0 : totalGradePoints10 / totalCredits;
  
    return { GPA4, GPA10, totalCredits };
  };

  const calculateGPA4FromGPA10 = (GPA10) => {
    if (GPA10 >= 8.5 && GPA10 <= 10) {
      return 4;
    } else if (GPA10 >= 7 && GPA10 < 8.5) {
      return 3;
    } else if (GPA10 >= 5.5 && GPA10 < 7) {
      return 2;
    } else if (GPA10 >= 5 && GPA10 < 5.5) {
      return 1.5;
    } else if (GPA10 >= 4 && GPA10 < 5) {
      return 1;
    } else if (GPA10 >= 3 && GPA10 < 4) {
      return 0.5;
    } else {
      return 0;
    }
  };
  const { GPA4, GPA10, totalCredits } = calculateGPAs();  
  const GPA4FromGPA10 = calculateGPA4FromGPA10(GPA10);

  const studentInfo = {
    studentId: student && student[0].toString(),
    studentName: student && student[1].toString(),
    dob: student && formatDate(student[2].toString()),
    gender: student && student[3].toString(),
    address: student && student[4].toString(),
    phoneNumber: student && student[5].toString(),
    enrollments: enrollments.map((enrollment, index) => ({
      courseId: enrollment.course_id.toString(),
      courseName: courses[index] ? courses[index].courseName : 'Unknown',
      credits: courses[index] ? courses[index].credits.toString() : 'Unknown',
      gradeMid: enrollment.grade_mid.toString(),
      gradeFi: enrollment.grade_fi.toString(),
      instructorId: courses[index] ? courses[index].instructor.toString() : 'Unknown',
      required: parseInt(courses[index] ? courses[index].option : 0) === 0 ? 'x' : '',
    })),
    GPA4: GPA4.toFixed(2),
    GPA10: GPA10.toFixed(2),
    totalCredits: totalCredits,
  };

  // Chuyển object studentInfo thành chuỗi JSON
  const studentInfoJSON = "MSSV: "+studentInfo.studentId+", tên: "+studentInfo.studentName+", ngày sinh: "
        + studentInfo.dob+", giới tính: " +studentInfo.gender+", địa chỉ: "+ studentInfo.address+", sđt: "
         + studentInfo.phoneNumber+", số tín chỉ tích lũy: "+studentInfo.totalCredits+", điểm trung bình tích lũy hệ 4: "
         + studentInfo.GPA4 + ", điểm trung bình tích lũy hệ 10: " +studentInfo.GPA10
  ;

  useEffect(() => {
    const loadLogs = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask to interact with Ethereum");
        return;
      }

      const web3 = new Web3(window.ethereum);

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const networkId = await web3.eth.net.getId();
        const networkData = MarketplaceContract.networks[networkId];
        const createWorkContract = new web3.eth.Contract(
          MarketplaceContract.abi,
          networkData.address
        );

        const logCount = await createWorkContract.methods.getLogsCount().call();
        let tempLogs = [];
        for (let i = 0; i < logCount; i++) {
          const log = await createWorkContract.methods.getLog(i).call();
          const date = new Date(log.timestamp * 1000);
          const formattedDate = `${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)} `;
          const processedLog = {
            id: parseInt(log.id),
            timestamp: formattedDate,
            content: log.content,
            studentId: log.studentId,
            courseId: parseInt(log.courseId) 
          };

          if (parseInt(processedLog.studentId) === parseInt(studentId)) { 
      tempLogs.push(processedLog);
    }
    // tempLogs.push(processedLog);
        }
        setLogs(tempLogs);
        setLoading(false);
      } catch (error) {
        console.error("Error loading logs:", error);
        alert("Failed to load logs. Please check the console for details.");
      }
    };

    loadLogs();
  }, [studentId]);

 
  const logsText = logs
  .filter(log => log.content.includes('thay'))
  .map(log => {
    // Tìm kiếm môn học tương ứng với mã môn học
    const course = courses.find(course => parseInt(course.id) === parseInt(log.courseId));
    // Nếu tìm thấy môn học, sử dụng tên môn học, ngược lại, hiển thị "Unknown"
    const courseName = course ? course.courseName : 'Unknown';
    return `${log.timestamp}, Môn học: ${courseName}, ${log.content}`;
  })
  .join("\n");

 
  

  const countOccurrences = () => {
    const count = logs.filter(log =>
      log.content.toLowerCase().includes('thay') 
    ).length;
    return count;
  };
  console.log('countOccurrences', countOccurrences())

 





  


 
  // const combinedText = `Số lần thay đổi (${countOccurrences()})${studentInfoJSON}\n${logsText}`;

  let combinedText;
if (countOccurrences() === 0) {
  combinedText = `(Đây là bản gốc)\n${studentInfoJSON}`;
} else {
  combinedText = `(Không phải bản gốc, số lần thay đổi ${countOccurrences()})\n${studentInfoJSON}\n***Chi tiết những thay đổi\n${logsText}`;
}




 
  

 
 

 

  return (
    <div  style={{marginLeft:'20px', marginBottom:'20px',position:'relative', width:'850px', height:'1123px',margin:'0 auto',padding:'30px'}}>
      <div id="student-detail" >
    <div style={{display:'flex',gap:'196px', paddingLeft:'42px'}}>
      <h6>BỘ GIÁO DỤC VÀ ĐÀO TẠO</h6>
      <h6><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></h6>
      </div>
      <div style={{display:'flex',gap:'196px'}}>
      <h6 ><strong>TRƯỜNG ĐẠI HỌC NÔNG LÂM TP.HCM</strong></h6>
      <h6><strong>Độc lập - Tự do - Hạnh phúc</strong></h6>
      </div>
     
      <h4 style={{paddingLeft:'293px', paddingTop:'25px'}}>GIẤY XÁC NHẬN</h4>
      {student && (
        <div style={{paddingTop:'30px'}} className="student-info">
          {/* <p>ID: {student[0].toString()}</p> */}
          <p>Họ và tên sinh viên: {student[1].toString()}</p>
          <p>Ngày sinh: {formatDate(student[2].toString())}</p>
          <p>Giới tính: {student[3].toString()}</p>
          {/* <p>Địa chỉ: {student[4].toString()}</p> */}
          <p>Tên trường: <strong style={{fontWeight:'500'}}>Đại học Nông Lâm Thành phố Hồ Chí Minh</strong></p>
          <p>Ngành học: Công nghệ thông tin</p>
          <p>Hệ đào tạo: Đại trà</p>
          <div style={{display:'flex', gap:'40px'}}>
          <p>Niên khóa: 2020-2024</p> 
          <p>Lớp: DH20DT</p> 
          <p>MSSV: {student[0].toString()}</p> 
         </div>
       
        </div>
      )}
      <div style={{marginTop:'20px'}}>
        <p>- Chấp hành chủ chương, chính sách của Đảng và Nhà nước</p>
        <p>- Không bị xử phạt về các hành vi: Cờ bạc, nghiện hút, trộm cắp, buôn lậu</p>
        <p>- Không bị kỷ luật</p>
      </div>
      <div style={{paddingLeft:'382px', paddingTop:'20px'}}>
        <p>Thành phố Hồ Chí Minh, ngày ... tháng ... năm ...</p>
        <p style={{paddingLeft:'84px'}}><strong>TL. HIỆU TRƯỞNG</strong></p>
        <p><strong>TRƯỞNG PHÒNG CÔNG TÁC SINH VIÊN</strong></p>
      </div>
      </div>
      <button className="pdf-button" onClick={handleSaveAsPDF}>In giấy xác nhận</button>
      <div style={{position:'absolute', top:'0',right:'0',marginRight:'161px', marginTop:'187px'}} className="qr-code-container">
        <QRCode size={150} value={combinedText} />
      </div>
      
     
    </div>
  );
};
export default StudentDetail;
