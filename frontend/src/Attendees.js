import React, { useEffect, useState } from 'react';

import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import Fuse from 'fuse.js';

const Attendees = ({ checkIn }) => {
  const [allAttendees, setAllAttendees] = useState([])
  const [fuse, setFuse] = useState();

  const [attendees, setAttendees] = useState([]);
  const [n, setN] = useState(0);
  const [d, setD] = useState(0);
  const [search, setSearch] = useState([]);
  const [checkCheckedIn, setCheckCheckedIn] = useState(true);
  const [checkNotCheckedIn, setCheckNotCheckedIn] = useState(true);


  useEffect(() => {
    const fuseOptions = {
      keys: [
        "name",
        "email",
        "type"
      ]
    };
    const uri = "https://connect.strategyunitwm.nhs.uk/nhsr23/api/attendees/T";
    fetch(uri)
      .then(r => r.json())
      .then(r => {
        setAllAttendees(r);
        setFuse(new Fuse(r, fuseOptions));

        setAttendees(r);
        setN(r.reduce((a, v) => a + (v.checked_in > 0), 0));
        setD(r.length);
      });

  }, []);

  const handleSearch = (s) => {
    setSearch(s);
    filterAttendees(checkCheckedIn, checkNotCheckedIn);
  }

  const filterAttendees = (a, b) => {
    const s = search;
    const attendees = !s
      ? allAttendees
      : fuse.search(s).map(r => r.item);

    let f = [];
    if (a) {
      f = b ? attendees : attendees.filter(i => i.checked_in > 0);
    } else if (b) {
      f = attendees.filter(i => i.checked_in === 0);
    }

    setAttendees(f);
  };

  const handleCheckCheckedIn = () => {
    const v = !checkCheckedIn
    setCheckCheckedIn(v);
    filterAttendees(v, checkNotCheckedIn);
  }
  const handleCheckNotCheckedIn = () => {
    const v = !checkNotCheckedIn
    setCheckNotCheckedIn(v);
    filterAttendees(checkCheckedIn, v);
  }

  return (
    <>
      <h2>Attendees List</h2>
      <p>Checked in: {n} / {d}</p>
      <Form.Group>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">filter attendees</InputGroup.Text>
          <Form.Control
            placeholder="Search"
            aria-label="Search"
            aria-describedby="basic-addon1"
            onChange={e => handleSearch(e.target.value)}
          />
        </InputGroup>
      </Form.Group>
      <div className="mb-3">
        <Form.Check
          inline
          label="Checked In"
          name="checkedingroup"
          type="checkbox"
          id="checkedin"
          checked={checkCheckedIn}
          onChange={handleCheckCheckedIn}
        />
        <Form.Check
          inline
          label="Not-Checked In"
          name="checkedingroup"
          type="checkbox"
          id="notcheckedin"
          checked={checkNotCheckedIn}
          onChange={handleCheckNotCheckedIn}
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Checked In</th>
          </tr>
        </thead>
        <tbody>
          {
            attendees.map(a => (
              <tr key={a.id} onClick={() => checkIn(a.id)}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.type}</td>
                <td><FontAwesomeIcon icon={a.checked_in > 0 ? faCheck : faXmark} /></td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    </>
  );
}

export default Attendees;