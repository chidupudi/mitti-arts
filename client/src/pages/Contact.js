import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import { Snackbar, Alert } from '@mui/material';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        timestamp: new Date().toISOString()
      });

      setSubmitStatus({
        open: true,
        message: 'Message sent successfully!',
        severity: 'success'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-info">
        <h1>Contact Us</h1>
        <p>
          We're here to help! Whether you have a question, feedback, or just want to say hello, feel free to reach out.
          Our team is ready to assist you in any way we can.
        </p>

        <h2>Our Address:</h2>
        <p>
          Art of Indian pottery (Mittiarts) <br />
          Plot no 3, <br />
          Opp to maisamma temple , <br />
          Near Ramoji Film City , abdullapurmet, Ranga Reddy, <br />
          Telangana, 501505 <br />
        </p>

        <h2>Our Contact Number:</h2>
        <p>7382150250</p>

        <h2>Email Us:</h2>
        <p>mittiarts0@gmail.com</p>

        <h2>Opening Hours:</h2>
        <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
      </div>

      {/* Map Section */}
      <div className="map-container">
        <h2>Find Us On The Map:</h2>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387190.27990233545!2d78.6843889!3d17.3098868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb92627ec4c75d%3A0x62e7b1b75c4e5f6f!2s17.3098868%2C78.6843889!5e0!3m2!1sen!2sin!4v1683971315200!5m2!1sen!2sin"
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map"
        />
      </div>

      {/* Updated Contact Form */}
      <div className="contact-form">
        <h2>Send Us A Message</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name:</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name" 
              required 
            />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email" 
              required 
            />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone Number:</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your Phone Number" 
              required 
            />
          </div>
          <div className="form-field">
            <label htmlFor="message">Message:</label>
            <textarea 
              id="message" 
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message" 
              rows="5" 
              required
            ></textarea>
          </div>
          <div className="form-button">
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      {/* Success/Error Notification */}
      <Snackbar
        open={submitStatus.open}
        autoHideDuration={6000}
        onClose={() => setSubmitStatus({ ...submitStatus, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSubmitStatus({ ...submitStatus, open: false })} 
          severity={submitStatus.severity}
          sx={{ width: '100%' }}
        >
          {submitStatus.message}
        </Alert>
      </Snackbar>

      <style jsx>{`
        /* Contact Us Page */
        .contact-container {
          font-family: 'Arial', sans-serif;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          color: #333;
          background: #f4f4f4;
        }

        .contact-info {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 40px;
          animation: fadeIn 1s ease-out;
        }

        .contact-info h1 {
          font-size: 36px;
          margin-bottom: 10px;
          color: #333;
        }

        .contact-info p {
          font-size: 18px;
          line-height: 1.6;
          color: #555;
        }

        .contact-info h2 {
          font-size: 24px;
          margin-top: 20px;
          color: #333;
        }

        .map-container {
          margin-bottom: 40px;
          animation: fadeIn 1.5s ease-out;
        }

        .map-container h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 15px;
        }

        .contact-form {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          animation: fadeIn 2s ease-out;
        }

        .contact-form h2 {
          font-size: 28px;
          color: #333;
          margin-bottom: 20px;
        }

        .contact-form .form-field {
          margin-bottom: 20px;
        }

        .contact-form label {
          font-size: 18px;
          color: #333;
          display: block;
          margin-bottom: 5px;
        }

        .contact-form input,
        .contact-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }

        .contact-form button {
          background-color: #4CAF50;
          color: white;
          padding: 15px 32px;
          font-size: 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .contact-form button:hover {
          background-color: #45a049;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ContactUs;
