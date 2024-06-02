import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import UserContract from '../abis/User.json';
import { useNavigate } from 'react-router-dom';
import './Style/login.css';

const Login = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

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

    const loginUser = async () => {
        try {
            const passwordHash = await contract.methods.hashPassword(password).call();
            const result = await contract.methods.login(username, passwordHash).call({ from: accounts[0] });
           
            if (result) {
                console.log('User logged in successfully!');
                const userDetails = await contract.methods.getUserByUsername(username).call({ from: accounts[0] });
                console.log('User Details:', userDetails);
                const mssv = userDetails[0].toString();
               
                const role = userDetails[2];

                console.log(username);

                sessionStorage.setItem('username', username);
                
                if(role==1){
                    setLoggedIn(true);
                    sessionStorage.setItem('isLoggedIn', true);
                    // sessionStorage.setItem('name', name);
                    navigate('/student-list');
                } else if (role==0) {
                    setLoggedIn(true);
                    sessionStorage.setItem('isLoggedIn', true);
                    sessionStorage.setItem('mssv', mssv);
                    navigate('/add-enrollment');
                }
            } else {
                console.error('Invalid username or password');
                alert('Mật khẩu hoặc tên đăng nhập sai');
            }
        } catch (error) {
            console.error('Error logging in: ', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h2 className="login-heading">Đăng nhập</h2>
                <div className="form-group">
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                
                <button className="login-button" onClick={loginUser}>Đăng nhập</button>
                {/* <div className="form-group">
                    <a href='/signup' style={{fontSize:'12px', textDecoration:'underline', color:'blue'}}>Đăng ký ngay</a>
                </div> */}
                   {/* <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /> 
                <input type="text" placeholder="Citizen ID" value={citizenID} onChange={(e) => setCitizenID(e.target.value)} />
                <input type="number" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} /> 
                <button onClick={registerUser}>Register</button> */}
            </div>
        </div>
    );
};

export default Login;
