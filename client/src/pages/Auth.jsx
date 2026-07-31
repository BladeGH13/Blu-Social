import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', age: '', bluId: '', interest: 'Gaming', bio: ''
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && Number(formData.age) >= 18) {
      setError('Blu Social is strictly for users under 18 years old.');
      return;
    }

    const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black text-center text-sky-500 mb-2">BLU SOCIAL</h2>
        <p className="text-center text-xs text-slate-400 mb-6 font-medium">Safe Friendships for Under 18s Only</p>

        {error && <div className="mb-4 bg-rose-50 text-rose-500 p-3 rounded-xl text-xs font-bold border border-rose-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-3 border rounded-xl text-sm" />
              <div className="flex gap-2">
                <input type="number" placeholder="Age (<18)" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required className="w-1/2 px-4 py-3 border rounded-xl text-sm" />
                <input type="text" placeholder="Blu ID (@username)" value={formData.bluId} onChange={e => setFormData({...formData, bluId: e.target.value})} required className="w-1/2 px-4 py-3 border rounded-xl text-sm" />
              </div>
              <input type="text" placeholder="Phone Number (optional)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border rounded-xl text-sm" />
              <input type="text" placeholder="Primary Interest (e.g., Gaming, Art)" value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})} required className="w-full px-4 py-3 border rounded-xl text-sm" />
            </>
          )}
          <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-3 border rounded-xl text-sm" />
          <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full px-4 py-3 border rounded-xl text-sm" />

          <button type="submit" className="w-full bg-sky-500 text-white font-bold py-3 rounded-xl shadow hover:bg-sky-600 transition">
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </p>
      </div>
    </div>
  );
}