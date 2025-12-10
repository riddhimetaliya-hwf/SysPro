import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/UI/button';
import { Link } from 'react-router-dom';

// Custom SVG logo for Visual Scheduler
const VisualSchedulerLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
    <rect x="4" y="12" width="40" height="24" rx="8" fill="#6366F1"/>
    <rect x="12" y="20" width="24" height="8" rx="4" fill="#A5B4FC"/>
    <circle cx="24" cy="24" r="6" fill="#fff"/>
    <text x="24" y="29" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6366F1">VS</text>
  </svg>
);

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-animated-gradient relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-lime-400 opacity-20 rounded-full blur-3xl animate-bgMove1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600 opacity-20 rounded-full blur-3xl animate-bgMove2" />
      </div>
      {/* Logo */}
      <div className="w-full flex flex-col items-center pt-10 z-10">
        <VisualSchedulerLogo />
        <span className="font-extrabold text-2xl text-gray-900 tracking-tight">Visual Scheduler</span>
      </div>
      {/* Glassmorphic Signup Form */}
      <div className="z-10 flex flex-col items-center justify-center w-full flex-1">
        <form className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl px-8 py-10 w-full max-w-md animate-cardIn">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 tracking-wide animate-fadeIn">Create your account</h2>
          {/* Username */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 text-base font-medium mb-1">Username</label>
            <Input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-transparent border-b-2 border-gray-400 text-gray-900 focus:border-gray-900 focus:ring-0 focus:outline-none w-full py-3 px-2 text-lg transition-all duration-200 animate-inputIn"
              id="username"
              autoComplete="username"
            />
          </div>
          {/* Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 text-base font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-transparent border-b-2 border-gray-400 text-gray-900 focus:border-gray-900 focus:ring-0 focus:outline-none w-full py-3 px-2 text-lg transition-all duration-200 animate-inputIn"
              id="email"
              autoComplete="email"
            />
          </div>
          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-base font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-transparent border-b-2 border-gray-400 text-gray-900 focus:border-gray-900 focus:ring-0 focus:outline-none w-full py-3 px-2 text-lg transition-all duration-200 animate-inputIn"
              id="password"
              autoComplete="new-password"
            />
          </div>
          {/* Confirm Password */}
          <div className="mb-8">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-base font-medium mb-1">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="bg-transparent border-b-2 border-gray-400 text-gray-900 focus:border-gray-900 focus:ring-0 focus:outline-none w-full py-3 px-2 text-lg transition-all duration-200 animate-inputIn"
              id="confirmPassword"
              autoComplete="new-password"
            />
          </div>
          {/* Signup Button */}
          <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105 animate-btnIn text-lg tracking-wide">SIGN UP</Button>
          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-sm text-gray-700">Already have an account? </span>
            <Link to="/login" className="text-gray-900 font-medium hover:underline transition-colors">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 