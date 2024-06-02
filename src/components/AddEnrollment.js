import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';
import './Style/addenrollment.css'; // Import CSS file

const AddEnrollment = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [gradeMid, setGradeMid] = useState('');
  const [gradeFinal, setGradeFinal] = useState('');

  const [MSSV, setMSSV] = useState('');
  const [courses, setCourses] = useState([]);
  


  useEffect(() => {
    // Lấy giá trị name từ sessionStorage khi component được tạo ra
    const storedName = sessionStorage.getItem('mssv');
    if (storedName) {
        setMSSV(storedName);
    }
}, []);
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

            // Load courses from the contract
            const courses = await instance.methods.getallCourses().call();
            setCourses(courses);
        } catch (error) {
          console.error('Error connecting to Web3', error);
        }
      }
    };
    initWeb3();
  }, []);

  const handleAddEnrollment = async () => {
    try {
       // Kiểm tra xem môn học đã được đăng ký cho sinh viên hay chưa
    const enrollmentExists = await contract.methods.enrollmentExists(parseInt(MSSV), parseInt(courseId)).call();

    if (!enrollmentExists) {
      // await contract.methods.addEnrollment(parseInt(MSSV), parseInt(courseId), gradeMid, gradeFinal)
      //   .send({ from: accounts[0] });
  //     contract.methods.addEnrollment(parseInt(MSSV), parseInt(courseId), gradeMid, gradeFinal)
  // .send({ from: accounts[0] }, function(error, transactionHash) {
  //   if (!error) {
  //     alert('Đăng ký môn học thành công, vui lòng chờ trong giây lát... ')
  //     setTimeout(() => {
  //       window.location.reload(); // Reload lại trang sau 8 giây
  //     }, 8000); // 8000 milliseconds = 8 giây
      
  //   } else {
  //     console.error('Lỗi khi thêm đăng ký:', error);
  //     // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
  //   }
  // });

  contract.methods.addEnrollment(parseInt(MSSV), parseInt(courseId), gradeMid, gradeFinal)
.send({ from: accounts[0] })
.on('transactionHash', function(transactionHash) {
    // Xử lý khi có transactionHash được tạo ra
    alert('Đăng ký môn học thành công')
})
.on('confirmation', function(confirmationNumber, receipt) {
    // Xử lý khi giao dịch được xác nhận
    if (confirmationNumber === 1) {
        // Giao dịch đã được xác nhận, bạn có thể thực hiện các hành động phía sau ở đây
       
            window.location.reload(); 
      
    }
})
.on('error', function(error) {
    // Xử lý khi gặp lỗi trong quá trình gửi giao dịch
    console.error('Lỗi khi thêm đăng ký:', error);
    // Xử lý lỗi hoặc thực hiện các hành động phù hợp với nghiệp vụ của bạn
});





    } else {
      // Môn học đã được đăng ký cho sinh viên, hiển thị thông báo lỗi
      alert('Môn học đã được tài khoản này đăng ký');
    }
    } catch (error) {
      console.error('Error adding enrollment:', error);
      alert('Vui lòng chọn môn học muốn đăng ký');
    }
  };

  return (
    <div style={{marginTop:'10px'}} className="add-enrollment-container">
      <h5>Đăng ký môn học</h5>
      <div className="input-group">
        <label>MSSV:</label>
        <input type="text" disabled value={MSSV} onChange={(e) => setStudentId(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Tên môn học:</label>
        <select className="input-group" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        <option >--Chọn môn học--</option>
          {courses.map(course => (
         
            <option key={course.id} value={course.id}>{course.courseName}</option>
          ))}
        </select>
      </div>
      {/* <div className="input-group">
        <label>GK:</label>
        <input type="text" value={gradeMid} onChange={(e) => setGradeMid(e.target.value)} />
      </div>
      <div className="input-group">
        <label>TK:</label>
        <input type="text" value={gradeFinal} onChange={(e) => setGradeFinal(e.target.value)} />
      </div> */}
      <button onClick={handleAddEnrollment}>Đăng ký</button>
    </div>
  );
};

export default AddEnrollment;
