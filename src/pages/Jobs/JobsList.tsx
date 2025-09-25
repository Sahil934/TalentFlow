import React, { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useJobs, useCreateJob, useUpdateJob, useReorderJobs } from '../../hooks/useJobs';
import { Job } from '../../types';
import Modal from '../../components/Modal';
import { apiService } from '../../services/api';

/* Animations */
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

/* Layout */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(224,231,255,0.9) 0%, rgba(243,232,255,0.9) 100%);
  box-shadow: 0 12px 28px rgba(59,130,246,0.1), inset 0 1px 6px rgba(255,255,255,0.4);
  backdrop-filter: blur(12px);
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
`;

const Title = styled.h1`
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

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

/* Buttons */
const Button = styled.button`
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(59,130,246,0.18);
  transition: all 0.25s ease;
  animation: ${float} 3s ease-in-out infinite;
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 24px rgba(139,92,246,0.25);
  }
`;

const SecondaryButton = styled.button`
  background: rgba(255,255,255,0.7);
  color: #3b82f6;
  border: 1px solid #e0e7ff;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(139,92,246,0.08);
  transition: all 0.2s ease;
  &:hover {
    background: linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%);
    color: #8b5cf6;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 12px rgba(139,92,246,0.15);
  }
`;

/* Toolbar */
const Toolbar = styled.div`
  display: grid;
  grid-template-columns: 1fr 180px 120px 100px;
  gap: 14px;
  background: rgba(255,255,255,0.65);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(139,92,246,0.08);
  padding: 12px 16px;
  backdrop-filter: blur(8px);
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: rgba(255,255,255,0.9);
  font-size: 13px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  transition: border 0.2s, box-shadow 0.2s;
  &:focus {
    border: 1px solid #8b5cf6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
  }
`;

const Select = styled.select`
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: rgba(255,255,255,0.9);
  font-size: 13px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  transition: border 0.2s, box-shadow 0.2s;
  &:focus {
    border: 1px solid #8b5cf6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
  }
`;

/* Table */
const Table = styled.div`
  background: rgba(255,255,255,0.85);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #e0e7ff;
  box-shadow: 0 8px 20px rgba(139,92,246,0.08), inset 0 1px 4px rgba(255,255,255,0.6);
  backdrop-filter: blur(6px);
`;

const Row = styled.div<{ isDragging?: boolean }>`
  display: grid;
  grid-template-columns: 40px 1fr 200px 120px 140px;
  gap: 12px;
  padding: 12px 16px;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  background: ${(p) =>
    p.isDragging
      ? 'linear-gradient(90deg, #e0e7ff 0%, #8b5cf6 100%)'
      : 'rgba(255,255,255,0.95)'};
  box-shadow: ${(p) =>
    p.isDragging
      ? '0 4px 14px rgba(139,92,246,0.2)'
      : 'inset 0 1px 3px rgba(0,0,0,0.04)'};
  opacity: ${(p) => (p.isDragging ? 0.85 : 1)};
  cursor: grab;
  transition: all 0.22s ease;
  font-size: 13px;
  &:hover {
    background: linear-gradient(90deg, #f3f4f6 0%, #fdf4ff 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(139,92,246,0.15);
  }
`;

const HeadRow = styled(Row)`
  background: linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%);
  font-weight: 700;
  cursor: default;
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.05);
`;

/* Tags & Status */
const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(139,92,246,0.12);
  animation: ${float} 3s ease-in-out infinite;
`;

const Status = styled.span<{ status: 'active' | 'archived' }>`
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: ${(p) => (p.status === 'active' ? '#16a34a' : '#b91c1c')};
  background: ${(p) =>
    p.status === 'active'
      ? 'linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%)'
      : 'linear-gradient(90deg, #fee2e2 0%, #fca5a5 100%)'};
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
`;

/* Pager */
const Pager = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 13px;
  color: #64748b;
  padding: 6px 4px;
`;

