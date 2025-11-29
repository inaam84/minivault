import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '../components/Input';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { useState } from 'react';

export default function Signup() {
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState(null);

  const SignupSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    name: Yup.string()
      .min(6, 'Name must be at least 6 characters')
      .max(70, 'Name must not exceed 70 characters')
      .required('Required'),
    password: Yup.string().required('Required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setBackendError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setBackendError(data.error?.message || 'Signup failed');
      } else {
        alert('✅ Signup successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setBackendError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div style={{ width: 350, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: 24 }}>Sign Up</h2>

        <Formik
          initialValues={{ email: '', name: '', password: '', confirmPassword: '' }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
            <Form onSubmit={handleSubmit}>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={values.email}
                onChange={handleChange}
                style={{
                  borderColor: errors.email && touched.email ? 'red' : undefined,
                  backgroundColor: 'white',
                }}
              />
              {errors.email && touched.email && <div style={{ color: 'red' }}>{errors.email}</div>}

              <Input
                name="name"
                type="text"
                placeholder="Name"
                value={values.name}
                onChange={handleChange}
                style={{
                  borderColor: errors.name && touched.name ? 'red' : undefined,
                  backgroundColor: 'white',
                }}
              />
              {errors.name && touched.name && <div style={{ color: 'red' }}>{errors.name}</div>}

              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={values.password}
                onChange={handleChange}
                style={{
                  borderColor: errors.password && touched.password ? 'red' : undefined,
                  backgroundColor: 'white',
                }}
              />
              {errors.password && touched.password && (
                <div style={{ color: 'red' }}>{errors.password}</div>
              )}

              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={values.confirmPassword}
                onChange={handleChange}
                style={{
                  borderColor:
                    errors.confirmPassword && touched.confirmPassword ? 'red' : undefined,
                  backgroundColor: 'white',
                }}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <div style={{ color: 'red' }}>{errors.confirmPassword}</div>
              )}

              {backendError && <div style={{ color: 'red', marginBottom: 12 }}>{backendError}</div>}

              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: 8, backgroundColor: '#2575fc', color: 'white' }}
              >
                {isSubmitting ? 'Signing up…' : 'Sign Up'}
              </Button>
            </Form>
          )}
        </Formik>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Login
          </button>
        </div>
      </div>
    </Layout>
  );
}
