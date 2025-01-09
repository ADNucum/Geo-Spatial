import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState('Save Changes');

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setButtonText('Saving...');

    try {
      if (user) {
        const { data: userSession, error: sessionError } = await supabase.auth.getUser();
        if (sessionError) throw sessionError;

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userSession?.user.email || '',
          password: password,
        });

        if (signInError) {
          setPasswordError('Incorrect password.');
          setIsSubmitting(false);
          setButtonText('Save Changes');
          return;
        }

        const { name, username, email } = formData;
        const { error } = await supabase
          .from('users')
          .update({ name, username, email })
          .eq('auth_user_id', user.auth_user_id);

        if (error) throw error;

        alert('Account details updated successfully');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      setIsSubmitting(false);
      setButtonText('Save Changes');
    }
  };

  return (
    <div className="mt-10 pt-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit Account Details</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
        </div>
        <div>
          <Label htmlFor="password">Current Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your current password"
            required
          />
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {buttonText}
        </Button>
      </form>
    </div>
  );
};

export default Account;
