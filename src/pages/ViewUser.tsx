// frontend/src/pages/ViewUser.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

interface Address {
  id: number;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  homeAddress: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
  appointmentLetter: string;
  address: Address;
}

const ViewUser: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error(error);
        alert('User not found');
        // navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data</div>;

  const { address } = user;

  return (
    <div className="container">
      <h2>User Details</h2>
      <div>
        <img src={`/uploads/${user.profilePhoto}`} alt="Profile" width="150" />
      </div>
      <div>
        <strong>Name:</strong> {user.firstName} {user.lastName}
      </div>
      <div>
        <strong>Email:</strong> {user.email}
      </div>
      <div>
        <h3>Company Address</h3>
        <p>{address.companyAddress}</p>
        <p>
          {address.companyCity}, {address.companyState} - {address.companyZip}
        </p>
      </div>
      <div>
        <h3>Home Address</h3>
        <p>{address.homeAddress}</p>
        <p>
          {address.homeCity}, {address.homeState} - {address.homeZip}
        </p>
      </div>
      <div>
        <a href={`/uploads/${user.appointmentLetter}`} target="_blank" rel="noopener noreferrer">
          View Appointment Letter
        </a>
      </div>
      <div>
        <button onClick={() => navigate(`/edit/${user.id}`)}>Edit Details</button>
      </div>
    </div>
  );
};

export default ViewUser;
