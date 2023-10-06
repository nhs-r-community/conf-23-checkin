import React from 'react';

import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import Fuse from 'fuse.js';

class Attendees extends React.Component {
  constructor(props) {
    super(props);

    const fuseOptions = {
      keys: [
        "name",
        "email",
        "type"
      ]
    };

    this.state = {
      attendees: [],
      checkCheckedIn: true,
      checkNotCheckedIn: true,
      search: ""
    };

    const uri = "https://connect.strategyunitwm.nhs.uk/nhsr23/api/attendees/" + "T";
    fetch(uri)
      .then(r => r.json())
      .then(r => {
        this.setState({ attendees: r });;
        this.allAttendees = r;
        this.fuse = new Fuse(r, fuseOptions);
        this.n = r.reduce((a, v) => a + (v.checked_in > 0), 0);
        this.d = r.length;
      });

    this.filterAttendees = this.filterAttendees.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleCheckCheckedIn = this.handleCheckCheckedIn.bind(this);
    this.handleCheckNotCheckedIn = this.handleCheckNotCheckedIn.bind(this);
  }

  handleSearch(s) {
    this.setState({ search: s })
    this.filterAttendees(this.state.checkCheckedIn, this.state.checkNotCheckedIn);
  }

  filterAttendees(a, b) {
    const s = this.state.search;
    const attendees = !s
      ? this.allAttendees
      : this.fuse.search(s).map(r => r.item);

    console.log(this.state.checkCheckedIn, this.state.checkNotCheckedIn);

    let f = [];
    if (a) {
      f = b ? attendees : attendees.filter(i => i.checked_in > 0);
    } else if (b) {
      f = attendees.filter(i => i.checked_in == 0);
    }

    this.setState({ attendees: f });
  };

  handleCheckCheckedIn() {
    const v = !this.state.checkCheckedIn
    this.setState({ checkCheckedIn: v });
    this.filterAttendees(v, this.state.checkNotCheckedIn);
  }
  handleCheckNotCheckedIn() {
    const v = !this.state.checkNotCheckedIn
    this.setState({ checkNotCheckedIn: v });
    this.filterAttendees(this.state.checkCheckedIn, v);
  }


  render() {
    return (<>
      <h2>Attendees List</h2>
      <p>Checked in: {this.n} / {this.d}</p>
      <Form.Group>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">filter attendees</InputGroup.Text>
          <Form.Control
            placeholder="Search"
            aria-label="Search"
            aria-describedby="basic-addon1"
            onChange={e => this.handleSearch(e.target.value)}
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
          checked={this.state.checkCheckedIn}
          onChange={this.handleCheckCheckedIn}
        />
        <Form.Check
          inline
          label="Not-Checked In"
          name="checkedingroup"
          type="checkbox"
          id="notcheckedin"
          checked={this.state.checkNotCheckedIn}
          onChange={this.handleCheckNotCheckedIn}
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
            this.state.attendees.map(a => (
              <tr key={a.id} onClick={() => this.props.checkIn(a.id)}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.type}</td>
                <td><FontAwesomeIcon icon={a.checked_in > 0 ? faCheck : faXmark} /></td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    </>)
  }
}

export default Attendees;