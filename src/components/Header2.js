import React, { useEffect, useState } from "react";
import './Style/header.css'
import { useNavigate,  Link  } from 'react-router-dom'; 

const Header = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    // Lấy giá trị name từ sessionStorage khi component được tạo ra
    const storedName = sessionStorage.getItem('mssv');
    if (storedName) {
        setName(storedName);
    }
}, []);

const handleLogout = () => {
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('name');
  navigate('/'); // Sử dụng navigate để chuyển hướng đến trang login
};
  return (
    <header className="header" style={styles.header}>
      {/* <h4>Khoa Công Nghệ Thông Tin</h4> */}
      <nav style={styles.nav}>
        <ul style={styles.ul}>
          <li style={styles.li}><a style={{color:'white'}} href="/add-enrollment">Đăng ký môn học</a></li>
          <li style={styles.li}><Link style={{color:'white'}} to={`/student-user-detail/${name}`}>Xem điểm</Link></li>
          <li style={styles.li}><Link style={{color:'white'}} to={`/certificate/${name}`}>Giấy xác nhận</Link></li>
          
        
          {/* <li style={styles.li}><a style={{color:'white'}} href="/add-instructor">Thêm giảng viên</a></li> */}
        </ul>
      </nav>
      <div className="user-actions" style={styles.userActions}>
        <div className="greeting">Xin chào, {name}!</div>
        <div  style={{cursor:'pointer'}} className="logout" onClick={handleLogout}><a >Đăng xuất</a></div>
      </div>
    </header>
  );
}



const styles = {
  header: {
    backgroundColor: '#0d6efd',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'space-between', // Sắp xếp các phần tử con theo khoảng cách đều nhau
    alignItems: 'center', // Canh chỉnh các phần tử con theo chiều dọc
  },
  nav: {
    marginTop: '10px',
    // color: '#fff'
  },
  ul: {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
    display: 'flex',
    
  },
  li: {
    marginRight: '20px',
  },
  a: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
  }
};

export default Header;
