import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const QR = () => {
  
  // Calculating time
  let seconds = new Date().getSeconds() * 1000;
  let waitingTime = seconds<=30000?30000-seconds:60000-seconds;
  let refreshTime = 30000;

  const host = "http://192.168.29.73:9000";
  const [QR, updateQR] = useState({ imageURL: "", url: "" });

  const { imageURL, url } = QR;

  const getQR = async () => {
    console.log("here3")
    const response = await fetch(`${host}/api/QR`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    if (json.success) {
      updateQR({ imageURL: json.imgurl, url: json.uriShort });
    }
  };

  useEffect(() => {
    getQR();
    let comInterval;
    setTimeout(()=>{
    getQR();
    comInterval = setInterval(getQR, refreshTime); //This will refresh the data at regularIntervals of refreshTime
    }, waitingTime);
    return () => clearInterval(comInterval); //Clear interval on component unmount to avoid memory leak
  }, [refreshTime, waitingTime])

  return (
    <div className="container">
      <img src={imageURL} width="400px" alt="QRCode"/>
      <Link to={url}>
      <button
        className="btn btn-outline-light max-2"
      >
        Mark Attendence!
      </button>
      </Link>
    </div>
  );
};

export default QR;
