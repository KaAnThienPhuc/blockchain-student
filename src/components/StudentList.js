import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';
import './Style/studentlist.css'
import { Link } from 'react-router-dom';

const StudentList = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(5);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
const [updatedStudent, setUpdatedStudent] = useState(null);
const [loading, setLoading] = useState(false);

 

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          const accs = await web3Instance.eth.getAccounts();
          setAccounts(accs);
          // Get the contract instance
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = MarketplaceContract.networks[networkId];
          const instance = new web3Instance.eth.Contract(
            MarketplaceContract.abi,
            deployedNetwork && deployedNetwork.address,
          );
          setContract(instance);
        } catch (error) {
          console.error('Error connecting to Web3', error);
        }
      }
    };
    initWeb3();
  }, []);

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (contract) {
        try {
          // Call the contract to get enrolled students
          setLoading(true); // Bắt đầu tải dữ liệu
         
          const students = await contract.methods.getallStudents().call();
          setEnrolledStudents(students);
          console.log('student:',students);
          setLoading(false); // Bắt đầu tải dữ liệu
        } catch (error) {
          console.error('Error fetching enrolled students', error);
        }
      }
    };
    fetchEnrolledStudents();
  }, [contract]);

  // Function to format date
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Function to handle search
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    setCurrentPage(1); // Reset page when searching
  };

  // Function to paginate
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to get current students
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = enrolledStudents.filter(student =>
    student.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    student.id.toString().includes(searchKeyword)
  ).slice(indexOfFirstStudent, indexOfLastStudent);





  const handleEdit = (student) => {
    setSelectedStudent(student);
    setUpdatedStudent({ ...student });
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
      
      // Thực hiện cập nhật sinh viên tại đây
      const networkId = await web3.eth.net.getId();
      const networkData = MarketplaceContract.networks[networkId];
      const MarketplaceContract2 = new web3.eth.Contract(
        MarketplaceContract.abi,
        networkData.address
      );
      MarketplaceContract2.methods.updateStudent(
        selectedStudent.id,
        updatedStudent.name,
        updatedStudent.dateOfBirth,
        updatedStudent.gender,
        updatedStudent.residence,
        updatedStudent.phoneNumber
      ).send({ from: accounts[0] })
      .on('transactionHash', function(hash){
        console.log('Transaction hash:', hash);
        alert('Chỉnh sửa thông tin sinh viên thành công');
      })
      .on('confirmation',  function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          console.log('Transaction confirmed');
      
        
            window.location.reload()
      
        }
      })
      .on('error', function(error, receipt){
        console.error('Giao dịch gặp lỗi:', error);
        // Xử lý khi gặp lỗi trong quá trình gửi hoặc xác nhận giao dịch
      });
      
    } catch (error) {
      console.error("Lỗi khi cập nhật sinh viên:", error);
      alert("Không thể cập nhật sinh viên. Vui lòng kiểm tra console để biết chi tiết.");
    }
  };
  

  return (
    <div style={{paddingLeft:'20px', marginTop:'10px', marginBottom:'10px'}}>
      <h4>Danh sách sinh viên</h4>
      <input 
        type="text"
        placeholder="Tìm kiếm..."
        value={searchKeyword}
        onChange={handleSearch}
        style={{ marginBottom: '10px', width:'30%', height:'40px' }}
      />
       <Link style={{marginLeft:'256px'}} to="/add-student">
          <button className="add-student-btn">Thêm sinh viên</button>
        </Link>
      <table className="student-table">
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ và tên</th>
            <th>Ngày sinh</th>
            <th>Giới tính</th>
            <th>Quê quán</th>
            <th>Số điện thoại</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentStudents.map(student => (
            <tr key={student.id}>
              <td>
              <Link to={`/students/${student.id}`}>{student.id.toString()}</Link>
                </td>
              <td>{student.name.toString()}</td>
              <td>{formatDate(student.dateOfBirth)}</td>
              <td>{student.gender.toString()}</td>
              <td>{student.residence.toString()}</td>
              <td>{student.phoneNumber.toString()}</td>
              <td>
              <Link>
          <button style={{padding:'6px'}} className="add-student-btn" onClick={() => handleEdit(student)}>Chỉnh sửa</button>
        </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <ul className="pagination" style={{ marginTop: '10px' }}>
        {Array.from({ length: Math.ceil(enrolledStudents.length / studentsPerPage) }).map((_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>




      {selectedStudent && (
  <div className="student-details">
    <h4>Chỉnh sửa thông tin sinh viên</h4>
    <div>
      <label>MSSV:</label>
      <input style={{width:'50%'}}
        type="text"
        value={updatedStudent.id}
        onChange={(e) => setUpdatedStudent({ ...updatedStudent, id: e.target.value })}
        disabled
      />
    </div>
    <div>
      <label>Họ và Tên:</label>
      <input style={{width:'50%'}}
        type="text"
        value={updatedStudent.name}
        onChange={(e) => setUpdatedStudent({ ...updatedStudent, name: e.target.value })}
      />
    </div>
    <div>
      <label>Ngày Sinh:</label>
      <input style={{width:'50%'}}
        type="date"
        value={updatedStudent.dateOfBirth}
        onChange={(e) => setUpdatedStudent({ ...updatedStudent, dateOfBirth: e.target.value })}
      />
    </div>
    <div>
  <label>Giới Tính:</label>
  <select
    style={{ width: '50%' }}
    value={updatedStudent.gender}
    onChange={(e) => setUpdatedStudent({ ...updatedStudent, gender: e.target.value })}
  >
    <option value="nam">nam</option>
    <option value="nữ">nữ</option>
  </select>
</div>
    <div>
      <label>Quê Quán:</label>
      <input style={{width:'50%'}}
        type="text"
        value={updatedStudent.residence}
        onChange={(e) => setUpdatedStudent({ ...updatedStudent, residence: e.target.value })}
      />
    </div>
    <div>
      <label>Số Điện Thoại:</label>
      <input style={{width:'50%'}}
        type="text"
        value={updatedStudent.phoneNumber}
        onChange={(e) => setUpdatedStudent({ ...updatedStudent, phoneNumber: e.target.value })}
      />
    </div>
    <button style={{marginTop:'10px'}} onClick={handleUpdate}>Cập nhật</button>
  </div>
)}

    </div>
  );
};

export default StudentList;
