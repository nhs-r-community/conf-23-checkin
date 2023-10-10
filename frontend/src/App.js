import { QrScanner } from '@yudiel/react-qr-scanner';
import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import Button from 'react-bootstrap/Button';
import Attendees from './Attendees';
import CheckInModal from './CheckInModal';

const styles = {
  container: {
    width: "100%",
    maxWidth: "600px",
    margin: 'auto'
  }
}

function App() {
  const [results, setResults] = useState();
  const [scanning, setScanning] = useState(true);
  const [showAttendees, setShowAttendees] = useState(false);

  const handleClose = () => {
    setResults(undefined);
    setScanning(true);
  }

  function qrDetected(qr_data) {
    setScanning(false);
    if (!scanning) return;

    var pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!pattern.test(qr_data)) return;
    checkIn(qr_data);
  }

  function checkIn(id) {
    setResults({ title: "Loading", body: "Please wait" });

    const date = new Date().toJSON().slice(0, 10);
    const uri = `${process.env.REACT_APP_API_URI}/attendee/${id}/${date}`;

    fetch(uri, { method: "POST" })
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

  return (
    <div className="mx-2">
      <h1>Conference Check In</h1>
      {
        !showAttendees && <>
          <div style={styles.container}>
            <QrScanner
              onDecode={qrDetected}
              onError={(error) => console.log(error?.message)}
            />
          </div>
          <br />

          <Button variant="primary" onClick={() => setShowAttendees(true)}>
            Show Attendees
          </Button>

        </>
      }
      {
        showAttendees && <>
          <Button variant="danger" onClick={() => setShowAttendees(false)}>
            Hide Attendees
          </Button>
          <Attendees checkIn={checkIn} />
        </>
      }
      <CheckInModal results={results} handleClose={handleClose} />
    </div>
  );
}

export default App;
