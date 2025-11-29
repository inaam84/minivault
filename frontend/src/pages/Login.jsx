import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '../components/Input';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState(null);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setBackendError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setBackendError(data.error?.message || 'Login failed');
      } else {
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/dashboard');
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
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login</h2>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
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
              {errors.email && touched.email && (
                <div style={{ color: 'red', marginBottom: 8 }}>{errors.email}</div>
              )}

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
                <div style={{ color: 'red', marginBottom: 8 }}>{errors.password}</div>
              )}

              {backendError && <div style={{ color: 'red', marginBottom: 12 }}>{backendError}</div>}

              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: 8, backgroundColor: '#2575fc', color: 'white' }}
              >
                {isSubmitting ? 'Logging in…' : 'Login'}
              </Button>
            </Form>
          )}
        </Formik>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </Layout>
  );
}
