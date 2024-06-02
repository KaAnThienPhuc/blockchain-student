import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceContract from '../abis/Marketplace.json';
import UserContract from '../abis/User.json';
import './Style/addstudent.css';
import { Link, useNavigate } from 'react-router-dom';

const AddStudent = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('male'); // Default gender to 'male'
  const [residence, setResidence] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [accounts, setAccounts] = useState([]);

  const handleAddStudent = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable(); // Request account access if needed
      const accounts = await web3.eth.getAccounts();
  
      const marketplaceNetworkId = await web3.eth.net.getId();
      const marketplaceNetwork = MarketplaceContract.networks[marketplaceNetworkId];
    
      const marketplaceInstance = new web3.eth.Contract(
        MarketplaceContract.abi,
        marketplaceNetwork && marketplaceNetwork.address,
      );
     
  
      // Kiểm tra xem sinh viên đã tồn tại chưa
      const studentExists = await marketplaceInstance.methods.studentExists(parseInt(id)).call();
      if (studentExists) {
        alert('Sinh viên đã tồn tại');
        return;
      }

            // Đặt hẹn giờ để chuyển hướng sau 8 giây
            // setTimeout(() => {
           
            //   navigate('/student-list');
            // }, 10000);
  
      // Thêm sinh viên nếu không tồn tại
      // await marketplaceInstance.methods.addStudent(
      //   parseInt(id),
      //   name,
      //   dateOfBirth,
      //   gender,
      //   residence,
      //   phoneNumber
      // ).send({ from: accounts[0] });



    //   marketplaceInstance.methods.addStudent(
    //     parseInt(id),
    //     name,
    //     dateOfBirth,
    //     gender,
    //     residence,
    //     phoneNumber
    // ).send({ from: accounts[0] }, function(error, transactionHash) {
    //     if (!error) {
    //       alert('Thêm sinh viên thành công, vui lòng chờ trong giây lát... ')
    //         // Giao dịch đã gửi thành công, bạn có thể thực hiện các hành động phía sau ở đây
    //         setTimeout(() => {
           
    //           navigate('/student-list');
    //         }, 10000);
    //     } else {
    //         console.error('Error adding student:', error);
    //         // Hiển thị thông báo lỗi hoặc thực hiện các hành động phù hợp khác
    //     }
    // });


    marketplaceInstance.methods.addStudent(
      parseInt(id),
      name,
      dateOfBirth,
      gender,
      residence,
      phoneNumber
  ).send({ from: accounts[0] })
  .on('transactionHash', function(transactionHash) {
      alert('Thêm sinh viên thành công, vui lòng chờ trong giây lát...');
      // Giao dịch đã gửi thành công, bạn có thể thực hiện các hành động phía sau ở đây
  })
  .on('confirmation', function(confirmationNumber, receipt) {
      if (confirmationNumber === 1) {
          // Giao dịch đã được xác nhận, bạn có thể thực hiện các hành động phía sau ở đây
          navigate('/student-list')
          
      }
  })
  .on('error', function(error) {
      console.error('Error adding student:', error);
      // Hiển thị thông báo lỗi hoặc thực hiện các hành động phù hợp khác
  });
  
    

      
  
     
    } catch (error) {
      console.error('Error adding student:', error);
      setMessage('An error occurred while adding student.');
    }
  };

  useEffect(() => {
    const initWeb3 = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const networkId = await web3Instance.eth.net.getId();
                const deployedNetwork = UserContract.networks[networkId];
                const contractInstance = new web3Instance.eth.Contract(
                    UserContract.abi,
                    deployedNetwork && deployedNetwork.address
                );
                setContract(contractInstance);

                const accs = await web3Instance.eth.getAccounts();
                setAccounts(accs);
            } catch (error) {
                console.error('Error initializing Web3: ', error);
            }
        }
    };
    initWeb3();
}, []);

const registerUser = async () => {
  try {
   
     // Chuyển đổi ngày sinh sang định dạng yyyymmdd
     const formattedDateOfBirth = dateOfBirth.split('-').reverse().join('');
     // Đặt mật khẩu bằng ngày sinh đã được định dạng
     const passwordHash = await contract.methods.hashPassword(formattedDateOfBirth).call();
     // Đăng ký sinh viên với mật khẩu là ngày sinh đã được định dạng
      await contract.methods.registerUser(id, passwordHash, 0).send({ from: accounts[0] });
       





      console.log('User registered successfully!');
    
   
  } catch (error) {
      console.error('Error registering user: ', error);
     
  }
};

  
  

  return (
    <div style={{marginTop:'10px'}} className="add-student-container">
      <h4>Thêm sinh viên</h4>
      <form onSubmit={e => { e.preventDefault(); }}>
        <div>
          <label>MSSV:</label>
          <input type="number" value={id} onChange={e => setId(e.target.value)} />
        </div>
        <div>
          <label>Họ và tên:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>Ngày sinh:</label>
          <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
        </div>
        <div className="gender-container"> {/* Add class for styling */}
          <label>Giới tính:</label>
          <div>
            <label>
              <input
                type="radio"
                value="nam"
                checked={gender === 'nam'}
                onChange={() => setGender('nam')}
              /> Nam
            </label>
            <label>
              <input
                type="radio"
                value="nữ"
                checked={gender === 'nữ'}
                onChange={() => setGender('nữ')}
              /> Nữ
            </label>
          </div>
        </div>
        <div>
          <label>Quê quán:</label>
          <input type="text" value={residence} onChange={e => setResidence(e.target.value)} />
        </div>
        <div>
          <label>Số điện thoại:</label>
          <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
        </div>
        <button onClick={() => {
    handleAddStudent(); // Gọi hàm handleAddStudent đầu tiên
   registerUser();
}}>Hoàn tất</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddStudent;
