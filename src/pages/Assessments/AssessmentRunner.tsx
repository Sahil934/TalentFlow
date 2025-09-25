import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAssessmentByJob } from '../../hooks/useAssessments';
import AssessmentPreview from '../../components/AssessmentPreview';
import { apiService } from '../../services/api';
import { useCandidatesByJob } from '../../hooks/useCandidatesByJob';

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(59,130,246,0.2); }
  50% { text-shadow: 0 0 40px rgba(139,92,246,0.4); }
`;

const Wrap = styled.div`
  display: grid;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%);
  border-radius: 24px;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin: 0 auto;
  animation: ${glow} 2.5s infinite;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid #e0e7ff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(139,92,246,0.10), 0 1.5px 0 rgba(59,130,246,0.08);
  backdrop-filter: blur(8px);
`;

const Label = styled.label`
  font-weight: 600;
  margin-right: 8px;
  color: #4b5563;
`;

const Select = styled.select`
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: rgba(255,255,255,0.9);
  font-size: 15px;
  box-shadow: 0 1px 6px rgba(139,92,246,0.06);
  transition: border 0.2s, box-shadow 0.2s;
  &:focus {
    border: 1.5px solid #8b5cf6;
    outline: none;
    box-shadow: 0 0 10px rgba(139,92,246,0.4);
  }
`;

function useQueryParam(name: string) {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get(name) || undefined, [search, name]);
}

export default function AssessmentRunner() {
  const jobId = useQueryParam('jobId') || jobIdFromPath();
  const candidateId = useQueryParam('candidateId');
  const { data: candidates, isLoading: loadingCandidates } = useCandidatesByJob(jobId);

  function jobIdFromPath() {
    const match = window.location.pathname.match(/\/assessments\/run\/(.+)$/);
    return match ? match[1] : undefined;
  }

  const { data: assessment } = useAssessmentByJob(jobId);
  const [status, setStatus] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  console.log(answers);
  async function submit(newAnswers: Record<string, any>) {
    if (!assessment || !candidateId) return;
    setAnswers(newAnswers);
    const key = `assessment-response-${assessment.id}-${candidateId}`;
    localStorage.setItem(key, JSON.stringify(newAnswers));
    await apiService.submitAssessmentResponse(assessment.jobId, {
      assessmentId: assessment.id,
      candidateId,
      answers: newAnswers,
      startedAt: new Date(),
      completedAt: new Date(),
    });
    setStatus('Submitted');
  }

  useEffect(() => {
    if (assessment?.id && candidateId) {
      const key = `assessment-response-${assessment.id}-${candidateId}`;
      const local = localStorage.getItem(key);
      if (local) setAnswers(JSON.parse(local));
    }
  }, [assessment?.id, candidateId]);

  if (!jobId) return <div>Missing jobId in URL</div>;
  if (!assessment) return <div>Loading assessment...</div>;

  if (!candidateId) {
    if (loadingCandidates) return <div>Loading candidates...</div>;
    if (!candidates || candidates.length === 0) return <div>No candidates found for this job.</div>;

    return (
      <Wrap>
        <Title>Assessment</Title>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Label htmlFor="candidate-select">Select Candidate:</Label>
            <Select
              id="candidate-select"
              onChange={e => {
                const selected = e.target.value;
                if (selected) {
                  window.location.search = `?candidateId=${selected}`;
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select candidate...</option>
              {candidates.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </Card>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Title>Assessment</Title>
      <Card>
        {status && <div style={{color:'#16a34a', fontWeight:'600'}}>Status: {status}</div>}
        <AssessmentPreview assessment={assessment} onSubmit={submit} />
      </Card>
    </Wrap>
  );
}
