import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AddFriend() {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSearchResult(null);
    try {
      const res = await fetch(`https://blu-social.onrender.com/api/users/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSearchResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdd = async (targetId) => {
    await fetch('https://blu-social.onrender.com/api/users/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, targetId })
    });
    alert('Friend added successfully!');
    setSearchResult(null);
    setSearchQuery('');
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-2xl shadow-md border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Add an Existing Friend</h2>
      <p className="text-sm text-slate-500 mb-6">Enter your friend's Blu ID, phone number, or email to connect instantly.</p>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <input 
          type="text" 
          placeholder="e.g. @CoderKid99 or email/phone" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button type="submit" className="w-full bg-sky-500 text-white font-semibold py-3 rounded-xl shadow hover:bg-sky-600 transition">
          Find Friend
        </button>
      </form>

      {error && <p className="mt-4 text-xs text-rose-500 font-bold">{error}</p>}

      {searchResult && (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
          <div className="flex items-center space-x-3">
            <img src={searchResult.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h4 className="font-bold text-slate-800">{searchResult.name}</h4>
              <p className="text-xs text-slate-500">{searchResult.bluId}</p>
            </div>
          </div>
          <button onClick={() => handleAdd(searchResult._id)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-emerald-600">
            Add
          </button>
        </div>
      )}
    </div>
  );
}
