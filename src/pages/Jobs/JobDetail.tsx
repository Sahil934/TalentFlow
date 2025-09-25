import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useJob } from '../../hooks/useJobs';
import { Job } from '../../types';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 16px rgba(59,130,246,0.22); }
  50% { box-shadow: 0 0 32px rgba(139,92,246,0.32); }
`;

// Page wrapper
const Wrap = styled.div`
  display: grid;
  gap: 32px;
  padding: 48px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
  border-radius: 32px;
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
`;

// Card
const Card = styled.div`
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid rgba(224, 231, 255, 0.8);
  border-radius: 24px;
  padding: 32px 28px;
  box-shadow: 0 12px 36px rgba(139, 92, 246, 0.12),
    0 1.5px 0 rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(12px);
  position: relative;
  transition: all 0.25s ease;

  &:hover {
    box-shadow: 0 16px 48px rgba(139, 92, 246, 0.18);
    transform: translateY(-2px) scale(1.01);
  }
`;

// Gradient Tag
const Tag = styled.span`
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 14px;
  margin-right: 10px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
  animation: ${glow} 3s ease-in-out infinite;
`;

// Section Title
const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// Back link
const BackLink = styled(Link)`
  display: inline-block;
  font-weight: 700;
  font-size: 16px;
  color: #3b82f6;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.12);
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(90deg, #e0e7ff, #f3e8ff);
    color: #8b5cf6;
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.2);
  }
`;

// CTA button
const CTAButton = styled(Link)`
  display: inline-block;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  padding: 12px 26px;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  text-decoration: none;
  transition: all 0.25s ease;
  animation: ${float} 4s ease-in-out infinite;

  &:hover {
    transform: translateY(-3px) scale(1.04);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
  }
`;

export default function JobDetail() {
  const { jobId } = useParams();
  const { data: job, isLoading } = useJob(jobId || '');

  if (isLoading) return <div>Loading...</div>;
  if (!job)
    return (
      <div>
        Job not found. <Link to="/jobs">Back to Jobs</Link>
      </div>
    );

  return (
    <Wrap>
      <BackLink to="/jobs">← Back to Jobs</BackLink>

      <h1
        style={{
          margin: 0,
          fontSize: 40,
          fontWeight: 900,
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 30px rgba(59,130,246,0.25)',
        }}
      >
        {job.title}
      </h1>

      <div
        style={{
          color: '#64748b',
          fontSize: 18,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        {job.slug}
      </div>

      <Card>
        <SectionTitle>About this job</SectionTitle>
        <p style={{ fontSize: 17, color: '#334155', marginBottom: 18 }}>
          {job.description || 'No description'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(job.tags as string[]).map((t: string) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Requirements</SectionTitle>
        <ul
          style={{
            fontSize: 16,
            color: '#334155',
            paddingLeft: 20,
            marginBottom: 0,
          }}
        >
          {(job.requirements as string[] || []).map((r: string, i: number) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {r}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle>Assessment</SectionTitle>
        <p style={{ fontSize: 17, color: '#334155', marginBottom: 16 }}>
          Go to Assessments to edit the builder for this job.
        </p>
        <CTAButton to={`/assessments?jobId=${job.id}`}>
          Open Assessment Builder
        </CTAButton>
      </Card>
    </Wrap>
  );
}
