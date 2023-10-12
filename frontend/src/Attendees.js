import React, { useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import Fuse from 'fuse.js';

const Attendees = ({ checkIn, date }) => {
  const allAttendees = useRef({});

  const [fuse, setFuse] = useState();

  const [attendees, setAttendees] = useState([]);
  const [search, setSearch] = useState("");
  const [checkCheckedIn, setCheckCheckedIn] = useState(true);
  const [checkNotCheckedIn, setCheckNotCheckedIn] = useState(true);

  const { lastMessage } = useWebSocket(process.env.REACT_APP_WS_URI);

  const getN = () => Object.values(allAttendees.current).reduce(
    (a, v) => a + (v.checked_in > 0), 0
  );
  const getD = () => Object.keys(allAttendees.current).length;

  useEffect(() => {
    if (!lastMessage) return;

    try {
      const { id, checked_in } = JSON.parse(lastMessage.data);

      const v = new Date(checked_in).getTime() / 1000;

      allAttendees.current[id].checked_in = v;
    } catch (e) { }
  }, [lastMessage]);

  useEffect(() => {
    const uri = `${process.env.REACT_APP_API_URI}/attendees/${date}`;

    fetch(uri).then(r => r.json()).then(r => {
      allAttendees.current = Object.fromEntries(r.map(x => [x.id, x]));

      const fuseOptions = {
        keys: ["name", "email", "type"],
        threshold: 0.3,
        ignoreLocation: true
      }
      setFuse(new Fuse(r, fuseOptions));
    });
  }, [date]);

  useEffect(() => {
    const attendees = !search
      ? Object.values(allAttendees.current).sort((a, b) => a.name.localeCompare(b.name))
      : fuse.search(search).map(r => r.item);

    let f = [];
    if (checkCheckedIn) {
      f = checkNotCheckedIn ? attendees : attendees.filter(i => i.checked_in > 0);
    } else if (checkNotCheckedIn) {
      f = attendees.filter(i => i.checked_in === 0);
    }

    setAttendees(f);
  }, [search, checkCheckedIn, checkNotCheckedIn, fuse]);

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
      <p>Checked in: {getN()} / {getD()}</p>
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