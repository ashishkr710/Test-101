// frontend/src/pages/AddUser.tsx

import React from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const AddUser: React.FC = () => {
  const navigate = useNavigate();

  const initialValues: FormValues = {
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
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    profilePhoto: Yup.mixed()
      .required('Profile photo is required')
      .test(
        'fileFormat',
        'Unsupported Format',
        (value) => {
          if (value instanceof File) {
            return ['image/png', 'image/jpg', 'image/jpeg'].includes(value.type);
          }
          return false; // Validation fails if not a File
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
      .required('Appointment letter is required')
      .test(
        'fileFormat',
        'Only PDF files are allowed',
        (value) => {
          if (value instanceof File) {
            return value.type === 'application/pdf';
          }
          return false; // Validation fails if not a File
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
      const response = await axios.post('http://localhost:5000/api/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert("Registration Successfully")
      navigate(`/view/${response.data.userId}`);
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

  return (
    <div className="container">
      <h2>Add User</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
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
                  if (event.currentTarget.files) {
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
                  if (event.currentTarget.files) {
                    setFieldValue('appointmentLetter', event.currentTarget.files[0]);
                  }
                }}
              />
              <ErrorMessage name="appointmentLetter" component="div" className="error" />
            </div>
            <div>
              <button type="submit" disabled={isSubmitting}>
                Submit
              </button>
              <button type="reset">Cancel</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddUser;
