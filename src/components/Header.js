import React from 'react';
import './Style/header.css'
import { useNavigate,  Link  } from 'react-router-dom'; 
const Header = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('name');
    navigate('/'); // Sử dụng navigate để chuyển hướng đến trang login
  };
  return (
    <header className="header" style={styles.header}>
      <h4>Khoa Công Nghệ Thông Tin</h4>
      <nav style={styles.nav}>
        <ul style={styles.ul}>
          {/* <li style={styles.li}><a style={{color:'white'}} href="/add-enrollment">Đăng ký môn học</a></li> */}
          <li style={styles.li}><a style={{color:'white'}} href="/student-list">Danh sách sinh viên</a></li>
          
          <li style={styles.li}><a style={{color:'white'}} href="/course-list">Danh sách môn học</a></li>
          {/* <li style={styles.li}><a style={{color:'white'}} href="/add-course">Thêm môn học</a></li> */}
          <li style={styles.li}><a style={{color:'white'}} href="/instructor-list">Danh sách giảng viên</a></li>
          <li style={styles.li}><a style={{color:'white'}} href="/log-list">Lịch sử hoạt động</a></li>
          <li style={styles.li}><a style={{color:'white', cursor:'pointer'}}  onClick={handleLogout}>Đăng xuất</a></li>
        </ul>
      </nav>
    </header>
  );
}



const styles = {
  header: {
    backgroundColor: '#0d6efd',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
  
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
