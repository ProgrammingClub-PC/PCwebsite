import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./EventPopup.css";

function EventPopup() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    const timer = setTimeout(() => {
      setShow(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setShow(false);

  const handleRegister = () => {
    handleClose();
    navigate("/register");
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg" 
      centered
      className="custom-tech-modal" 
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="modal-title-custom">🚨 Alert: Upcoming Event</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body-custom">
        <div className="event-content">
          <p className="club-name">PROGRAMMING CLUB PRESENTS</p>
          <h2 className="event-title">
            <span className="highlight">#include</span> 5.0
          </h2>
          
          <p className="event-tagline">
            "Kickstart your tech journey! Master the basics of coding and get your first real taste of DSA & Competitive Programming. 🚀💡"
          </p>
          
          <div className="event-details-box">
            <ul>
              <li><span className="icon">📅</span> <strong>Date:</strong> 21 march and 22 march</li>
              <li><span className="icon">⏰</span> <strong>Time:</strong> 9:00 am - 6:00 pm</li>
              <li><span className="icon">📍</span> <strong>Venue:</strong> CSIT Seminar Hall</li>
            </ul>
          </div>
          
         <p className="event-description">
            No prior coding experience? No worries! We will guide you right from scratch. Learn how to build strong logic and to tackle algorithmic problem
            <br/><br/><span style={{ color: "#ff4d4d", fontWeight: "bold" }}>Exciting Prizes & Goodies for top performers! 🎁</span>
          </p>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="modal-footer-custom">
        <Button variant="secondary" className="btn-close-custom" onClick={handleClose}>
          Maybe Later
        </Button>
        <Button className="btn-register-custom" onClick={handleRegister}>
          Register Now 🚀
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EventPopup;