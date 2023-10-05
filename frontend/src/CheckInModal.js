import React from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function CheckInModal({ results, handleClose }) {
  return (
    <Modal show={results !== undefined} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{results?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{results?.body}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CheckInModal;