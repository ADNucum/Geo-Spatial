import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/BreadCrumbs'; // Custom Breadcrumbs component

type User = {
  auth_user_id: any;
  user_id: number;
  name: string;
  username: string;
  email: string;
};

type FormData = {
  name: string;
  username: string;
  email: string;
};

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState('Save Changes');
  const [activeMenu, setActiveMenu] = useState<'editAccount' | 'changePassword' | 'addOperator' | 'logout'>('editAccount');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [operatorData, setOperatorData] = useState<{
    name: string;
    username: string;
    email: string;
    password: string;
  }>({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userSession, error: sessionError } = await supabase.auth.getUser();
        if (sessionError) throw sessionError;

        if (userSession?.user) {
          const { data, error } = await supabase
            .from('users')
            .select('auth_user_id, user_id, name, username, email')
            .eq('auth_user_id', userSession.user.id)
            .single();

          if (error) throw error;

          if (data) {
            setUser(data);
            setFormData({
              name: data.name,
              username: data.username,
              email: data.email,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setIsChangingPassword(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setPasswordChangeError('Current password is incorrect');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordChangeError('New passwords do not match');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordChangeError(updateError.message);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully');
      
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordChangeError('Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setButtonText('Saving...');

    try {
      if (user) {
        const { name, username, email } = formData;
        const { error } = await supabase
          .from('users')
          .update({ name, username, email })
          .eq('auth_user_id', user.auth_user_id);

        if (error) throw error;

        alert('Account details updated successfully');
        setButtonText('Save Changes');
      }
    } catch (error) {
      console.error('Error updating account:', error);
    } finally {
      setIsSubmitting(false);
      setButtonText('Save Changes');
    }
  };

  const handleAddOperatorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOperatorData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, username, email, password } = operatorData;

    try {
      if (!name || !username || !email || !password) {
        alert('Please fill in all fields');
        return;
      }

      const { error } = await supabase.from('users').insert([
        {
          name,
          username,
          email,
          password, // Password should be hashed in production!
          role_id: 2, // Assuming 2 is the "Operator" role
        },
      ]);

      if (error) throw error;

      alert('Operator added successfully');
      setOperatorData({ name: '', username: '', email: '', password: '' });
    } catch (error) {
      console.error('Error adding operator:', error);
      alert('Failed to add operator');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-300 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold pl-3 pb-6">Account Settings</h3>
        <Button variant="link" onClick={() => setActiveMenu('editAccount')} className="w-full ml-2 mt-2">
          Edit Account Details
        </Button>
        <Button variant="link" onClick={() => setActiveMenu('changePassword')} className="w-full mt-2">
          Change Password
        </Button>
        <Button variant="link" onClick={() => setActiveMenu('addOperator')} className="w-full mt-2">
          Add Operator
        </Button>
        <Button onClick={handleLogout} className="w-[80%] text-center mt-[90%] ml-5 bg-blue-500">
          Logout
        </Button>
      </div>

      <div className="flex-1 ml-8 p-6 overflow-y-auto">
        <Breadcrumbs
          items={[
            { label: 'Account Settings', href: '/account' },
            { label: activeMenu === 'editAccount' ? 'Edit Account Details' : activeMenu === 'changePassword' ? 'Change Password' : 'Add Operator', href: '#' },
          ]}
        />

        {activeMenu === 'editAccount' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Edit Account Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="col-span-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" required />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="Enter your username" required />
                </div>
              </div>
              <div className="w-1/2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-500 w-1/2">
                {buttonText}
              </Button>
            </form>
          </>
        )}

        {activeMenu === 'changePassword' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="w-1/2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" required />
              </div>
              <div className="w-1/2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required />
              </div>
              <div className="w-1/2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
              </div>
              {passwordChangeError && <div className="text-red-600">{passwordChangeError}</div>}
              <Button type="submit" disabled={isChangingPassword} className="bg-blue-500 w-1/2">
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </div>
        )}

        {activeMenu === 'addOperator' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Add Operator</h2>
            <form onSubmit={handleAddOperator} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="col-span-1">
                  <Label htmlFor="operatorName">Name</Label>
                  <Input id="operatorName" name="name" value={operatorData.name} onChange={handleAddOperatorInputChange} placeholder="Enter operator's name" required />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="operatorUsername">Username</Label>
                  <Input id="operatorUsername" name="username" value={operatorData.username} onChange={handleAddOperatorInputChange} placeholder="Enter operator's username" required />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="operatorEmail">Email</Label>
                  <Input id="operatorEmail" name="email" type="email" value={operatorData.email} onChange={handleAddOperatorInputChange} placeholder="Enter operator's email" required />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="operatorPassword">Password</Label>
                  <Input id="operatorPassword" name="password" type="password" value={operatorData.password} onChange={handleAddOperatorInputChange} placeholder="Enter operator's password" required />
                </div>
              </div>
              <Button type="submit" className="bg-blue-500 w-1/2">
                Add Operator
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
