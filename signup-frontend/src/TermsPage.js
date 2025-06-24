// src/TermsPage.js
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Import Link
import FilmStripFrame from './components/Filmstrip';
function TermsPage() {
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(to right, #141e30, #243b55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
        padding: '20px',
        color: '#fff'
    };

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: 'none',
        width: '100%',
        maxWidth: '600px',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        color: '#fff',
        textAlign: 'justify',
        lineHeight: '1.6',
        display: 'flex', // Use flexbox for easy centering of the button
        flexDirection: 'column', // Stack content vertically
        justifyContent: 'space-between', // Push button to bottom
    };

    const titleStyle = {
        marginBottom: '20px',
        color: '#f5c518',
        textAlign: 'center'
    };

    const paragraphStyle = {
        marginBottom: '15px'
    };

    const backLinkStyle = {
        marginTop: '30px', // Add some space above the link
        textAlign: 'center', // Center the link itself
    };

    const backButtonStyle = {
        backgroundColor: '#f5c518', // Same as your submit button for consistency
        border: 'none',
        color: '#000',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        textDecoration: 'none', // Important for Link component
        fontSize: '1rem',
        fontWeight: '600',
        display: 'inline-block', // Make it behave like a block for padding/margin but allow centering
        transition: 'background-color 0.3s ease', // Smooth transition for hover
    };

    return (
        <div style={containerStyle}>
            <FilmStripFrame>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={cardStyle}>
                <div> {/* Content Wrapper for text */}
                    <h2 style={titleStyle}>Terms and Conditions</h2>
                    <p style={paragraphStyle}>
                        Welcome to FILMROLL! These terms and conditions outline the rules and regulations for the use of FILMROLL's Website, located at your-website-url.com.
                    </p>
                    <p style={paragraphStyle}>
                        By accessing this website we assume you accept these terms and conditions. Do not continue to use FILMROLL if you do not agree to take all of the terms and conditions stated on this page.
                    </p>
                    <h3 style={{ color: '#f5c518', marginBottom: '10px' }}>License</h3>
                    <p style={paragraphStyle}>
                        Unless otherwise stated, FILMROLL and/or its licensors own the intellectual property rights for all material on FILMROLL. All intellectual property rights are reserved. You may access this from FILMROLL for your own personal use subjected to restrictions set in these terms and conditions.
                    </p>
                    <h3 style={{ color: '#f5c518', marginBottom: '10px' }}>Hyperlinking to our Content</h3>
                    <p style={paragraphStyle}>
                        The following organizations may link to our Website without prior written approval: Government agencies; Search engines; News organizations; Online directory distributors when they list us in the directory may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.
                    </p>
                    <p style={paragraphStyle}>
                        We reserve the right to amend these Terms and Conditions at any time. By continuing to use the Website, you agree to be bound by the updated version of these Terms and Conditions.
                    </p>
                    <p style={paragraphStyle}>
                        For any questions or concerns regarding these terms, please contact us.
                    </p>
                </div>

                {/* Back to Registration Link - placed at the bottom */}
                <div style={backLinkStyle}>
                    <Link to="/signup" style={backButtonStyle}>
  Back to Registration
</Link>

                </div>

            </motion.div>
            </FilmStripFrame>
        </div>
    );
}

export default TermsPage;