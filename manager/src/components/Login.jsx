import React, { useState, useEffect, useRef } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';

const ManagerAuth = () => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', password: '',
    confirmPassword: '', profile: null
  });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef();

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    setErrors({});
    setLoginError('');
  }, [isRegistering]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const trimmedValue = typeof value === 'string' ? value.trimStart() : value;
    if (isRegistering) {
      setFormData((prev) => ({
        ...prev,
        [name]: files ? files[0] : trimmedValue
      }));
    } else {
      setLoginData((prev) => ({
        ...prev,
        [name]: trimmedValue
      }));
    }
  };

  const validateRegister = () => {
    const newErrors = {};
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email';
    if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Invalid phone';
    if (!formData.gender) newErrors.gender = 'Select gender';
    if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don’t match';
    if (!formData.profile) newErrors.profile = 'Upload profile picture';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      const res = await fetch('http://localhost:8000/api/managers/register', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (res.ok) {
        alert('✅ Manager registered!');
        setIsRegistering(false);
        setFormData({
          name: '', email: '', phone: '', gender: '', password: '',
          confirmPassword: '', profile: null
        });
      } else {
        alert(result.message || '❌ Registration failed');
      }
    } catch (err) {
      alert('❌ Server error during registration');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginData.email || !loginData.password) {
      setLoginError('Please fill all fields');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:8000/api/managers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
  
      const result = await res.json();
      if (res.ok) {
        alert('✅ Login successful!');
        // ✅ Save managerId to localStorage
        localStorage.setItem("managerId", result.manager._id);
        // Then navigate
        navigate('/dashboard');
      } else {
        setLoginError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      alert('❌ Server error during login');
    }
  };
  

  return (
    <div className='login-page'>
      <div className="login">
        <h2>{isRegistering ? 'Manager Registration' : 'Manager Login'}</h2>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} encType="multipart/form-data">
          {isRegistering ? (
            <>
              <input ref={inputRef} type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
              {errors.name && <span className="error">{errors.name}</span>}

              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
              {errors.email && <span className="error">{errors.email}</span>}

              <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
              {errors.phone && <span className="error">{errors.phone}</span>}

              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error">{errors.gender}</span>}

              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
              {errors.password && <span className="error">{errors.password}</span>}

              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

              <input type="file" name="profile" accept="image/*" onChange={handleChange} />
              {errors.profile && <span className="error">{errors.profile}</span>}
            </>
          ) : (
            <>
              <input ref={inputRef} type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleChange} />
              <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleChange} />
              {loginError && <span className="error">{loginError}</span>}
            </>
          )}

          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>

        <p className="switch-link">
          {isRegistering ? (
            <>Already have an account? <span onClick={() => setIsRegistering(false)}>Login</span></>
          ) : (
            <>Don't have an account? <span onClick={() => setIsRegistering(true)}>Register</span></>
          )}
        </p>
      </div>
    </div>
  );
};

export default ManagerAuth;
