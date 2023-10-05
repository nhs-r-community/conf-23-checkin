import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

function ManualCheckin({ checkIn }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  function search() {
    setStatus("");
    const uri = "https://connect.strategyunitwm.nhs.uk/nhsr23/api/find_id_by_email/" + email;

    fetch(uri).then(r => r.text().then(r.ok ? checkIn : setStatus));
  }

  return (
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
        <Button variant="primary" onClick={search}>Check-In</Button>
      </InputGroup>
      <p>{status}</p>
    </Form.Group>
  );
}

export default ManualCheckin;
