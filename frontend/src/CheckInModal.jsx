import React from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function CheckInModal({ results, handleClose, date }) {

  function checkOut() {
    const id = results.id;
    const uri = `${import.meta.env.VITE_API_URI}/attendee/${id}/${date}?time=0`;

    fetch(uri, { method: "POST" })
      .then(() => handleClose());
  }

  return (
    <Modal show={results !== undefined} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{results?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{results?.body}
      </Modal.Body>
      <Modal.Footer className="justify-content-between">
        {
          results?.title !== "Error" && <>
            <Button variant="danger" onClick={checkOut}>
              Uncheck-in
            </Button>
          </>
        }
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CheckInModal;