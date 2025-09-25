import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import {
  useCandidate,
  useCandidateTimeline,
  useUpdateCandidate,
} from "../../hooks/useCandidates";
import { CandidateStage, Note, TimelineEvent } from "../../types";

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 18px rgba(59,130,246,0.18); }
  50% { box-shadow: 0 0 36px rgba(139,92,246,0.32); }
`;

// Layout
const Wrap = styled.div`
  display: grid;
  gap: 28px;
  padding: 48px;
  min-height: 100vh;
  background: linear-gradient(135deg, #dbeafe 0%, #f3e8ff 100%);
  border-radius: 32px;
  box-shadow: inset 0 2px 24px rgba(59, 130, 246, 0.12),
    inset 0 -2px 24px rgba(139, 92, 246, 0.12);
  position: relative;
`;

// Responsive Grid
const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 28px;
  align-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

// Floating Card
const Card = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  border-radius: 24px;
  padding: 28px 24px;
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 28px rgba(59, 130, 246, 0.12),
    0 2px 8px rgba(139, 92, 246, 0.08);
  transition: all 0.25s;
  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 36px rgba(139, 92, 246, 0.18),
      0 4px 14px rgba(59, 130, 246, 0.12);
  }
`;

// Flex row
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

// Stylish select
const Select = styled.select`
  padding: 12px 18px;
  border-radius: 12px;
  border: 1.5px solid rgba(203, 213, 225, 0.8);
  background: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  box-shadow: 0 1px 8px rgba(139, 92, 246, 0.08);
  transition: all 0.2s;
  &:focus {
    border-color: #8b5cf6;
    outline: none;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
  }
`;

// Primary button
const Button = styled.button`
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  border: none;
  padding: 12px 22px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 3px 14px rgba(59, 130, 246, 0.18);
  transition: all 0.25s;
  animation: ${float} 3s infinite;
  &:hover {
    background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%);
    transform: scale(1.05);
    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.28);
  }
`;

// Secondary button
const Secondary = styled.button`
  background: rgba(255, 255, 255, 0.6);
  color: #3b82f6;
  border: 1.5px solid rgba(224, 231, 255, 0.9);
  padding: 9px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
  transition: all 0.25s;
  &:hover {
    background: linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%);
    color: #8b5cf6;
    transform: translateY(-2px);
    box-shadow: 0 3px 12px rgba(139, 92, 246, 0.16);
  }
`;

// Notes box
const NoteBox = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 14px 16px;
  border: 1.5px solid rgba(203, 213, 225, 0.9);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.5;
  box-shadow: 0 1px 6px rgba(139, 92, 246, 0.08);
  transition: all 0.2s;
  &:focus {
    border-color: #8b5cf6;
    outline: none;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.25);
  }
`;

// Timeline item
const TimelineItem = styled.div`
  padding: 14px 0;
  border-top: 1.5px solid #f1f5f9;
  transition: background 0.2s;
  &:hover {
    background: rgba(139, 92, 246, 0.05);
    border-radius: 10px;
    padding-left: 8px;
  }
`;

// Animated heading
const Heading = styled.h1`
  max-width: 20%;
  padding: 12px 0;
  text-align: center;
  justify-content: center;
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  border-radius: 12px;
  border-width: 5px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 18px rgba(59, 130, 246, 0.18);
  ${(props) => css`
    animation: ${glow} 3s infinite;
  `}
`;

const BackLink = styled(Link)`
  color: #8b5cf6;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  margin-bottom: 8px;
  display: inline-block;
  padding: 7px 16px;
  border-radius: 12px;
  transition: all 0.2s;
  &:hover {
    color: #3b82f6;
    transform: scale(1.03);
  }
`;

const stages: CandidateStage[] = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

export default function CandidateProfile() {
  const { id } = useParams();
  const { data: candidate, isLoading } = useCandidate(id || "");
  const { data: timeline } = useCandidateTimeline(id || "");
  const update = useUpdateCandidate();

  const [note, setNote] = useState("");

  const suggestions = useMemo(() => ["@Alex", "@Jamie", "@Pat", "@Taylor"], []);

  if (isLoading) return <div>Loading...</div>;
  if (!candidate)
    return (
      <div>
        Candidate not found. <Link to="/candidates">Back to Candidates</Link>
      </div>
    );

  async function changeStage(next: CandidateStage) {
    await update.mutateAsync({ id: candidate.id, updates: { stage: next } });
  }

  async function addNote() {
    const content = note.trim();
    if (!content) return;
    const mentions = suggestions.filter((s) => content.includes(s));
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      mentions,
      authorId: "me",
      authorName: "You",
      createdAt: new Date(),
    };
    const updatedNotes = [...candidate.notes, newNote];
    await update.mutateAsync({
      id: candidate.id,
      updates: { notes: updatedNotes },
    });
    setNote("");
  }

  return (
    <Wrap>
      <BackLink to="/candidates">← Back to Candidates</BackLink>

      <Heading>{candidate.name}</Heading>

      <div
        style={{
          color: "#475569",
          fontSize: 18,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        {candidate.email}
      </div>

      <Grid>
        {/* Left Card */}
        <Card>
          <Row>
            <div style={{ fontWeight: 600, fontSize: 17 }}>
              <strong>Stage:</strong>{" "}
              <span style={{ textTransform: "capitalize", color: "#3b82f6" }}>
                {candidate.stage}
              </span>
            </div>
            <div>
              <Select
                value={candidate.stage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  changeStage(e.target.value as CandidateStage)
                }
              >
                {stages.map((s: CandidateStage) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </Row>

          {/* Notes */}
          <div style={{ marginTop: 18 }}>
            <strong style={{ fontSize: 18, color: "#3b82f6" }}>Notes</strong>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
              Use @ to mention: {suggestions.join(", ")}
            </div>
            <NoteBox
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              placeholder="Write a note with @mentions..."
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 10,
              }}
            >
              <Secondary onClick={() => setNote("")}>Clear</Secondary>
              <Button onClick={addNote}>Add Note</Button>
            </div>

            {/* Notes List */}
            <div style={{ marginTop: 18 }}>
              {(candidate.notes || [])
                .slice()
                .reverse()
                .map((n: Note) => (
                  <TimelineItem key={n.id}>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 15 }}>{n.content}</div>
                    {n.mentions.length > 0 && (
                      <div style={{ fontSize: 13, color: "#8b5cf6" }}>
                        Mentions: {n.mentions.join(", ")}
                      </div>
                    )}
                  </TimelineItem>
                ))}
            </div>
          </div>
        </Card>

        {/* Right Card - Timeline */}
        <Card>
          <h3
            style={{
              marginTop: 0,
              fontSize: 22,
              fontWeight: 800,
              background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 14,
            }}
          >
            Timeline
          </h3>
          <div>
            {(timeline || []).map((ev: TimelineEvent) => (
              <TimelineItem key={ev.id}>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  {new Date(ev.createdAt).toLocaleString()}
                </div>
                <div style={{ fontSize: 15 }}>{ev.description}</div>
              </TimelineItem>
            ))}
          </div>
        </Card>
      </Grid>
    </Wrap>
  );
}
