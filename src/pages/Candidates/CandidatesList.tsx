import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Link } from "react-router-dom";
import { useCandidates } from "../../hooks/useCandidates";

import { keyframes } from "styled-components";
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.18); }
  50% { box-shadow: 0 0 40px rgba(139,92,246,0.28); }
`;

const Container = styled.div`
  display: grid;
  gap: 24px;
  padding: 40px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1),
    0 1.5px 0 rgba(139, 92, 246, 0.08);
  position: relative;
`;
const Toolbar = styled.div`
  display: grid;
  grid-template-columns: 1fr 220px 120px;
  gap: 18px;
  margin-bottom: 18px;
  align-items: center;
  background: linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.08);
  padding: 18px 24px;
  position: relative;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 14px 10px;
  }
`;
const Input = styled.input`
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  box-shadow: 0 1px 6px rgba(139, 92, 246, 0.06);
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid #8b5cf6;
    outline: none;
  }
`;
const Select = styled.select`
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  box-shadow: 0 1px 6px rgba(139, 92, 246, 0.06);
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid #8b5cf6;
    outline: none;
  }
`;
const Card = styled.div`
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid #e0e7ff;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1),
    0 1.5px 0 rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(8px);
  position: relative;
  transition: box-shadow 0.2s;
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 160px) minmax(
      0,
      120px
    );
  padding: 12px;
  align-items: center;
  border-top: 1.5px solid #f1f5f9;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 6px rgba(139, 92, 246, 0.06);
  border-radius: 12px;
  margin-bottom: 20px;
  transition: box-shadow 0.2s, background 0.2s, transform 0.2s;
  overflow: hidden;
  & > div {
    min-width: 0;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &:hover {
    background: linear-gradient(90deg, #e0e7ff 0%, #8b5cf6 100%);
  }
`;
const Head = styled(Row)`
  background: linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%);
  border-top: none;
  font-weight: 700;
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.08);
`;

export default function CandidatesList() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<
    "all" | "applied" | "screen" | "tech" | "offer" | "hired" | "rejected"
  >("all");
  const { data } = useCandidates({ search, stage, page: 1, pageSize: 1000 });

  const list = useMemo(() => data?.candidates ?? [], [data]);

  return (
    <Container>
      <h1
        style={{
          margin: "0 0 16px 0",
          fontSize: "2.5rem",
          fontWeight: 900,
          letterSpacing: "1.5px",
          background:
            "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow:
            "0 6px 18px rgba(99, 102, 241, 0.6), 0 3px 8px rgba(37, 99, 235, 0.4)",
          animation: "float 3s ease-in-out infinite",
        }}
      >
        Candidates
      </h1>

      <style>
        {`
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0px); }
  }
`}
      </style>
      <Toolbar>
        <Input
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={stage} onChange={(e) => setStage(e.target.value as any)}>
          <option value="all">All Stages</option>
          <option value="applied">Applied</option>
          <option value="screen">Screen</option>
          <option value="tech">Tech</option>
          <option value="offer">Offer</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </Select>
        <div>{list.length} total</div>
      </Toolbar>

      <Card>
        <Head>
          <div>Name</div>
          <div>Email</div>
          <div>Stage</div>
          <div>Profile</div>
        </Head>
        <div style={{ height: "60vh" }}>
          <AutoSizer>
            {({ height, width }: any) => (
              <List
                height={height}
                width={width}
                itemSize={58}
                itemCount={list.length}
                overscanCount={6}
              >
                {({ index, style }) => {
                  const c = list[index];
                  return (
                    <Row
                      key={c.id}
                      style={{
                        marginBottom: "10px",
                        borderWidth: 3,
                        borderColor: "#e0e7ff",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#3b82f6",
                          fontSize: 17,
                        }}
                      >
                        {c.name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: 16 }}>
                        {c.email}
                      </div>
                      <div
                        style={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          color: "#8b5cf6",
                          fontSize: 15,
                        }}
                      >
                        {c.stage}
                      </div>
                      <div>
                        <Link
                          to={`/candidates/${c.id}`}
                          style={{
                            display: "inline-block",
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#fff",
                            background:
                              "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                            padding: "8px 18px",
                            borderRadius: 10,
                            boxShadow: "0 2px 12px rgba(139,92,246,0.12)",
                            textDecoration: "none",
                            transition: "all 0.2s",
                          }}
                        >
                          Open
                        </Link>
                      </div>
                    </Row>
                  );
                }}
              </List>
            )}
          </AutoSizer>
        </div>
      </Card>
    </Container>
  );
}
