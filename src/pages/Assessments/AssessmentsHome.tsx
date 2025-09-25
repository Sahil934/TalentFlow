import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useQuery } from "react-query";
import { Job } from "../../types";
import Modal from "../../components/Modal";
import { apiService } from "../../services/api";

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(14,165,233,0.2); }
  50% { box-shadow: 0 0 40px rgba(14,165,233,0.4); }
`;

const Wrap = styled.div`
  display: grid;
  gap: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
  min-height: 100vh;
  border-radius: 32px;
`;

const Title = styled.h2`
  max-width: 300px;
  padding: 12px 0;
  border-radius: 16px;
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
  animation: ${glow} 2.5s infinite;
  text-align: center;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid rgba(224, 231, 255, 0.4);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1), 0 1.5px 0 rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 32px rgba(139, 92, 246, 0.15),
      0 0 40px rgba(14, 165, 233, 0.2);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6),
      0 0 20px rgba(139, 92, 246, 0.4);
  }

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    background: rgba(59, 130, 246, 0.4);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const JobRow = styled.tr`
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: linear-gradient(90deg, #e0e7ff 0%, #8b5cf6 100%);
    transform: scale(1.01);
  }

  td {
    padding: 12px;
    font-size: 0.95rem;
    color: #1e293b;
  }
`;

const Pagination = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
`;

export default function AssessmentsHome() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery("jobs", async () => {
    return apiService.getJobs({ page: 1, pageSize: 1000 });
  });
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  if (isLoading) return <div>Loading jobs...</div>;
  const jobs: Job[] = data?.jobs || [];

  const totalPages = Math.ceil(jobs.length / pageSize);
  const paginatedJobs = jobs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Wrap>
      <Title>Assessments</Title>

      <Card>
        <h3
          style={{
            marginBottom: 16,
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Jobs
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 10px",
          }}
        >
          <thead>
            <tr style={{ color: "#475569", fontSize: "0.9rem" }}>
              <th style={{ textAlign: "left", padding: "6px 12px" }}>Job Name</th>
              <th style={{ textAlign: "center", padding: "6px 12px" }}>
                Run Assessment
              </th>
              <th style={{ textAlign: "center", padding: "6px 12px" }}>
                Build Assessment
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.map((job) => (
              <JobRow key={job.id}>
                <td>
                  <strong>{job.title}</strong>
                </td>
                <td style={{ textAlign: "center" }}>
                  <Button onClick={() => navigate(`/assessments/run/${job.id}`)}>
                    ▶ Run
                  </Button>
                </td>
                <td style={{ textAlign: "center" }}>
                  <Button onClick={() => navigate(`/assessments/${job.id}`)}>
                    + Build
                  </Button>
                </td>
              </JobRow>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                  No jobs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {jobs.length > pageSize && (
          <Pagination>
            <Button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              ◀ Prev
            </Button>
            <span style={{ color: "#334155" }}>
              Page {page} of {totalPages}
            </span>
            <Button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next ▶
            </Button>
          </Pagination>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Select Job for Assessment">
        <div style={{ display: "grid", gap: 12 }}>
          {paginatedJobs.length === 0 && <div>No jobs available.</div>}
          {paginatedJobs.map((job) => (
            <div
              key={job.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.85)",
                boxShadow: "0 4px 16px rgba(59,130,246,0.2)",
              }}
            >
              <div>
                <strong>{job.title}</strong>
              </div>
              <Button
                onClick={() => {
                  setShowModal(false);
                  navigate(`/assessments/${job.id}`);
                }}
              >
                Select
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </Wrap>
  );
}
