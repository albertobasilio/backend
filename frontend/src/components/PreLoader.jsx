import React from 'react';

const PreLoader = ({ message = "Processando", subtext = "Sabor Inteligente MZ" }) => {
    return (
        <div className="preloader-overlay">
            <div className="processing-loader"></div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="processing-text">{message}</span>
                <span className="processing-subtext">{subtext}</span>
            </div>
            
            <div style={{ position: 'absolute', bottom: '40px', opacity: 0.4 }}>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    DESENVOLVIDO POR MR BETO
                </p>
            </div>
        </div>
    );
};

export default PreLoader;
