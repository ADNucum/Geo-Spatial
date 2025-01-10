import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { supabase } from '@/supabaseClient'; // Adjust the path as needed

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Checking user role for email:', email);
      
      // First check if user has admin role
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role_id, email')
        .eq('email', email)
        .single();

      console.log('User role check result:', { user, userError });

      if (userError) {
        console.error('Error checking user role:', userError);
        setError('Error verifying user permissions');
        setLoading(false);
        return;
      }

      if (!user || user.role_id !== 3) {
        console.warn('Access denied - Role ID:', user?.role_id);
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // Then attempt authentication
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        setError(authError.message);
        return;
      }

      console.log('Login successful for admin user:', user);
      navigate('/Maps');

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(Login-bg-modern-jeep.jpg)', filter: 'blur(4px)' }}
      ></div>

      {/* Login Form Container */}
      <div className="flex justify-center items-center h-full relative z-10">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
          <h2 className="text-center text-2xl font-semibold mb-4">Admin</h2>

          {/* Error Message */}
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-sky-400 text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
