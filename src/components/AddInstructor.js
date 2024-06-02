import React, { useState } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';
import './Style/addinstructor.css'; 
import { Link, useNavigate } from 'react-router-dom';
const AddInstructor = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const handleAddInstructor = async () => {
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

       // Kiểm tra xem giảng viên đã tồn tại chưa
       const studentExists = await marketplaceInstance.methods.instructorExists(parseInt(id)).call();
       if (studentExists) {
         alert('Giảng viên đã tồn tại');
         return;
       }

        // Đặt hẹn giờ để chuyển hướng sau 8 giây
  

      // await marketplaceInstance.methods.addInstructor(
      //   parseInt(id),
      //   name,
      //   parseInt(degree),
      //   email,
      //   phone
      // ).send({ from: accounts[0] });


    //   marketplaceInstance.methods.addInstructor(
    //     parseInt(id),
    //     name,
    //     parseInt(degree),
    //     email,
    //     phone
    // ).send({ from: accounts[0] }, function(error, transactionHash) {
    //     if (!error) {
    //       alert('Thêm giảng viên thành công, vui lòng chờ trong giây lát... ')
    //       setTimeout(() => {
           
    //         navigate('/instructor-list');
    //       }, 8000);
    //     } else {
    //         console.error('Error adding instructor:', error);
    //         // Hiển thị thông báo lỗi hoặc thực hiện các hành động phù hợp khác
    //     }
    // });


    marketplaceInstance.methods.addInstructor(
      parseInt(id),
      name,
      parseInt(degree),
      email,
      phone
  ).send({ from: accounts[0] })
  .on('transactionHash', function(transactionHash) {
      // Xử lý khi có transactionHash được tạo ra
      alert('Thêm giảng viên thành công')
  })
  .on('confirmation', function(confirmationNumber, receipt) {
      // Xử lý khi giao dịch được xác nhận
      if (confirmationNumber === 1) {
          // Giao dịch đã được xác nhận, bạn có thể thực hiện các hành động phía sau ở đây
          
              navigate('/instructor-list');
      
      }
  })
  .on('error', function(error) {
      // Xử lý khi gặp lỗi trong quá trình gửi giao dịch
      console.error('Error adding instructor:', error);
      // Hiển thị thông báo lỗi hoặc thực hiện các hành động phù hợp khác
  });
  
    



      setMessage('Instructor added successfully!');
    } catch (error) {
      console.error('Error adding instructor:', error);
      setMessage('An error occurred while adding instructor.');
    }
  };

  return (
    <div style={{marginTop:'10px'}} className="add-instructor-container">
      <h4>Thêm giảng viên</h4>
      <form onSubmit={e => { e.preventDefault(); }}>
        <div className="form-group">
          <label>Mã giảng viên:</label>
          <input type="number" value={id} onChange={e => setId(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tên giảng viên:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
 
  <div className="degree-options">
    <div>
      <input
        type="radio"
        value={0}
        checked={degree === 0}
        onChange={() => setDegree(0)}
      />
      <label>Thạc sĩ</label>
    </div>
    <div>
      <input
        type="radio"
        value={1}
        checked={degree === 1}
        onChange={() => setDegree(1)}
      />
      <label>Tiến sĩ</label>
    </div>
  </div>
</div>
        <div className="form-group">
          <label>Email:</label>
          <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Số điện thoại:</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <button className="btn-submit" onClick={handleAddInstructor}>Hoàn tất</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddInstructor;
