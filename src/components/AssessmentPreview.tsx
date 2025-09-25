import React, { useMemo, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Assessment, AssessmentSection, Question } from '../types';

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(59,130,246,0.2); }
  50% { text-shadow: 0 0 40px rgba(139,92,246,0.4); }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid #e0e7ff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(139,92,246,0.10), 0 1.5px 0 rgba(59,130,246,0.08);
  backdrop-filter: blur(8px);
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${glow} 2.5s infinite;
`;

const Field = styled.div`
  margin: 12px 0;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  width: 100%;
  font-size: 15px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  transition: border 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border: 1.5px solid #8b5cf6;
    outline: none;
    box-shadow: 0 0 10px rgba(139,92,246,0.3);
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  width: 100%;
  font-size: 15px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  transition: border 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border: 1.5px solid #8b5cf6;
    outline: none;
    box-shadow: 0 0 10px rgba(139,92,246,0.3);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #0ea5e9, #22d3ee);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(14,165,233,0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 6px 18px rgba(14,165,233,0.6);
  }
  &:active {
    transform: scale(0.97);
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

interface Props {
  assessment: Assessment;
  readOnly?: boolean;
  onSubmit?: (answers: Record<string, any>) => Promise<void> | void;
}

export default function AssessmentPreview({ assessment, readOnly, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function isVisible(q: Question, answers: Record<string, any>) {
    if (!q.showIf) return true;
    try {
      return Function('answers', `return ${q.showIf}`)(answers);
    } catch {
      return true;
    }
  }

  const visibleQuestions = useMemo(() => {
    const ids: string[] = [];
    for (const section of assessment.sections) {
      for (const q of section.questions ?? []) {
        if (isVisible(q, answers)) ids.push(q.id);
      }
    }
    return ids;
  }, [assessment, answers]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    for (const section of assessment.sections) {
      for (const q of section.questions ?? []) {
        if (!visibleQuestions.includes(q.id)) continue;
        const val = answers[q.id];
        if (q.required && (val === undefined || val === '' || (Array.isArray(val) && val.length === 0))) {
          errs[q.id] = 'This field is required';
          continue;
        }
        if (q.type === 'numeric') {
          if (val !== undefined && val !== '') {
            const num = Number(val);
            if (isNaN(num)) errs[q.id] = 'Must be a number';
            if ((q as any).min !== undefined && num < (q as any).min) errs[q.id] = `Min ${(q as any).min}`;
            if ((q as any).max !== undefined && num > (q as any).max) errs[q.id] = `Max ${(q as any).max}`;
          }
        }
        if ((q.type === 'short-text' || q.type === 'long-text') && (q as any).maxLength) {
          if (val && String(val).length > (q as any).maxLength) errs[q.id] = `Max length ${(q as any).maxLength}`;
        }
        if (q.type === 'multi-choice') {
          const arr = Array.isArray(val) ? val : [];
          if ((q as any).minSelections && arr.length < (q as any).minSelections) errs[q.id] = `Min ${(q as any).minSelections} selections`;
          if ((q as any).maxSelections && arr.length > (q as any).maxSelections) errs[q.id] = `Max ${(q as any).maxSelections} selections`;
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    if (!onSubmit) return;
    if (!validate()) return;
    await onSubmit(answers);
  }

  useEffect(() => {
    if (assessment?.id) {
      const key = `assessment-preview-${assessment.id}`;
      localStorage.setItem(key, JSON.stringify(answers));
    }
  }, [answers, assessment?.id]);

  useEffect(() => {
    if (assessment?.id) {
      const key = `assessment-preview-${assessment.id}`;
      const local = localStorage.getItem(key);
      if (local) setAnswers(JSON.parse(local));
    }
  }, [assessment?.id]);

  function renderQuestion(q: Question) {
    if (!visibleQuestions.includes(q.id)) return null;
    const err = errors[q.id];

    return (
      <Field key={q.id}>
        <Label htmlFor={q.id}>{q.title} {q.required && <span style={{color:'#ef4444'}}>*</span>}</Label>

        {q.type === 'short-text' && (
          <Input disabled={!!readOnly} value={answers[q.id] || ''}
            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
        )}

        {q.type === 'long-text' && (
          <Textarea disabled={!!readOnly} value={answers[q.id] || ''}
            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
        )}

        {q.type === 'numeric' && (
          <Input type="number" disabled={!!readOnly} value={answers[q.id] ?? ''}
            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
        )}

        {q.type === 'single-choice' && 'options' in q && (
          <Row>
            {q.options.map(opt => (
              <label key={opt} style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input type="radio" name={q.id} disabled={!!readOnly} checked={answers[q.id] === opt}
                  onChange={() => setAnswers({ ...answers, [q.id]: opt })} />
                {opt}
              </label>
            ))}
          </Row>
        )}

        {q.type === 'multi-choice' && 'options' in q && (
          <Row>
            {q.options.map(opt => {
              const arr: string[] = answers[q.id] || [];
              const toggled = arr.includes(opt) ? arr.filter(o => o !== opt) : [...arr, opt];
              return (
                <label key={opt} style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <input type="checkbox" disabled={!!readOnly} checked={arr.includes(opt)}
                    onChange={() => setAnswers({ ...answers, [q.id]: toggled })} />
                  {opt}
                </label>
              );
            })}
          </Row>
        )}

        {q.type === 'file-upload' && (
          <div style={{fontSize:12, color:'#64748b'}}>File upload is a stub in this assignment.</div>
        )}

        {err && <ErrorText>{err}</ErrorText>}
      </Field>
    );
  }

  return (
    <div>
      {assessment.sections.map((s: AssessmentSection, idx: number) => (
        <Card key={s.id}>
          <SectionTitle>{idx+1}. {s.title}</SectionTitle>
          {s.description && <div style={{color:'#6b7280', marginBottom:8}}>{s.description}</div>}
          {(s.questions ?? []).map(q => renderQuestion(q))}
        </Card>
      ))}

      {!readOnly && (
        <div style={{display:'flex', justifyContent:'flex-end'}}>
          <Button onClick={submit}>Submit</Button>
        </div>
      )}
    </div>
  );
}
