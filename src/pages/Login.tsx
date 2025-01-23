import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '@/supabaseClient'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {     
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role_id, email')
        .eq('email', email)
        .single();

      if (userError?.code === 'PGRST116') { 
        setError('Email not found. Please check your email address.');
        setLoading(false);
        return;
      }

      if (userError) {
        console.error('Error checking user:', userError);
        setError('Error verifying user. Please try again.');
        setLoading(false);
        return;
      }

      if (!user || user.role_id !== 3) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Incorrect password. Please try again.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }
      
      navigate('/Maps');

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
    <div 
      className="flex-1 bg-teal-500 flex flex-col justify-center items-center bg-cover bg-center" 
      style={{ backgroundImage: "url('/Login_bg.jpg')" }}
    >

    </div>
      <div className="flex justify-center items-center flex-1 bg-gray-100">
        <div className="max-w-sm w-full">
          <h2 className="text-center text-2xl font-semibold mb-4">Admin</h2>

          {error && <div className="text-red-500 text-center mb-4">{error}</div>}

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

            <div className="mb-6 relative">
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-teal-500 text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
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
