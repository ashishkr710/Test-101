// frontend/src/pages/EditUser.tsx

import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

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

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: File | null;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  homeAddress: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  appointmentLetter: File | null;
}

interface FormStatus {
  general?: string;
}

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    email: '',
    profilePhoto: null,
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyZip: '',
    homeAddress: '',
    homeCity: '',
    homeState: '',
    homeZip: '',
    appointmentLetter: null,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        const user: User = response.data;
        const address = user.address;
        setInitialValues({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePhoto: null, // Optional to update
          companyAddress: address.companyAddress,
          companyCity: address.companyCity,
          companyState: address.companyState,
          companyZip: address.companyZip,
          homeAddress: address.homeAddress,
          homeCity: address.homeCity,
          homeState: address.homeState,
          homeZip: address.homeZip,
          appointmentLetter: null, // Optional to update
        });
      } catch (error) {
        console.error(error);
        alert('User not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    profilePhoto: Yup.mixed()
      .test(
        'fileFormat',
        'Unsupported Format',
        (value) => {
          if (value instanceof File) {
            return ['image/png', 'image/jpg', 'image/jpeg'].includes(value.type);
          }
          return true; // Optional field
        }
      ),
    companyAddress: Yup.string().required('Company address is required'),
    companyCity: Yup.string().required('Company city is required'),
    companyState: Yup.string().required('Company state is required'),
    companyZip: Yup.string()
      .required('Company zip is required')
      .matches(/^\d{6}$/, 'Company zip must be 6 digits'),
    homeAddress: Yup.string().required('Home address is required'),
    homeCity: Yup.string().required('Home city is required'),
    homeState: Yup.string().required('Home state is required'),
    homeZip: Yup.string()
      .required('Home zip is required')
      .matches(/^\d{6}$/, 'Home zip must be 6 digits'),
    appointmentLetter: Yup.mixed()
      .test(
        'fileFormat',
        'Only PDF files are allowed',
        (value) => {
          if (value instanceof File) {
            return value.type === 'application/pdf';
          }
          return true; // Optional field
        }
      ),
  });

  const onSubmit = async (
    values: FormValues,
    { setSubmitting, setErrors, setStatus }: FormikHelpers<FormValues>
  ) => {
    const formData = new FormData();
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('email', values.email);
    if (values.profilePhoto) formData.append('profilePhoto', values.profilePhoto);
    formData.append('companyAddress', values.companyAddress);
    formData.append('companyCity', values.companyCity);
    formData.append('companyState', values.companyState);
    formData.append('companyZip', values.companyZip);
    formData.append('homeAddress', values.homeAddress);
    formData.append('homeCity', values.homeCity);
    formData.append('homeState', values.homeState);
    formData.append('homeZip', values.homeZip);
    if (values.appointmentLetter) formData.append('appointmentLetter', values.appointmentLetter);

    try {
      await axios.put(`/api/users/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/view/${id}`);
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        const fieldErrors: { [key: string]: string } = {};
        let generalError = '';
        error.response.data.errors.forEach((err: any) => {
          if (err.param) {
            fieldErrors[err.param] = err.msg;
          } else {
            generalError = err.msg;
          }
        });
        setErrors(fieldErrors);
        if (generalError) {
          setStatus({ general: generalError });
        }
      } else {
        setStatus({ general: 'Something went wrong' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2>Edit User</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={onSubmit}
        initialStatus={{ general: '' }}
      >
        {({ setFieldValue, isSubmitting, status }) => (
          <Form>
            {status && status.general && <div className="error">{status.general}</div>}
            <div>
              <label>First Name:</label>
              <Field name="firstName" type="text" />
              <ErrorMessage name="firstName" component="div" className="error" />
            </div>
            <div>
              <label>Last Name:</label>
              <Field name="lastName" type="text" />
              <ErrorMessage name="lastName" component="div" className="error" />
            </div>
            <div>
              <label>Email:</label>
              <Field name="email" type="email" />
              <ErrorMessage name="email" component="div" className="error" />
            </div>
            <div>
              <label>Profile Photo:</label>
              <input
                name="profilePhoto"
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                onChange={(event) => {
                  if (event.currentTarget.files && event.currentTarget.files[0]) {
                    setFieldValue('profilePhoto', event.currentTarget.files[0]);
                  }
                }}
              />
              <ErrorMessage name="profilePhoto" component="div" className="error" />
            </div>
            <div>
              <h3>Company Address</h3>
              <label>Address:</label>
              <Field name="companyAddress" type="text" />
              <ErrorMessage name="companyAddress" component="div" className="error" />

              <label>City:</label>
              <Field name="companyCity" type="text" />
              <ErrorMessage name="companyCity" component="div" className="error" />

              <label>State:</label>
              <Field name="companyState" type="text" />
              <ErrorMessage name="companyState" component="div" className="error" />

              <label>Zip:</label>
              <Field name="companyZip" type="text" />
              <ErrorMessage name="companyZip" component="div" className="error" />
            </div>
            <div>
              <h3>Home Address</h3>
              <label>Address:</label>
              <Field name="homeAddress" type="text" />
              <ErrorMessage name="homeAddress" component="div" className="error" />

              <label>City:</label>
              <Field name="homeCity" type="text" />
              <ErrorMessage name="homeCity" component="div" className="error" />

              <label>State:</label>
              <Field name="homeState" type="text" />
              <ErrorMessage name="homeState" component="div" className="error" />

              <label>Zip:</label>
              <Field name="homeZip" type="text" />
              <ErrorMessage name="homeZip" component="div" className="error" />
            </div>
            <div>
              <label>Appointment Letter (PDF):</label>
              <input
                name="appointmentLetter"
                type="file"
                accept="application/pdf"
                onChange={(event) => {
                  if (event.currentTarget.files && event.currentTarget.files[0]) {
                    setFieldValue('appointmentLetter', event.currentTarget.files[0]);
                  }
                }}
              />
              <ErrorMessage name="appointmentLetter" component="div" className="error" />
            </div>
            <div>
              <button type="submit" disabled={isSubmitting}>
                Update
              </button>
              <button type="button" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditUser;
