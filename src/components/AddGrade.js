import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';
import './Style/addenrollment.css'; // Import CSS file
import { useParams, useNavigate } from 'react-router-dom';

const AddEnrollment = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [gradeMid, setGradeMid] = useState('');
  const [gradeFinal, setGradeFinal] = useState('');
  const [enrollments, setEnrollments] = useState([]); 


  const { studentId_0, courseId_0, id } = useParams();
  const navigate = useNavigate();
  


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
    const fetchCourseName = async () => {
      try {
        if (contract && courseId_0) {
          const course = await contract.methods.getCourseById(parseInt(courseId_0)).call();
          setCourseName(course[1]); // Assuming course name is the second element of the returned array
        }
      } catch (error) {
        console.error('Error fetching course name:', error);
      }
    };
    fetchCourseName();
  }, [contract, courseId_0]); // Fetch course name when contract or courseId_0 changes

  const handleAddEnrollment = async () => {
    try {
      await contract.methods.addEnrollment(parseInt(studentId), parseInt(courseId), gradeMid, gradeFinal)
        .send({ from: accounts[0] });
      alert('Enrollment added successfully!');
      // Clear input fields after adding enrollment
      setStudentId('');
      setCourseId('');
      setGradeMid('');
      setGradeFinal('');
    } catch (error) {
      console.error('Error adding enrollment:', error);
      alert('Failed to add enrollment. Please check the console for details.');
    }
  };
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


  // Function để cập nhật Enrollment dựa trên ID
  const handleUpdateEnrollment = async () => {
    try {
     
      // await contract.methods.addGrade(id, gradeMid, gradeFinal, courseId_0).send({ from: accounts[0] });

    //   contract.methods.addGrade(id, gradeMid, gradeFinal, courseId_0).send({ from: accounts[0] }, function(error, transactionHash) {
    //     if (!error) {
    //       alert('Nhập điểm thành công, vui lòng chờ trong giây lát... ')
    //       setTimeout(() => {
    //         navigate(-1); // Go back to the previous page after 8 seconds
    //       }, 10000); // 8000 milliseconds = 8 seconds
    //     } else {
    //         console.error('Lỗi khi thêm điểm:', error);
    //         // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
    //     }
    // });


    contract.methods.addGrade(id, gradeMid, gradeFinal, courseId_0).send({ from: accounts[0] })
.on('transactionHash', function(transactionHash) {
    // Xử lý khi có transactionHash được tạo ra
    alert('Nhập điểm thành công')
})
.on('confirmation', function(confirmationNumber, receipt) {
    // Xử lý khi giao dịch được xác nhận
    if (confirmationNumber === 1) {
        // Giao dịch đã được xác nhận, bạn có thể thực hiện các hành động phía sau ở đây
       
            navigate(-1); 
       
    }
})
.on('error', function(error) {
    // Xử lý khi gặp lỗi trong quá trình gửi giao dịch
    console.error('Lỗi khi thêm điểm:', error);
    // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
});

    

      
      // fetchEnrollments();
    } catch (error) {
      console.error('Error updating enrollment:', error);
      alert('Failed to update enrollment. Please check the console for details.');
    }
  };

  

 

 

  return (
    <div style={{marginTop:'10px'}} className="add-enrollment-container">
      <h5>Nhập điểm</h5>
      <div className="input-group">
        <label>MSSV:</label>
        <input disabled type="text" value={studentId_0} onChange={(e) => setStudentId(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Mã môn học:</label>
        <input disabled type="text" value={courseId_0} onChange={(e) => setCourseId(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Tên môn học:</label>
        <input disabled type="text" value={courseName}  onChange={(e) => setCourseId(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Điểm thi:</label>
        <input type="text" value={gradeMid} onChange={(e) => setGradeMid(e.target.value)} />
      </div>
      <div className="input-group">
        <label>TK:</label>
        <input type="text" value={gradeFinal} onChange={(e) => setGradeFinal(e.target.value)} />
      </div>
      <button onClick={handleUpdateEnrollment} >Hoàn thành</button>
    </div>
  );
};

export default AddEnrollment;
