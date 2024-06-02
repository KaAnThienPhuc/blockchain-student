import React, { useState,useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';
import './Style/addcourse.css'; // Import CSS file for styling
import { Link, useNavigate } from 'react-router-dom';
const AddCourse = () => {
  const [id, setId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState(0);
  const [instructor, setInstructor] = useState('');
  const [option, setOption] = useState(0);
  const [message, setMessage] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [instructorId, setInstructorId] = useState('');
  const navigate = useNavigate();
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

  const handleAddCourse = async () => {
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

       // Kiểm tra xem môn học đã tồn tại chưa
       const CourseExists = await marketplaceInstance.methods.courseExists(parseInt(id)).call();
       if (CourseExists) {
         alert('Mã môn học đã tồn tại');
         return;
       }
      
  
      // Kiểm tra xem instructor có rỗng không
      if (!instructorId) {
        alert('Vui lòng chọn giảng viên');
        return;
      }
   // Đặt hẹn giờ để chuyển hướng sau 8 giây
  //  setTimeout(() => {
           
  //   navigate('/course-list');
  // }, 8000);
      // Thêm khóa học nếu không tồn tại
      // await marketplaceInstance.methods.addCourse(
      //   parseInt(id),
      //   courseName,
      //   parseInt(credits),
      //  parseInt(instructorId),
      //   parseInt(option)
      // ).send({ from: accounts[0] });
      // navigate('/course-list');
      // setMessage('Course added successfully!');



    //   marketplaceInstance.methods.addCourse(
    //     parseInt(id),
    //     courseName,
    //     parseInt(credits),
    //     parseInt(instructorId),
    //     parseInt(option)
    // ).send({ from: accounts[0] }, function(error, transactionHash) {
    //     if (!error) {
    //       alert('Thêm môn học thành công, vui lòng chờ trong giây lát... ')
    //         // Giao dịch đã gửi thành công, bạn có thể thực hiện các hành động phía sau ở đây
    //         setTimeout(() => {
    //           navigate('/course-list');
    //         }, 8000);
    //         setMessage('Course added successfully!');
    //     } else {
    //         console.error('Error adding course:', error);
    //         setMessage('An error occurred while adding course.');
    //     }
    // });


    marketplaceInstance.methods.addCourse(
      parseInt(id),
      courseName,
      parseInt(credits),
      parseInt(instructorId),
      parseInt(option)
  ).send({ from: accounts[0] })
  .on('transactionHash', function(transactionHash) {
      // Xử lý khi có transactionHash được tạo ra
      alert('Thêm môn học thành công')
  })
  .on('confirmation', function(confirmationNumber, receipt) {
      // Xử lý khi giao dịch được xác nhận
      if (confirmationNumber === 1) {
          // Giao dịch đã được xác nhận, bạn có thể thực hiện các hành động phía sau ở đây
          
              navigate('/course-list');
        
         
      }
  })
  .on('error', function(error) {
      // Xử lý khi gặp lỗi trong quá trình gửi giao dịch
      console.error('Error adding course:', error);
      setMessage('An error occurred while adding course.');
  });
  
    





    } catch (error) {
      console.error('Error adding course:', error);
      setMessage('An error occurred while adding course.');
    }
  };

  return (
    <div style={{marginLeft:'10px', marginTop:'10px'}} className="add-course-container">
      <h4>Thêm môn học</h4>
      <form onSubmit={e => { e.preventDefault(); }}>
        <div className="form-group">
          <label>Mã môn học:</label>
          <input type="number" value={id} onChange={e => setId(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tên môn học:</label>
          <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Số tín chỉ:</label>
          <input type="number" value={credits} onChange={e => setCredits(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Giảng viên:</label>
          <select  value={instructorId} onChange={e => setInstructorId(e.target.value)}>
            <option value="">Chọn giảng viên</option>
            {instructors.map(instructor => (
              <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group radio-group">
  <div className="radio-button">
    <input type="radio" value={0} checked={option === 0} onChange={() => setOption(0)} />
    <span className="radio-label">Bắt buộc</span>
  </div>
  <div className="radio-button">
    <input type="radio" value={1} checked={option === 1} onChange={() => setOption(1)} />
    <span className="radio-label">Không bắt buộc</span>
  </div>
</div>
        <button className="btn-submit" onClick={handleAddCourse}>Hoàn tất</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddCourse;
