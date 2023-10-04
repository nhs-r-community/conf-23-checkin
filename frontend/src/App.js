import { QrScanner } from '@yudiel/react-qr-scanner';
import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';

import 'bootstrap/dist/css/bootstrap.min.css';

const styles = {
  container: {
    "width": "100%",
    "max-width": "600px",
    "margin": 'auto'
  }
}

function CheckIn({ results, handleClose }) {
  return (
    <>
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
    </>
  );

}

function App() {
  const [results, setResults] = useState();
  const [scanning, setScanning] = useState(true);

  const handleClose = () => {
    setResults(undefined);
    setScanning(true);
  }

  function checkIn(id) {
    setScanning(false);
    if (!scanning) return;
    setResults({ title: "Loading", body: "Please wait" });

    var pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!pattern.test(id)) return;

    const uri = "https://connect.strategyunitwm.nhs.uk/nhsr23/api/checkin/" + id;

    const requestOptions = {
      method: 'POST'
    };

    fetch(uri, requestOptions)
      .then(response => {
        const j = response.json();

        if (!response.ok) {
          j.then(x => setResults({
            title: "Error",
            body: x.error
          }))
        } else {
          j.then(x => setResults({
            title: "Checked In",
            body: <>
              <b>Name</b>: {x.name} <br />
              <b>Email</b>: {x.email} <br />
              <b>Type</b>: {x.type}
            </>
          }))
        }
      });
  }

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  function manualSearch() {
    console.log("manual: ", email)
    setEmail("");
  }

  return (
    <div class="mx-2">
      <h1>Conference Check In</h1>
      <div style={styles.container}>
        <QrScanner
          onDecode={checkIn}
          onError={(error) => console.log(error?.message)}
        />
      </div>
      <CheckIn results={results} handleClose={handleClose} />
      <br />

      <Form.Group>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          <Form.Control
            placeholder="Email"
            aria-label="Email"
            aria-describedby="basic-addon1"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button variant="primary" onClick={manualSearch}>Check-In</Button>
        </InputGroup>
      </Form.Group>

      <Form.Group>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">Name</InputGroup.Text>
          <Form.Control
            placeholder="Name"
            aria-label="Name"
            aria-describedby="basic-addon1"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Button variant="primary" onClick={manualSearch}>Search</Button>
        </InputGroup>
      </Form.Group>
    </div>
  );
}

export default App;
