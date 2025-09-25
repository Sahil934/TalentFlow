import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import {
  Assessment,
  AssessmentSection,
  Question,
  QuestionType,
} from "../../types";
import {
  useAssessmentByJob,
  useSaveAssessment,
} from "../../hooks/useAssessments";
import AssessmentPreview from "../../components/AssessmentPreview";

const Wrap = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  align-items: start;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
  transform: perspective(1000px) rotateX(2deg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: perspective(1000px) rotateX(0deg) translateY(-5px);
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.15),
      0 15px 30px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  }
`;

const SectionCard = styled(Card)`
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  margin: 16px 0;
  transform: perspective(1000px) rotateX(1deg);
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);

  &:hover {
    transform: perspective(1000px) rotateX(0deg) translateY(-2px);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Input = styled.input`
  padding: 14px 18px;
  border: 2px solid rgba(203, 213, 225, 0.3);
  border-radius: 12px;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.06),
      0 0 0 4px rgba(102, 126, 234, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: rgba(100, 116, 139, 0.6);
  }
`;

const Textarea = styled.textarea`
  padding: 14px 18px;
  border: 2px solid rgba(203, 213, 225, 0.3);
  border-radius: 12px;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.06),
      0 0 0 4px rgba(102, 126, 234, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: rgba(100, 116, 139, 0.6);
  }
`;

const Select = styled.select`
  padding: 14px 18px;
  border: 2px solid rgba(203, 213, 225, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.06),
      0 0 0 4px rgba(102, 126, 234, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 16px rgba(102, 126, 234, 0.3),
    0 4px 8px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 24px rgba(102, 126, 234, 0.4),
      0 6px 12px rgba(102, 126, 234, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0px);
  }
`;

const Secondary = styled.button`
  background: rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(10px);
  color: #334155;
  border: 1px solid rgba(203, 213, 225, 0.5);
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);

  &:hover {
    background: rgba(241, 245, 249, 0.9);
    border-color: rgba(148, 163, 184, 0.8);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  &:active {
    transform: translateY(0px);
  }
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const QuestionContainer = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(241, 245, 249, 0.8);
  background: rgba(248, 250, 252, 0.5);
  border-radius: 12px;
  margin-top: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(248, 250, 252, 0.8);
    transform: translateX(4px);
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  
  > div {
    color: #475569;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }
`;

const QuestionTypeTag = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
`;

const SectionHeader = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border-left: 4px solid #667eea;
`;

export default function AssessmentBuilder() {
  const { jobId } = useParams();
  const { data } = useAssessmentByJob(jobId);
  const save = useSaveAssessment();

  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    // Try to load from localStorage first
    if (jobId) {
      const local = localStorage.getItem(`assessment-builder-${jobId}`);
      if (local) {
        setAssessment(JSON.parse(local));
        return;
      }
    }
    if (data) {
      // ✅ normalize sections to always have questions
      const normalized: Assessment = {
        ...data,
        sections: data.sections.map((s: AssessmentSection) => ({
          ...s,
          questions: s.questions ?? [],
        })),
      };
      setAssessment(normalized);
    } else if (jobId) {
      setAssessment({
        id: `assessment-${jobId}`,
        jobId,
        title: "New Assessment",
        description: "",
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [data, jobId]);


  if (!jobId) return <div>No Job ID found in route.</div>;
  if (!assessment) return <div>Loading assessment...</div>;

  function updateAssessment(updater: (a: Assessment) => Assessment) {
    setAssessment((prev) => {
      const next = prev ? updater(prev) : prev;
      if (next && jobId) {
        localStorage.setItem(`assessment-builder-${jobId}` , JSON.stringify(next));
      }
      return next;
    });
  }

  function addSection() {
    updateAssessment((a) => {
      const s: AssessmentSection = {
        id: crypto.randomUUID(),
        title: "Untitled Section",
        description: "",
        order: a.sections.length + 1,
        questions: [],
      };
      return { ...a, sections: [...a.sections, s] };
    });
  }

  function removeSection(id: string) {
    updateAssessment((a) => ({
      ...a,
      sections: a.sections.filter((s) => s.id !== id),
    }));
  }

  function updateSectionTitle(id: string, title: string) {
    updateAssessment((a) => ({
      ...a,
      sections: a.sections.map((s) => (s.id === id ? { ...s, title } : s)),
    }));
  }

  function updateSectionDescription(id: string, description: string) {
    updateAssessment((a) => ({
      ...a,
      sections: a.sections.map((s) => (s.id === id ? { ...s, description } : s)),
    }));
  }

  function addQuestion(sectionId: string, type: QuestionType) {
    const base: any = {
      id: crypto.randomUUID(),
      type,
      title: "Untitled",
      required: false,
      order: 1,
      showIf: undefined,
    };
    if (type === "single-choice" || type === "multi-choice") {
      base.options = ["Option 1", "Option 2"];
      if (type === "multi-choice") {
        base.minSelections = 1;
        base.maxSelections = 2;
      }
    }
    if (type === "numeric") {
      base.min = 0;
      base.max = 100;
    }
    if (type === "short-text" || type === "long-text") {
      base.maxLength = 100;
    }
    updateAssessment((a) => ({
      ...a,
      sections: a.sections.map((s) =>
        s.id === sectionId ? { ...s, questions: [...s.questions, base] } : s
      ),
    }));
  }

  function removeQuestion(sectionId: string, questionId: string) {
    updateAssessment((a) => ({
      ...a,
      sections: a.sections.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
          : s
      ),
    }));
  }

  function updateQuestion(sectionId: string, questionId: string, updater: (q: Question) => Question) {
    updateAssessment((a) => ({
      ...a,
      sections: a.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId ? updater(q) : q
              ),
            }
          : s
      ),
    }));
  }

  async function saveAll() {
    if (jobId && assessment) {
      localStorage.setItem(`assessment-builder-${jobId}`, JSON.stringify(assessment));
    }
    await save.mutateAsync({ jobId, assessment });
    alert("Assessment saved");
  }

  return (
    <Wrap>
      <Card>
        <Title>Assessment Builder</Title>
        <div style={{ display: "grid", gap: 20 }}>
          <Label>
            <div>Title</div>
            <Input
              value={assessment.title}
              onChange={(e) =>
                updateAssessment((a) => ({ ...a, title: e.target.value }))
              }
            />
          </Label>
          <Label>
            <div>Description</div>
            <Textarea
              value={assessment.description || ""}
              onChange={(e) =>
                updateAssessment((a) => ({ ...a, description: e.target.value }))
              }
            />
          </Label>
          <div>
            <Secondary onClick={addSection}>Add Section</Secondary>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {assessment.sections.map((s, si) => (
              <SectionCard key={s.id}>
                <SectionHeader>
                  <Row>
                    <strong style={{ color: '#475569', fontSize: '16px' }}>Section {si + 1}</strong>
                    <Secondary style={{ marginLeft: "auto" }} onClick={() => removeSection(s.id)}>
                      Remove Section
                    </Secondary>
                  </Row>
                </SectionHeader>
                <Input
                  value={s.title}
                  onChange={(e) => updateSectionTitle(s.id, e.target.value)}
                  placeholder="Section Title"
                />
                <Textarea
                  value={s.description || ""}
                  onChange={(e) => updateSectionDescription(s.id, e.target.value)}
                  placeholder="Section Description"
                  style={{ marginTop: 12 }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Select
                    onChange={(e) =>
                      addQuestion(s.id, e.target.value as QuestionType)
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Add question...
                    </option>
                    <option value="single-choice">Single Choice</option>
                    <option value="multi-choice">Multi Choice</option>
                    <option value="short-text">Short Text</option>
                    <option value="long-text">Long Text</option>
                    <option value="numeric">Numeric</option>
                    <option value="file-upload">File Upload (stub)</option>
                  </Select>
                </div>
                <div style={{ marginTop: 12 }}>
                  {(s.questions ?? []).map((q, qi) => (
                    <QuestionContainer key={q.id}>
                      <Row>
                        <QuestionTypeTag>
                          {q.type}
                        </QuestionTypeTag>
                        <label style={{ marginLeft: "auto", display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) =>
                              updateQuestion(s.id, q.id, (qq) => ({ ...qq, required: e.target.checked }))
                            }
                            style={{ transform: 'scale(1.2)' }}
                          />
                          Required
                        </label>
                        <Secondary onClick={() => removeQuestion(s.id, q.id)}>
                          Remove
                        </Secondary>
                      </Row>
                      <Input
                        value={q.title}
                        onChange={(e) =>
                          updateQuestion(s.id, q.id, (qq) => ({ ...qq, title: e.target.value }))
                        }
                        placeholder="Question Title"
                        style={{ marginTop: 12 }}
                      />
                      {/* Advanced settings for each question type */}
                      {(q.type === "single-choice" || q.type === "multi-choice") && "options" in q ? (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Options:</div>
                          {(q.options ?? []).map((opt: string, oi: number) => (
                            <Row key={oi} style={{ marginBottom: '8px' }}>
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  if (!("options" in q)) return;
                                  const newOpts = [...q.options];
                                  newOpts[oi] = e.target.value;
                                  updateQuestion(s.id, q.id, (qq) => {
                                    if (!("options" in qq)) return qq;
                                    return { ...qq, options: newOpts };
                                  });
                                }}
                                style={{ width: "80%" }}
                              />
                              <Secondary onClick={() => {
                                if (!("options" in q)) return;
                                const newOpts = q.options.filter((_: any, idx: number) => idx !== oi);
                                updateQuestion(s.id, q.id, (qq) => {
                                  if (!("options" in qq)) return qq;
                                  return { ...qq, options: newOpts };
                                });
                              }}>Remove</Secondary>
                            </Row>
                          ))}
                          <Secondary onClick={() => {
                            updateQuestion(s.id, q.id, (qq) => {
                              if (!("options" in qq)) return qq;
                              return { ...qq, options: [...(qq.options ?? []), "New Option"] };
                            });
                          }}>Add Option</Secondary>
                          {q.type === "multi-choice" && (
                            <Row style={{ marginTop: '12px' }}>
                              <Input
                                type="number"
                                value={"minSelections" in q ? q.minSelections ?? 1 : 1}
                                onChange={e => updateQuestion(s.id, q.id, qq => {
                                  if (!("minSelections" in qq)) return qq;
                                  return { ...qq, minSelections: Number(e.target.value) };
                                })}
                                style={{ width: 80 }}
                                placeholder="Min selections"
                              />
                              <Input
                                type="number"
                                value={"maxSelections" in q ? q.maxSelections ?? 2 : 2}
                                onChange={e => updateQuestion(s.id, q.id, qq => {
                                  if (!("maxSelections" in qq)) return qq;
                                  return { ...qq, maxSelections: Number(e.target.value) };
                                })}
                                style={{ width: 80 }}
                                placeholder="Max selections"
                              />
                            </Row>
                          )}
                        </div>
                      ) : null}
                      {q.type === "numeric" ? (
                        <Row style={{ marginTop: 12 }}>
                          <Input
                            type="number"
                            value={q.min ?? 0}
                            onChange={e => updateQuestion(s.id, q.id, qq => ({ ...qq, min: Number(e.target.value) }))}
                            style={{ width: 80 }}
                            placeholder="Min"
                          />
                          <Input
                            type="number"
                            value={q.max ?? 100}
                            onChange={e => updateQuestion(s.id, q.id, qq => ({ ...qq, max: Number(e.target.value) }))}
                            style={{ width: 80 }}
                            placeholder="Max"
                          />
                        </Row>
                      ) : null}
                      {(q.type === "short-text" || q.type === "long-text") ? (
                        <Row style={{ marginTop: 12 }}>
                          <Input
                            type="number"
                            value={q.maxLength ?? 100}
                            onChange={e => updateQuestion(s.id, q.id, qq => ({ ...qq, maxLength: Number(e.target.value) }))}
                            style={{ width: 80 }}
                            placeholder="Max length"
                          />
                        </Row>
                      ) : null}
                      {/* Conditional logic: showIf */}
                      <div style={{ marginTop: 12 }}>
                        <Label>
                          <span style={{ fontSize: 13, fontWeight: '600', color: '#64748b' }}>Show this question only if:</span>
                          <Input
                            value={q.showIf ?? ""}
                            onChange={e => updateQuestion(s.id, q.id, qq => ({ ...qq, showIf: e.target.value }))}
                            placeholder="e.g. Q1 == 'Yes'"
                          />
                          <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}> (use question id and value, e.g. <code style={{ background: 'rgba(102, 126, 234, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Q1 == 'Yes'</code>)</span>
                        </Label>
                      </div>
                    </QuestionContainer>
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: '20px' }}>
            <Button onClick={saveAll}>Save Assessment</Button>
          </div>
        </div>
      </Card>

      <Card>
        <Title>Live Preview</Title>
        <AssessmentPreview
          assessment={assessment}
          onSubmit={undefined}
          readOnly
        />
      </Card>
    </Wrap>
  );
}