import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Discovery from './pages/Discovery';
import Chats from './pages/Chats';
import AddFriend from './pages/AddFriend';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

function Navigation() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <header className="bg-sky-500 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-black tracking-wider">BLU SOCIAL</h1>
      <nav className="space-x-4 font-semibold flex items-center">
        <Link to="/" className="hover:underline">Discover</Link>
        <Link to="/chats" className="hover:underline">Chats</Link>
        <Link to="/add-friend" className="hover:underline">Add Friend</Link>
        <Link to="/profile" className="hover:underline">Profile</Link>
        <button onClick={logout} className="bg-sky-600 px-3 py-1 rounded-lg text-sm">Logout</button>
      </nav>
    </header>
  );
}

function MainApp() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="flex flex-col h-screen bg-slate-50">
        <Navigation />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Discovery /> : <Navigate to="/auth" />} />
            <Route path="/chats" element={user ? <Chats /> : <Navigate to="/auth" />} />
            <Route path="/add-friend" element={user ? <AddFriend /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}