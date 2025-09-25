import React from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 50;
`;

const Panel = styled.div`
  background: #fff; border-radius: 12px; width: 640px; max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden;
`;

const Header = styled.div`
  padding: 16px 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0; font-size: 18px;
`;

const Close = styled.button`
  background: transparent; border: none; font-size: 20px; cursor: pointer;
`;

const Body = styled.div`
  padding: 16px 20px;
`;

interface Props {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, title, onClose, children }: Props) {
  React.useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <Backdrop onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <Close aria-label="Close" onClick={onClose}>×</Close>
        </Header>
        <Body>{children}</Body>
      </Panel>
    </Backdrop>
  );
}
