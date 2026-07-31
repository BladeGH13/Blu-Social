import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Discovery() {
  const { user } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connectedPopup, setConnectedPopup] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/users/discover/${user.id}`)
      .then(res => res.json())
      .then(data => setProfiles(data))
      .catch(err => console.error(err));
  }, [user.id]);

  const handleSwipe = async (direction) => {
    const currentProfile = profiles[currentIndex];
    if (direction === 'right' && currentProfile) {
      await fetch('http://localhost:5000/api/users/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, targetId: currentProfile._id })
      });
      setConnectedPopup(true);
      setTimeout(() => setConnectedPopup(false), 2000);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 relative">
      {connectedPopup && (
        <div className="absolute top-10 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg font-bold animate-bounce z-50">
          🎉 You and your new friend connected!
        </div>
      )}

      {currentProfile ? (
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col h-[70vh]">
          <div className="relative flex-1">
            <img src={currentProfile.avatar} alt={currentProfile.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
              <span className="text-xs bg-sky-500 px-2.5 py-1 rounded-full font-semibold">{currentProfile.interest}</span>
            </div>
          </div>
          <div className="p-4 bg-white">
            <p className="text-slate-600 text-sm mb-4">{currentProfile.bio}</p>
            <div className="flex justify-around">
              <button onClick={() => handleSwipe('left')} className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 font-bold border border-rose-200 shadow-md flex items-center justify-center text-xl hover:bg-rose-100">✕</button>
              <button onClick={() => handleSwipe('right')} className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 font-bold border border-emerald-200 shadow-md flex items-center justify-center text-xl hover:bg-emerald-100">✔</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-700">You have seen all nearby friends!</h2>
          <p className="text-slate-500 mt-2">Check back later for new profiles.</p>
        </div>
      )}
    </div>
  );
}