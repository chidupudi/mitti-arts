// src/components/PhonePePayment.js
import React, { useState, useEffect } from 'react';

const PhonePePayment = () => {
    const [amount, setAmount] = useState(10);
    const [merchantOrderId, setMerchantOrderId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Generate a random order ID on component mount
        setMerchantOrderId('ORDER' + Math.floor(Math.random() * 1000000));
        
        // Load PhonePe checkout.js script
        const script = document.createElement('script');
        script.src = 'https://mercury.phonepe.com/web/bundle/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        return () => {
            // Clean up script on unmount
            document.body.removeChild(script);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Call your serverless function
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount, merchantOrderId })
            });
            
            const data = await response.json();
            
            if (data.redirectUrl) {
                // Handle payment in iframe
                setLoading(false);
                
                // Define the callback function
                window.paymentCallback = (response) => {
                    if (response === 'USER_CANCEL') {
                        alert('Payment was cancelled.');
                        window.location.href = '/';
                    } else if (response === 'CONCLUDED') {
                        window.location.href = `/api/payment-status/${merchantOrderId}`;
                    }
                };
                
                // Open the payment page in iframe
                window.PhonePeCheckout.transact({
                    tokenUrl: data.redirectUrl,
                    callback: window.paymentCallback,
                    type: "IFRAME"
                });
            } else {
                alert('Failed to create payment. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="phonepe-payment">
            <div className="header">
                <img 
                    src="https://www.phonepe.com/images/PhonePe-Logo.svg" 
                    alt="PhonePe Logo" 
                    className="phonepe-logo" 
                    style={{ maxWidth: '150px', marginBottom: '20px' }}
                />
                <h1 style={{ marginLeft: '15px' }}>Payment Gateway</h1>
            </div>
            
            <div className="form-container" style={{ 
                border: '1px solid #ddd', 
                padding: '20px',
                borderRadius: '5px',
                marginBottom: '20px'
            }}>
                <h2>Enter Payment Details</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label 
                            htmlFor="amount" 
                            style={{ 
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: 'bold'
                            }}
                        >
                            Amount (₹)
                        </label>
                        <input 
                            type="number" 
                            id="amount"
                            min="1" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '8px',
                                boxSizing: 'border-box',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label 
                            htmlFor="merchantOrderId"
                            style={{ 
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: 'bold'
                            }}
                        >
                            Order ID
                        </label>
                        <input 
                            type="text" 
                            id="merchantOrderId"
                            value={merchantOrderId}
                            onChange={(e) => setMerchantOrderId(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '8px',
                                boxSizing: 'border-box',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    <button 
                        type="submit"
                        style={{
                            backgroundColor: '#5c2d91',
                            color: 'white',
                            padding: '10px 15px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Pay Now
                    </button>
                </form>
            </div>
            
            {loading && (
                <div id="loading" style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p>Processing your payment...</p>
                </div>
            )}
            
            <div id="payment-container">
                {/* Payment iframe will be inserted here */}
            </div>
        </div>
    );
};

export default PhonePePayment;