// InstructorDetail.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import MarketplaceContract from '../../abis/Marketplace.json';
import '../Style/instructordetail.css';

const InstructorDetail = () => {
  const { instructorId } = useParams();
  const [contract, setContract] = useState(null);
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const networkId = await web3.eth.net.getId();
        
        const deployedNetwork = MarketplaceContract.networks[networkId];

        const instance = new web3.eth.Contract(
          MarketplaceContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        
        setContract(instance);
      } catch (error) {
        console.error('Error initializing contract', error);
      }
    };

    initContract();
  }, []);

  useEffect(() => {
    const fetchInstructorInfo = async () => {
      try {
        if (contract) {
          const instructorInfo = await contract.methods.getInstructorById(instructorId).call();
          setInstructor(instructorInfo);
        }
      } catch (error) {
        console.error('Error fetching instructor info', error);
      }
    };
    
    if (contract) {
      fetchInstructorInfo();
    }
  }, [contract, instructorId]);

  return (
    <div className="instructor-detail-container">
      <h4 style={{marginBottom:'20px'}}>Thông tin giảng viên</h4>
      {instructor && (
        <div className="instructor-info">
          <p><span className="label">Mã giảng viên:</span><span className="value">{instructor[0].toString()}</span></p>
          <p><span className="label">Họ và tên:</span><span className="value">{instructor[1].toString()}</span></p>
          <p><span className="label">Học vị:</span><span className="value">{parseInt(instructor[2].toString()) === 0 ? 'Thạc sĩ' : 'Tiến sĩ'}</span></p>
          <p><span className="label">Email:</span><span className="value">{instructor[3].toString()}</span></p>
          <p><span className="label">Số điện thoại:</span><span className="value">{instructor[4].toString()}</span></p>
        </div>
      )}
    </div>
  );
};

export default InstructorDetail;
