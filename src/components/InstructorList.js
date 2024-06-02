import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';
import {  Link } from 'react-router-dom';
// import './Style/instructorlist.css'; 

const InstructorList = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [instructorsPerPage, setInstructorsPerPage] = useState(5);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [updatedInstructor, setUpdatedInstructor] = useState(null);
  useEffect(() => {
    const loadInstructors = async () => {
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

        const instructorList = await marketplaceInstance.methods.getAllInstructors().call();
        setInstructors(instructorList);
        setLoading(false);
      } catch (error) {
        console.error('Error loading instructors:', error);
        setLoading(false);
      }
    };

    loadInstructors();
  }, []);

  // Function to handle search
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    setCurrentPage(1); // Reset page when searching
  };

  // Function to paginate
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to get current instructors
  const indexOfLastInstructor = currentPage * instructorsPerPage;
  const indexOfFirstInstructor = indexOfLastInstructor - instructorsPerPage;
  const currentInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    instructor.id.toString().includes(searchKeyword)
  ).slice(indexOfFirstInstructor, indexOfLastInstructor);



  const handleEdit = (instructor) => {
    setSelectedInstructor(instructor);
    setUpdatedInstructor({ ...instructor });
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
  
      // Thực hiện cập nhật giảng viên tại đây
      const networkId = await web3.eth.net.getId();
      const networkData = MarketplaceContract.networks[networkId];
      const marketplaceInstance = new web3.eth.Contract(
        MarketplaceContract.abi,
        networkData.address
      );
  
      await marketplaceInstance.methods.updateInstructor(
        selectedInstructor.id,
        updatedInstructor.name,
        updatedInstructor.degree,
        updatedInstructor.email,
        updatedInstructor.phone
      ).send({ from: accounts[0] })
      .on('transactionHash', function(hash){
        console.log('Transaction hash:', hash);
        alert('Chỉnh sửa thông tin giảng viên thành công');
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
      console.error("Lỗi khi cập nhật giảng viên:", error);
      alert("Không thể cập nhật giảng viên. Vui lòng kiểm tra console để biết chi tiết.");
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{marginLeft:'10px', marginTop:'10px'}} className="instructor-list-container">
      <h4 style={{marginBottom:'10px'}}>Danh sách giảng viên</h4>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchKeyword}
        onChange={handleSearch}
        style={{ marginBottom: '10px', width:'30%' }}
      />

<Link style={{marginLeft:'381px'}} to="/add-instructor">
          <button className="add-student-btn">Thêm giảng viên</button>
        </Link>
      <table style={{width:'70%'}}>
        <thead>
          <tr>
            <th>Mã giảng viên</th>
            <th>Tên giảng viên</th>
            <th>Học vị</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentInstructors.map(instructor => (
            <tr key={instructor.id.toString()}>
              <Link to={`/instructor/${instructor.id}`}><td>{instructor.id.toString()}</td></Link> 
              <td>{instructor.name.toString()}</td>
              <td>{parseInt(instructor.degree) === 0 ? 'Thạc sĩ' : 'Tiến sĩ'}</td>
              <td>{instructor.email.toString()}</td>
              <td>{instructor.phone.toString()}</td>
              <td>
              <Link>
          <button style={{padding:'6px'}} className="add-student-btn" onClick={() => handleEdit(instructor)}>Chỉnh sửa</button>
        </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <ul className="pagination" style={{ marginTop: '10px' }}>
        {Array.from({ length: Math.ceil(instructors.length / instructorsPerPage) }).map((_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>



      {selectedInstructor && (
  <div className="instructor-details">
    <h4>Chỉnh sửa thông tin giảng viên</h4>
    <div>
      <label>Mã giảng viên:</label>
      <input
        style={{ width: '50%' }}
        type="text"
        value={updatedInstructor.id}
        onChange={(e) => setUpdatedInstructor({ ...updatedInstructor, id: e.target.value })}
        disabled
      />
    </div>
    <div>
      <label>Tên giảng viên:</label>
      <input
        style={{ width: '50%' }}
        type="text"
        value={updatedInstructor.name}
        onChange={(e) => setUpdatedInstructor({ ...updatedInstructor, name: e.target.value })}
      />
    </div>
    <div>
      <label>Học vị:</label>
      <select
        style={{ width: '50%' }}
        value={updatedInstructor.degree}
        onChange={(e) => setUpdatedInstructor({ ...updatedInstructor, degree: e.target.value })}
      >
        <option value="0">Thạc sĩ</option>
        <option value="1">Tiến sĩ</option>
      </select>
    </div>
    <div>
      <label>Email:</label>
      <input
        style={{ width: '50%' }}
        type="email"
        value={updatedInstructor.email}
        onChange={(e) => setUpdatedInstructor({ ...updatedInstructor, email: e.target.value })}
      />
    </div>
    <div>
      <label>Số điện thoại:</label>
      <input
        style={{ width: '50%' }}
        type="text"
        value={updatedInstructor.phone}
        onChange={(e) => setUpdatedInstructor({ ...updatedInstructor, phone: e.target.value })}
      />
    </div>
    <button style={{ marginTop: '10px' }} onClick={handleUpdate}>Cập nhật</button>
  </div>
)}

    </div>
  );
};

export default InstructorList;
