import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login(){
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    <div className="max-w-md mx-auto glass p-6 rounded">
      <h2 className="text-xl font-semibold text-peacock">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <input placeholder="Email" {...register('email',{ required: true })} className="p-2 rounded" />
        {errors.email && <small className="text-red-500">Required</small>}
        <input type="password" placeholder="Password" {...register('password',{ required: true })} className="p-2 rounded" />
        {errors.password && <small className="text-red-500">Required</small>}
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-peacock text-white rounded">Login</button>
          <button type="button" onClick={()=> reset()} className="px-3 py-1 border rounded">Reset</button>
          <Link to="/forgot" className="ml-auto text-sm underline">Forgot password?</Link>
        </div>
      </form>
    </div>
  )
}
