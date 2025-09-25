import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import JobsList from './pages/Jobs/JobsList';
import JobDetail from './pages/Jobs/JobDetail';
import CandidatesList from './pages/Candidates/CandidatesList';
import CandidateProfile from './pages/Candidates/CandidateProfile';
import CandidatesBoard from './pages/Candidates/CandidatesBoard';
import AssessmentBuilder from './pages/Assessments/AssessmentBuilder';
import AssessmentRunner from './pages/Assessments/AssessmentRunner';
import AssessmentsHome from './pages/Assessments/AssessmentsHome';

/* Animations */
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.7), 0 0 40px rgba(139, 92, 246, 0.5); }
  50% { text-shadow: 0 0 40px rgba(59, 130, 246, 1), 0 0 80px rgba(139, 92, 246, 0.8); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%) scale(0.95); opacity: 0; }
  to { transform: translateX(0) scale(1); opacity: 1; }
`;

/* Global Styles */
const GlobalStyle = createGlobalStyle`
  * { 
    box-sizing: border-box; 
    margin: 0;
    padding: 0;
  }
  
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: radial-gradient(circle at top left, #667eea, #764ba2 50%, #0f172a 100%);
    min-height: 100vh;
    overflow-x: hidden;
    color: #1e293b;
  }

  a { 
    text-decoration: none; 
    color: inherit; 
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
    border-radius: 4px;
    box-shadow: inset 0 0 6px rgba(0,0,0,0.4);
  }
`;

/* Layout */
const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  perspective: 1500px;
`;

/* Sidebar */
const Sidebar = styled.aside`
  width: 280px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(30px);
  border-right: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 8px 0 30px rgba(0, 0, 0, 0.4);
  position: relative;
  animation: ${slideIn} 0.8s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
    pointer-events: none;
    border-right: 2px solid rgba(59, 130, 246, 0.3);
  }
`;

const SidebarContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 32px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

/* Brand */
const Brand = styled.div`
  font-weight: 900;
  font-size: 30px;
  margin-bottom: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${glow} 3s ease-in-out infinite;
  letter-spacing: 1.5px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    border-radius: 4px;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
  }
`;

/* Nav */
const Nav = styled.nav`
  display: grid;
  gap: 14px;
`;

const NavItem = styled(NavLink)`
  max-height: 80px;
  padding: 20px 20px;
  border-radius: 18px;
  color: #cbd5e1;
  font-weight: 500;
  font-size: 25px;
  position: relative;
  transition: all 0.35s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  transform-style: preserve-3d;

  &:hover {
    transform: translateY(-4px) scale(1.05) rotateX(5deg);
    color: #fff;
    box-shadow: 
      0 12px 25px rgba(59, 130, 246, 0.4),
      inset 0 0 20px rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25));
    color: #fff;
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.5);
    border-radius: 40px;
    box-shadow: 
      0 6px 28px rgba(59, 130, 246, 0.4),
      inset 0 1px 4px rgba(255, 255, 255, 0.15);

    &::after {
      content: '';
      position: absolute;
      right: -4px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 40%;
      background: linear-gradient(180deg, #3b82f6, #8b5cf6);
      border-radius: 3px;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.9);
    }
  }
`;

/* Main */
const Main = styled.main`
  flex: 1;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(25px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1), transparent 60%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1), transparent 60%);
    pointer-events: none;
  }
`;

const MainContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 40px;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border-radius: 28px 0 0 0;
  margin: 20px 0 0 0;
  box-shadow: 
    0 0 60px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
`;

/* Floating Decoration */
const FloatingElement = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
  animation: ${float} 6s ease-in-out infinite;
  pointer-events: none;
  filter: blur(6px);

  &:nth-child(1) {
    width: 120px;
    height: 120px;
    top: 12%;
    right: 10%;
    animation-delay: -2s;
  }
  
  &:nth-child(2) {
    width: 80px;
    height: 80px;
    top: 65%;
    right: 25%;
    animation-delay: -4s;
  }
  
  &:nth-child(3) {
    width: 100px;
    height: 100px;
    bottom: 20%;
    right: 8%;
    animation-delay: -1s;
  }
`;

export default function App() {
  return (
    <>
      <GlobalStyle />
      <Shell>
        <Sidebar>
          <SidebarContent>
            <Brand>TalentFlow</Brand>
            <Nav>
              <NavItem to="/jobs">🚀 Jobs</NavItem>
              <NavItem to="/candidates">👥 Candidates</NavItem>
              <NavItem to="/candidates/board">📋 Kanban</NavItem>
              <NavItem to="/assessments">📊 Assessments</NavItem>
            </Nav>
          </SidebarContent>
        </Sidebar>
        
        <Main>
          <FloatingElement />
          <FloatingElement />
          <FloatingElement />
          
          <MainContent>
            <Routes>
              <Route path="/" element={<Navigate to="/jobs" replace />} />
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/jobs/:jobId" element={<JobDetail />} />
              <Route path="/candidates" element={<CandidatesList />} />
              <Route path="/candidates/board" element={<CandidatesBoard />} />
              <Route path="/candidates/:id" element={<CandidateProfile />} />
              <Route path="/assessments" element={<AssessmentsHome />} />
              <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
              <Route path="/assessments/run/:jobId" element={<AssessmentRunner />} />
            </Routes>
          </MainContent>
        </Main>
      </Shell>
    </>
  );
}
