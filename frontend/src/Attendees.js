import React, { useEffect, useState } from 'react';

import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import Fuse from 'fuse.js';

const Attendees = ({ checkIn }) => {
  const [allAttendees, setAllAttendees] = useState([])
  const [fuse, setFuse] = useState();

  const [attendees, setAttendees] = useState([]);
  const [n, setN] = useState(0);
  const [d, setD] = useState(0);
  const [search, setSearch] = useState("");
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

    const date = new Date().toJSON().slice(0, 10);
    const uri = `${process.env.REACT_APP_API_URI}/attendees/${date}`;

    fetch(uri)
      .then(r => r.json())
      .then(setAllAttendees);
  }, []);

  useEffect(() => {
    setFuse(new Fuse(allAttendees, { keys: ["name", "email", "type"] }));

    setAttendees(allAttendees);
    setN(allAttendees.reduce((a, v) => a + (v.checked_in > 0), 0));
    setD(allAttendees.length);
  }, [allAttendees]);

  useEffect(() => {
    const attendees = !search
      ? allAttendees // Object.values(allAttendees)
      : fuse.search(search).map(r => r.item);

    let f = [];
    if (checkCheckedIn) {
      f = checkNotCheckedIn ? attendees : attendees.filter(i => i.checked_in > 0);
    } else if (checkNotCheckedIn) {
      f = attendees.filter(i => i.checked_in === 0);
    }

    setAttendees(f);
  }, [search, checkCheckedIn, checkNotCheckedIn, allAttendees, fuse]);

  const handleSearch = (s) => {
    setSearch(s);
  }
  const handleCheckCheckedIn = () => {
    setCheckCheckedIn(!checkCheckedIn);
  }
  const handleCheckNotCheckedIn = () => {
    setCheckNotCheckedIn(!checkNotCheckedIn);
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

      <ul className="fa-ul">
        {
          attendees.map(a => (
            <li className="attendee" key={a.id} onClick={() => checkIn(a.id)}>
              <span className="fa-li"><FontAwesomeIcon icon={a.checked_in > 0 ? faCheck : faXmark} /></span>
              <strong>{a.name}</strong> <i>{a.email}</i>
            </li>
          ))
        }
      </ul>
    </>
  );
}

export default Attendees;