import { useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom';

const AdminCreation: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInput = () => {
    if (!name || !username || !email || !password) {
      alert('All fields are required.');
      return false;
    }
    return true;
  };

  const handleAdminSignUp = async () => {
    if (!validateInput()) return;
  
    setLoading(true);
  
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (signUpError) {
        alert(`Error signing up: ${signUpError.message}`);
        setLoading(false);
        return;
      }
  
      const authUserId = data?.user?.id;
  
      const { error: insertError } = await supabase.from('users').insert([
        {
          name,
          username,
          email,
          password, 
          role_id: 3, 
          auth_user_id: authUserId,
        },
      ]);
  
      if (insertError) {
        alert(`Error inserting user into database: ${insertError.message}`);
        setLoading(false);
        return;
      }
  
      alert('Admin user created successfully!');
      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="admin-creation-container ml-9">
      <h1>Create Admin User</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdminSignUp();
        }}
      >
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Admin...' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
};

export default AdminCreation;
