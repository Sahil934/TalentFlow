import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCandidates, useUpdateCandidate } from "../../hooks/useCandidates";
import { Candidate, CandidateStage } from "../../types";

/* ==============================
   🎨 3D Animated Heading
   ============================== */
const Heading = styled.h1`
  margin: 0 0 16px 0;
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 6px 18px rgba(99, 102, 241, 0.6),
    0 3px 8px rgba(37, 99, 235, 0.4);
  animation: float 3s ease-in-out infinite;
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-4px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const Container = styled.div`
  display: grid;
  gap: 22px;
  padding: 32px 0 0 0;
  border-radius: 32px;
  background: linear-gradient(135deg, #eef2ff 0%, #f0fdfa 50%, #ecfeff 100%);
  min-height: 100vh;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(230px, 1fr));
  gap: 28px;
  align-items: start;
  padding: 0 28px;
`;

/* ==============================
   📦 Column Styling
   ============================== */
const ColumnDiv = styled.div<{ isOver?: boolean }>`
  background: ${(p) =>
    p.isOver
      ? "linear-gradient(160deg, #dbeafe 0%, #ecfeff 100%)"
      : "linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(240,249,255,0.9) 100%)"};
  border-radius: 20px;
  padding: 20px 16px 16px 16px;
  min-height: 65vh;
  border: 2px solid rgba(59, 130, 246, 0.2);
  box-shadow: inset 0 1.5px 3px rgba(255, 255, 255, 0.6),
    0 10px 25px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(31, 41, 55, 0.06);
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);
  &:hover {
    transform: translateY(-1px) scale(1.005);
    box-shadow: inset 0 1.5px 3px rgba(255, 255, 255, 0.5),
      0 14px 28px rgba(59, 130, 246, 0.18), 0 6px 14px rgba(31, 41, 55, 0.1);
  }
`;

const ColTitle = styled.h3`
  margin: 0 0 14px 0;
  font-size: 17px;
  text-transform: capitalize;
  font-weight: 800;
  display: flex;
  align-items: center;
  color: #1e3a8a;
  letter-spacing: 0.6px;
  text-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
`;

const Counter = styled.span`
  background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  font-size: 13px;
  font-weight: 700;
  border-radius: 9999px;
  padding: 3px 10px;
  margin-left: 8px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
`;

/* ==============================
   🎴 Card Styling
   ============================== */
const CardDiv = styled.div<{ isDragging?: boolean }>`
  background: linear-gradient(120deg, #ffffff 0%, #f0fdfa 100%);
  border: 1.8px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12),
    0 2px 8px rgba(59, 130, 246, 0.1);
  padding: 14px 12px;
  margin-bottom: 14px;
  opacity: ${(p) => (p.isDragging ? 0.65 : 1)};
  cursor: grab;
  transition: all 0.25s ease;
  position: relative;
  z-index: ${(p) => (p.isDragging ? 2 : 1)};
  &:hover {
    transform: translateY(-3px) scale(1.04) rotateX(2deg);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.22),
      0 3px 10px rgba(59, 130, 246, 0.15);
  }
`;

const Name = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e40af;
  margin-bottom: 4px;
  text-shadow: 0 1px 4px rgba(59, 130, 246, 0.2);
`;

const Email = styled.div`
  color: #475569;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
`;

/* ==============================
   🚀 Stages
   ============================== */
const stages: CandidateStage[] = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

export default function CandidatesBoard() {
  const { data } = useCandidates({ page: 1, pageSize: 1000 });
  const update = useUpdateCandidate();

  const [columns, setColumns] = useState<Record<CandidateStage, Candidate[]>>({
    applied: [],
    screen: [],
    tech: [],
    offer: [],
    hired: [],
    rejected: [],
  });

  useEffect(() => {
    const grouped: Record<CandidateStage, Candidate[]> = {
      applied: [],
      screen: [],
      tech: [],
      offer: [],
      hired: [],
      rejected: [],
    };
    (data?.candidates || []).forEach((c: Candidate) => {
      if (stages.includes(c.stage)) grouped[c.stage].push(c);
    });
    setColumns(grouped);
  }, [data]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let fromStage: CandidateStage | null = null;
    let toStage: CandidateStage | null = null;

    for (const stage of stages) {
      if (columns[stage].some((c) => c.id === activeId)) fromStage = stage;
      if (columns[stage].some((c) => c.id === overId) || overId === stage)
        toStage = stage;
    }

    if (fromStage === null || toStage === null) return;

    // ✅ Narrowed to actual CandidateStage
    const fromKey: CandidateStage = fromStage;
    const toKey: CandidateStage = toStage;

    if (fromKey === toKey) {
      setColumns((prev) => {
        const list = [...prev[fromKey]];
        const oldIndex = list.findIndex((c) => c.id === activeId);
        const newIndex = list.findIndex((c) => c.id === overId);
        return { ...prev, [fromKey]: arrayMove(list, oldIndex, newIndex) };
      });
    } else {
      setColumns((prev) => {
        const fromList = prev[fromKey] || [];
        const toList = prev[toKey] || [];
        const moving = fromList.find((c) => c.id === activeId)!;
        return {
          ...prev,
          [fromKey]: fromList.filter((c) => c.id !== activeId),
          [toKey]: [{ ...moving, stage: toKey }, ...toList],
        };
      });
      update.mutate({ id: activeId, updates: { stage: toKey } });
    }
  };

  return (
    <Container>
      <Heading>🧑‍💼 Candidates Kanban</Heading>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Board>
          {stages.map((stage) => (
            <Column key={stage} stage={stage} items={columns[stage]} />
          ))}
        </Board>
      </DndContext>
    </Container>
  );
}

function Column({
  stage,
  items,
}: {
  stage: CandidateStage;
  items: Candidate[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <ColumnDiv ref={setNodeRef} isOver={isOver}>
        <ColTitle>
          {stage} <Counter>{items.length}</Counter>
        </ColTitle>
        {items.map((c) => (
          <SortableCard key={c.id} candidate={c} />
        ))}
      </ColumnDiv>
    </SortableContext>
  );
}

function SortableCard({ candidate }: { candidate: Candidate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: candidate.id });
  const style = { transform: CSS.Transform.toString(transform) };
  return (
    <CardDiv
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      <Name>{candidate.name}</Name>
      <Email>{candidate.email}</Email>
    </CardDiv>
  );
}
