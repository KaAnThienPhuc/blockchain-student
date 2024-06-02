import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';
import './Style/courselist.css'; 
import { useParams, Link, useNavigate } from 'react-router-dom';
const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(5);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [updatedCourse, setUpdatedCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [instructorId, setInstructorId] = useState('');
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();

        const marketplaceNetworkId = await web3.eth.net.getId();
        const marketplaceNetwork = MarketplaceContract.networks[marketplaceNetworkId];
        const marketplaceInstance = new web3.eth.Contract(
          MarketplaceContract.abi,
          marketplaceNetwork && marketplaceNetwork.address,
        );

        const courseList = await marketplaceInstance.methods.getallCourses().call();
        setCourses(courseList);
        setLoading(false);
      } catch (error) {
        console.error('Error loading courses:', error);
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Function to handle search
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    setCurrentPage(1); // Reset page when searching
  };

  // Function to paginate
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to get current courses
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchKeyword.toLowerCase())||
    course.id.toString().includes(searchKeyword)||
    course.instructor.toString().includes(searchKeyword.toLowerCase())
  ).slice(indexOfFirstCourse, indexOfLastCourse);


  const handleEdit = (course) => {
    setSelectedCourse(course);
    setUpdatedCourse({ ...course });
  };

  const handleUpdate = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask để tương tác với Ethereum");
      return;
    }
  
    const web3 = new Web3(window.ethereum);
  
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      const accounts = await web3.eth.getAccounts();
  
      // Thực hiện cập nhật môn học tại đây
      const networkId = await web3.eth.net.getId();
      const networkData = MarketplaceContract.networks[networkId];
      const marketplaceInstance = new web3.eth.Contract(
        MarketplaceContract.abi,
        networkData.address
      );
  
      await marketplaceInstance.methods.updateCourse(
        selectedCourse.id,
        updatedCourse.courseName,
        updatedCourse.credits,
        updatedCourse.instructor,
       
        updatedCourse.option
      ).send({ from: accounts[0] })
      .on('transactionHash', function(hash){
        console.log('Transaction hash:', hash);
        alert('Chỉnh sửa thông tin môn học thành công');
      })
      .on('confirmation',  function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          console.log('Transaction confirmed');
          window.location.reload();
        }
      })
      .on('error', function(error, receipt){
        console.error('Giao dịch gặp lỗi:', error);
        // Xử lý khi gặp lỗi trong quá trình gửi hoặc xác nhận giao dịch
      });
  
    } catch (error) {
      console.error("Lỗi khi cập nhật môn học:", error);
      alert("Không thể cập nhật môn học. Vui lòng kiểm tra console để biết chi tiết.");
    }
  };
  

  useEffect(() => {
    async function fetchInstructors() {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const marketplaceNetworkId = await web3.eth.net.getId();
        const marketplaceNetwork = MarketplaceContract.networks[marketplaceNetworkId];
        const marketplaceInstance = new web3.eth.Contract(
          MarketplaceContract.abi,
          marketplaceNetwork && marketplaceNetwork.address,
        );
        const instructorIds = await marketplaceInstance.methods.getAllInstructors().call();
        setInstructors(instructorIds);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    }
    fetchInstructors();
  }, []);



  if (loading) {
    return <div>Loading...</div>;
  }




  return (
    <div style={{marginLeft:'10px', marginTop:'10px'}} className="course-list-container">
      <h4 style={{marginBottom:'10px'}}>Danh sách môn học</h4>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchKeyword}
        onChange={handleSearch}
        style={{ marginBottom: '10px', width:'50%' }}
      />
        <Link style={{marginLeft:'256px'}} to="/add-course">
          <button className="add-student-btn">Thêm môn học</button>
        </Link>
      <table>
        <thead>
          <tr>
            <th>Mã môn học</th>
            <th>Tên môn học</th>
            <th>Mã giảng viên</th>
            <th>Tín chỉ</th>
            <th>Bắt buộc</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentCourses.map(course => (
            <tr key={course.id.toString()}>
              <td>{course.id.toString()}</td>
              <td>{course.courseName.toString()}</td>
              {/* <td>{course.instructor.toString()}</td> */}
              <td>
              <Link to={`/instructor/${course.instructor.toString()}`} className="instructor-link">
              {course.instructor.toString()}
                  </Link>
                </td>
              <td>{course.credits.toString()}</td>
              <td>{parseInt(course.option) === 0 ? 'X' : ''}</td> {/* Hiển thị 'X' nếu option là 0, ngược lại hiển thị '-' */}
              <td>
              <Link>
          <button style={{padding:'6px'}} className="add-student-btn" onClick={() => handleEdit(course)}>Chỉnh sửa</button>
        </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <ul className="pagination" style={{ marginTop: '10px' }}>
        {Array.from({ length: Math.ceil(courses.length / coursesPerPage) }).map((_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>


      {selectedCourse && (
  <div className="course-details">
    <h4>Chỉnh sửa thông tin môn học</h4>
    <div>
      <label>Mã môn học:</label>
      <input
        style={{ width: '50%' }}
        type="text"
        value={updatedCourse.id}
        onChange={(e) => setUpdatedCourse({ ...updatedCourse, id: e.target.value })}
        disabled
      />
    </div>
    <div>
      <label>Tên môn học:</label>
      <input
        style={{ width: '50%' }}
        type="text"
        value={updatedCourse.courseName}
        onChange={(e) => setUpdatedCourse({ ...updatedCourse, courseName: e.target.value })}
      />
    </div>
    <div>
      <label>Giảng viên:</label>
      <select   style={{ width: '50%' }}  value={updatedCourse.instructor} onChange={e => setUpdatedCourse({...updatedCourse,instructor:e.target.value})}>
          
            {instructors.map(instructor => (
              <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
            ))}
          </select>
    </div>
    <div>
      <label>Số tín chỉ:</label>
      <input
        style={{ width: '50%' }}
        type="number"
        value={updatedCourse.credits}
        onChange={(e) => setUpdatedCourse({ ...updatedCourse, credits: e.target.value })}
      />
    </div>
    <div>
      <label>Bắt buộc:</label>
      <select
        style={{ width: '50%' }}
        value={updatedCourse.option}
        onChange={(e) => setUpdatedCourse({ ...updatedCourse, option: e.target.value })}
      >
        <option value="0">Có</option>
        <option value="1">Không</option>
      </select>
    </div>
    <button style={{marginTop:'10px'}} onClick={handleUpdate}>Cập nhật</button>
  </div>
)}

    </div>
  );
};

export default CourseList;
