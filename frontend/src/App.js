import { QrScanner } from '@yudiel/react-qr-scanner';
import React, { useState } from 'react';


import 'bootstrap/dist/css/bootstrap.min.css';

import CheckInModal from './CheckInModal';
import ManualCheckin from './ManualCheckin';

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

  return (
    <div className="mx-2">
      <h1>Conference Check In</h1>
      <div style={styles.container}>
        <QrScanner
          onDecode={checkIn}
          onError={(error) => console.log(error?.message)}
        />
      </div>
      <br />
      <ManualCheckin checkIn={checkIn} />

      <CheckInModal results={results} handleClose={handleClose} />
    </div>
  );
}

export default App;