/* --- Component --- */
function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function JobsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tagQuery, setTagQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);

  const { data, isLoading, isFetching } = useJobs({
    search,
    status,
    page,
    pageSize,
    sort: 'order',
    order: 'asc',
  });
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const reorderJobs = useReorderJobs();

  const filteredTags = useMemo(() => tagQuery.trim().toLowerCase(), [tagQuery]);
  const jobs = useMemo(() => {
    let list = (data?.jobs || []).slice();
    if (filteredTags) {
      list = list.filter((j: Job) =>
        j.tags.some((t) => t.toLowerCase().includes(filteredTags))
      );
    }
    return list;
  }, [data, filteredTags]);

  async function validateUniqueSlug(title: string, currentId?: string) {
    const slug = slugify(title);
    const all = await apiService.getJobs({
      page: 1,
      pageSize: 1000,
      order: 'asc',
      sort: 'order',
      status: 'all',
    });
    const exists = all.jobs.some((j) => j.slug === slug && j.id !== currentId);
    return { ok: !exists, slug };
  }

  function openCreate() {
    setEditing(null);
    setIsModalOpen(true);
  }
  function openEdit(job: Job) {
    setEditing(job);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const statusVal = String(formData.get('status') || 'active') as
      | 'active'
      | 'archived';
    const tagsVal = String(formData.get('tags') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!title) {
      alert('Title is required');
      return;
    }

    const { ok, slug } = await validateUniqueSlug(title, editing?.id);
    if (!ok) {
      alert('Slug must be unique (derived from title).');
      return;
    }

    if (editing) {
      await updateJob.mutateAsync({
        id: editing.id,
        updates: { title, slug, status: statusVal, tags: tagsVal },
      });
    } else {
      const total = data?.total || 0;
      await createJob.mutateAsync({
        title,
        slug,
        status: statusVal,
        tags: tagsVal,
        order: total + 1,
        description: '',
        requirements: [],
      });
    }
    setIsModalOpen(false);
  }

  async function toggleArchive(job: Job) {
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    await updateJob.mutateAsync({
      id: job.id,
      updates: { status: newStatus },
    });
  }

  // dnd-kit
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !data) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const oldIndex = jobs.findIndex((j: Job) => j.id === activeId);
    const newIndex = jobs.findIndex((j: Job) => j.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    // backend reorder
    const pageStartOrder = data.jobs[0]?.order ?? 1;
    const fromOrder = pageStartOrder + oldIndex;
    const toOrder = pageStartOrder + newIndex;
    const moved = jobs[oldIndex];
    await reorderJobs.mutateAsync({
      id: moved.id,
      reorderData: { fromOrder, toOrder },
    });
  };

  return (
    <Container>
      <Header>
        <Title>Jobs</Title>
        <Actions>
          <SecondaryButton onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </SecondaryButton>
          <SecondaryButton
            onClick={() =>
              setPage((p) => (data && p < data.totalPages ? p + 1 : p))
            }
          >
            Next
          </SecondaryButton>
          <Button onClick={openCreate}>New Job</Button>
        </Actions>
      </Header>

      <Toolbar>
        <Input
          placeholder="Search title or tag"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Input
          placeholder="Filter by tag"
          value={tagQuery}
          onChange={(e) => {
            setTagQuery(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as any);
            setPage(1);
          }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>
        <Select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </Select>
      </Toolbar>

      <Table>
        <HeadRow>
          <div>#</div>
          <div>Title</div>
          <div>Tags</div>
          <div>Status</div>
          <div>Actions</div>
        </HeadRow>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={jobs.map((j: Job) => j.id)}
            strategy={verticalListSortingStrategy}
          >
            {isLoading && <Row>Loading...</Row>}
            {!isLoading &&
              jobs.map((job: Job, index: number) => (
                <SortableRow
                  key={job.id}
                  job={job}
                  index={index}
                  onEdit={openEdit}
                  onArchive={toggleArchive}
                />
              ))}
          </SortableContext>
        </DndContext>
      </Table>

      <Pager>
        <div>
          Page {page} of {data?.totalPages || 1}{' '}
          {isFetching ? '(updating...)' : ''}
        </div>
        <div>Total {data?.total || 0} jobs</div>
      </Pager>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Job' : 'Create Job'}
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gap: 14 }}>
            <label>
              <div>Title</div>
              <Input name="title" defaultValue={editing?.title || ''} />
            </label>
            <label>
              <div>Status</div>
              <Select name="status" defaultValue={editing?.status || 'active'}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Select>
            </label>
            <label>
              <div>Tags (comma separated)</div>
              <Input name="tags" defaultValue={editing?.tags.join(', ') || ''} />
            </label>
            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
                marginTop: 12,
              }}
            >
              <SecondaryButton
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </SecondaryButton>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      </Modal>
    </Container>
  );
}

// Sortable row
function SortableRow({
  job,
  index,
  onEdit,
  onArchive,
}: {
  job: Job;
  index: number;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Row ref={setNodeRef} style={style} isDragging={isDragging}>
      <div>{job.order}</div>
      <div {...attributes} {...listeners} style={{ cursor: 'grab' }}>
        <div style={{ fontWeight: 600 }}>{job.title}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{job.slug}</div>
      </div>
      <TagsWrapper>
        {job.tags.slice(0, 4).map((t: string) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </TagsWrapper>
      <div>
        <Status status={job.status}>{job.status}</Status>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <SecondaryButton
          onClick={(e) => {
            e.stopPropagation();
            onEdit(job);
          }}
        >
          Edit
        </SecondaryButton>
        <SecondaryButton
          onClick={(e) => {
            e.stopPropagation();
            onArchive(job);
          }}
        >
          {job.status === 'active' ? 'Archive' : 'Unarchive'}
        </SecondaryButton>
      </div>
    </Row>
  );
}
