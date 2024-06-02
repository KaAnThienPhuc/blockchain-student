import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';

const EnrollmentList = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [enrollmentsPerPage, setEnrollmentsPerPage] = useState(5);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const loadEnrollments = async () => {
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

        const enrollmentList = await marketplaceInstance.methods.getallEnrollments().call();
        setEnrollments(enrollmentList);
        setLoading(false);
      } catch (error) {
        console.error('Error loading enrollments:', error);
        setLoading(false);
      }
    };

    loadEnrollments();
  }, []);

  // Function to handle search
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    setCurrentPage(1); // Reset page when searching
  };

  // Function to paginate
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to get current enrollments
  const indexOfLastEnrollment = currentPage * enrollmentsPerPage;
  const indexOfFirstEnrollment = indexOfLastEnrollment - enrollmentsPerPage;
  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student_id.toString().includes(searchKeyword) ||
    enrollment.course_id.toString().includes(searchKeyword) ||
    enrollment.grade_mid.includes(searchKeyword) ||
    enrollment.grade_fi.includes(searchKeyword)
  );
  const currentEnrollments = filteredEnrollments.slice(indexOfFirstEnrollment, indexOfLastEnrollment);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ marginLeft: '10px', marginTop: '10px' }} className="enrollment-list-container">
      <h4 style={{ marginBottom: '10px' }}>Danh sách đăng ký môn học</h4>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchKeyword}
        onChange={handleSearch}
        style={{ marginBottom: '10px',width:'30%', height:'40px' }}
      />
      <table style={{width:'60%'}}>
        <thead>
          <tr>
            <th>STT</th>
            <th>MSSV</th>
            <th>Mã môn học</th>
            <th>GK</th>
            <th>TK</th>
            {/* <th>Trung bình</th> */}

          </tr>
        </thead>
        <tbody>
          {currentEnrollments.map((enrollment, index) => (
            <tr key={index}>
              <td>{parseInt(enrollment.id)+1}</td>
              <td>{enrollment.student_id.toString()}</td>
              <td>{enrollment.course_id.toString()}</td>
              <td>{enrollment.grade_mid ? parseFloat(enrollment.grade_mid) : ''}</td>
              <td>{enrollment.grade_fi ? parseFloat(enrollment.grade_fi) : ''}</td>
              {/* <td>{(parseFloat(enrollment.grade_fi)+parseFloat(enrollment.grade_mid))/2}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <ul className="pagination" style={{ marginTop: '10px' }}>
        {Array.from({ length: Math.ceil(filteredEnrollments.length / enrollmentsPerPage) }).map((_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnrollmentList;
