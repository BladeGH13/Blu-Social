import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-2xl shadow-md border border-slate-100 text-center">
      <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full mx-auto object-cover mb-4 shadow" />
      <h2 className="text-xl font-bold text-slate-800">{user.name}, {user.age}</h2>
      <p className="text-sm text-sky-500 font-semibold mb-2">Blu ID: {user.bluId}</p>
      <span className="text-xs bg-sky-100 text-sky-600 px-3 py-1 rounded-full font-semibold">{user.interest}</span>
      <p className="text-slate-600 text-sm mt-4">{user.bio}</p>

      <div className="mt-6 text-left bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
        <p className="text-xs text-slate-500"><strong>Email:</strong> {user.email}</p>
        <p className="text-xs text-slate-500"><strong>Safety Shield:</strong> Active (Under-18 Restricted Protection)</p>
      </div>
    </div>
  );
}