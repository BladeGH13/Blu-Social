import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Chats() {
  const { user } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/users/connections/${user.id}`)
      .then(res => res.json())
      .then(data => setConnections(data))
      .catch(err => console.error(err));
  }, [user.id]);

  useEffect(() => {
    if (activeChat) {
      fetch(`http://localhost:5000/api/messages/${user.id}/${activeChat._id}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error(err));

      socket.emit('join_chat', [user.id, activeChat._id].sort().join('_'));
    }
  }, [activeChat, user.id]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    };
    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;

    const messageData = {
      sender: user.id,
      recipient: activeChat._id,
      text,
      room: [user.id, activeChat._id].sort().join('_')
    };

    socket.emit('send_message', messageData);
    setText('');
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] bg-white mt-4 rounded-2xl shadow border border-slate-200 grid grid-cols-3 overflow-hidden">
      <div className="border-r border-slate-200 p-4 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Messages</h3>
        <div className="space-y-2">
          {connections.map(friend => (
            <div key={friend._id} onClick={() => setActiveChat(friend)} className={`p-3 rounded-xl cursor-pointer flex items-center space-x-3 ${activeChat?._id === friend._id ? 'bg-sky-100' : 'bg-slate-50 hover:bg-slate-100'}`}>
              <img src={friend.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">{friend.name}</h4>
                <p className="text-xs text-slate-500">{friend.bluId}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-2 flex flex-col justify-between p-4">
        {activeChat ? (
          <>
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img src={activeChat.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                <h4 className="font-bold text-slate-800">{activeChat.name}</h4>
              </div>
              <div className="space-x-2">
                <button onClick={() => alert('Voice calling feature ready')} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold">📞 Call</button>
                <button onClick={() => alert('Video calling feature ready')} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold">📹 Video</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-xs text-sm ${msg.sender === user.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input type="text" placeholder="Type a friendly message..." value={text} onChange={e => setText(e.target.value)} className="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              <button type="submit" className="bg-sky-500 text-white px-5 py-2 rounded-xl font-semibold">Send</button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 font-medium">
            Select a friend to start chatting
          </div>
        )}
      </div>
    </div>
  );
}