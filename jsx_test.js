// Quick JSX structure validation test
import React from 'react';

const TestComponent = () => {
  const systemSettings = { delai_attente_minutes: 1440 };
  
  return (
    <div className="parametres">
      <div className="tab-content">
        {true && (
          <div className="remplacements-tab">
            <div className="validation-summary-compact">
              <h4>Test</h4>
              <div className="summary-content">
                <p className="summary-result">
                  Test {(true || true) && 
                    ` | Délai : ${systemSettings.delai_attente_minutes || 1440} min`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal test */}
      {true && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Test modal</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestComponent;