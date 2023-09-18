// import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appNumber, setAppNumber] = useState(null)
  const [examinerName, setExaminerName] = useState(null)
  const [appDate, setAppDate] = useState(null)
  const [appName, setAppName] = useState(null)
  const [inventorName, setInventorName] = useState(null)
  const [mailDate, setMailDate] = useState(null)
  const [allowedClaims, setAllowedClaims] = useState(null)
  const [rejectedClaims, setRejectedClaims] = useState(null)
  const [rejectionType, setRejectionType] = useState(null)

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const fetchData = () => {
    setLoading(true);
    fetch(`https://api.patentsview.org/patents/query?q={"app_number":"${query}"}&f=["assignee_organization","inventor_last_name","inventor_first_name","app_number","examiner_first_name","examiner_last_name", "app_date"]`)
      .then((response) => response.json())
      .then((result) => {
        setData(result);
        setLoading(false);
        setAppNumber(result.patents[0].applications[0].app_number)
        setAppDate(result.patents[0]?.applications[0]?.app_date)
        setExaminerName(`${result.patents[0].examiners[0].examiner_first_name} ${result.patents[0].examiners[0].examiner_last_name}`)
        setInventorName(`${result.patents[0].inventors[0].inventor_first_name} ${result.patents[0].inventors[0].inventor_last_name}`)
        setAppName(result.patents[0].assignees[0].assignee_organization)
      })
      // .then(()=>{
      //   console.log(data.patents[0].applications[0].app_number)
      // })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });

    const formDataAccepted = {
      criteria: `patentApplicationNumber:${query} AND actionTypeCategory:"allowed"`,
      start: 0,
      rows: 100,
    };

    const formDataAcceptedEncoded = Object.keys(formDataAccepted)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(formDataAccepted[key]))
      .join('&');

    fetch('https://developer.uspto.gov/ds-api/oa_rejections/v2/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formDataAcceptedEncoded,
    })
      .then((response) => response.json())
      .then((data) => {
        setMailDate(data.response.docs[0].submissionDate.slice(0,10))
        setAllowedClaims(data.response.docs[0].claimNumberArrayDocument[0])
        console.log(data.response.docs[0].claimNumberArrayDocument[0]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

      const formDataRejected = {
        criteria: `patentApplicationNumber:${query} AND actionTypeCategory:"rejected"`,
        start: 0,
        rows: 100,
      };

      const formDataRejectedEncoded = Object.keys(formDataRejected)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(formDataRejected[key]))
        .join('&');

      fetch('https://developer.uspto.gov/ds-api/oa_rejections/v2/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataRejectedEncoded,
      })
        .then((response) => response.json())
        .then((data) => {
          setRejectedClaims(data.response.docs[0].claimNumberArrayDocument[0])
          setRejectionType(data.response.docs[0].legalSectionCode)
        })
        .catch((error) => {
          console.error('Error:', error);
        });
  };

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Enter your query"
        value={query}
        onChange={handleInputChange}
      />
      <button onClick={fetchData}>Search</button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          <li>Application Number: {appNumber}</li>
          <li>Inventor Name: {inventorName}</li>
          <li>Applicant Name: {appName}</li>
          <li>Application Date: {appDate}</li>
          <li>Examiner Name: {examinerName}</li>
          <li>Mailing Date: {mailDate}</li>
          <li>Allowed Claims: {allowedClaims}</li>
          <li>Rejected Claims: {rejectedClaims}</li>
          <li>Rejection Type: {rejectionType}</li>
        </ul>
      )}
    </div>
  );
}

export default App;
