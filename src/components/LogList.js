import React, { useState, useEffect } from "react";
import Web3 from "web3";
import createWorkArtifact from "../abis/Marketplace.json";
// import './style/loglist.css'

const LogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(5);

  useEffect(() => {
    const loadLogs = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask to interact with Ethereum");
        return;
      }

      const web3 = new Web3(window.ethereum);

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const networkId = await web3.eth.net.getId();
        const networkData = createWorkArtifact.networks[networkId];
        const createWorkContract = new web3.eth.Contract(
          createWorkArtifact.abi,
          networkData.address
        );

        const logCount = await createWorkContract.methods.getLogsCount().call();
        let tempLogs = [];
        for (let i = 0; i < logCount; i++) {
          const log = await createWorkContract.methods.getLog(i).call();
          const date = new Date(log.timestamp * 1000);
          const formattedDate = `${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)} `;
 // Lấy tên môn học dựa trên id
 const course = await createWorkContract.methods.getCourseById(log.courseId).call();
 const courseName = course[1];

          const processedLog = {
            id: parseInt(log.id),
            timestamp: formattedDate,
            content: log.content,
            
            studentId: parseInt(log.studentId), 
            courseId: parseInt(log.courseId),
            courseName: courseName // Thêm tên môn học vào processedLog
          };
          tempLogs.push(processedLog);
        }
        setLogs(tempLogs);
        setLoading(false);
      } catch (error) {
        console.error("Error loading logs:", error);
        alert("Failed to load logs. Please check the console for details.");
      }
    };

    loadLogs();
  }, []);

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1); // Reset trang khi tìm kiếm
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.filter(log =>
    log.courseId.toString().includes(searchKeyword.toLowerCase()) ||
    log.studentId.toString().includes(searchKeyword)
  ).slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);



  return (
    <div style={{padding:'10px 10px'}} className="loglist-container">
      <h4 style={{ marginBottom: '23px' }}>Lịch sử người dùng</h4>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchKeyword}
        onChange={handleSearch}
        style={{ width: '300px', height: '40px', marginBottom: '10px' }}
      />
      <table style={{width:'80%'}} className="loglist-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Thời gian</th>
            <th>Nội dung</th>
          
            <th>MSSV</th>
            <th>Tên môn học</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan="5">Loading...</td></tr> :
            currentLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.id}</td>
                <td>{log.timestamp}</td>
                <td>{log.content}</td>
               
                <td>{log.studentId}</td>
                <td>{log.courseName}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <ul className="pagination" style={{ marginTop: '10px' }}>
        {Array.from({ length: Math.ceil(logs.filter(log =>
            log.courseId.toString().includes(searchKeyword.toLowerCase()) ||
          log.studentId.toString().includes(searchKeyword.toLowerCase())
        ).length / logsPerPage) }).map((_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogList;
