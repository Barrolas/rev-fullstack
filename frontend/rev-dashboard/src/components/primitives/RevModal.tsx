import { Modal, type ModalProps } from 'react-bootstrap';

interface RevModalProps extends ModalProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function RevModal({ title, children, footer, ...props }: RevModalProps) {
  return (
    <Modal {...props} centered className="rev-modal">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
}
