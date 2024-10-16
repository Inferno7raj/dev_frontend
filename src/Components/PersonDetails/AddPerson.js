import React, { useState, useEffect } from 'react';
import './style.css';

const DetailsForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [savedPersons, setSavedPersons] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({}); // Changed to object to manage errors for each field
  const [editingPersonId, setEditingPersonId] = useState(null);

  useEffect(() => {
    if (tabIndex === 1) {
      fetchSavedData(); // Fetch data when switching to "Saved Persons" tab
    }
  }, [tabIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear the specific error for the field being edited
    setError((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({}); // Reset error message before submitting
    setLoading(true);

    try {
      const method = editingPersonId ? 'PUT' : 'POST';
      const url = editingPersonId
        ? `http://localhost:5096/api/PersonalDetails/${editingPersonId}`
        : 'http://localhost:5096/api/PersonalDetails';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const responseData = await response.json();
        alert(editingPersonId ? 'Details updated successfully' : 'Details submitted successfully');

        // Clear form data and reset state after successful submission
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
        });
        setEditingPersonId(null); // Reset edit mode
        fetchSavedData(); // Refresh the saved persons list
      } else {
        // Handle specific validation errors
        const errorData = await response.json();
        // Check for specific errors and set appropriate messages
        if (errorData.errors && errorData.errors.length) {
          // Assume the first error is the relevant one for this context
          const errorMessage = errorData.errors[0];
          if (errorMessage.includes('Duplicate entry')) {
            setError((prev) => ({
              ...prev,
              phone: 'This phone number is already in use',
            }));
          } else {
            setError((prev) => ({
              ...prev,
              general: errorMessage,
            }));
          }
        }
      }
    } catch (error) {
      setError((prev) => ({
        ...prev,
        general: 'Error: Unable to submit details. Please try again later.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedData = async () => {
    setError({});
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5096/api/PersonalDetails', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSavedPersons(data.data);
        } else {
          setError((prev) => ({ ...prev, general: 'No data found.' }));
        }
      } else {
        const errorData = await response.json();
        setError((prev) => ({
          ...prev,
          general: `Error: ${errorData.message || 'Failed to fetch saved persons'}`,
        }));
      }
    } catch (error) {
      setError((prev) => ({
        ...prev,
        general: 'Error: Unable to fetch saved persons. Please try again later.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (person) => {
    setFormData({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      address: person.address,
      city: person.city,
      state: person.state,
      postalCode: person.postalCode,
    });
    setEditingPersonId(person.id); // Set the person ID being edited
    setTabIndex(0); // Switch to the form tab for editing
  };

  const handleDelete = async (personId) => {
    setError({});
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5096/api/PersonalDetails/${personId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Person deleted successfully');
        fetchSavedData(); // Refresh the saved persons list
      } else {
        const errorData = await response.json();
        setError((prev) => ({
          ...prev,
          general: `Error: ${errorData.message || 'Failed to delete person'}`,
        }));
      }
    } catch (error) {
      setError((prev) => ({
        ...prev,
        general: 'Error: Unable to delete person. Please try again later.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (index) => {
    setTabIndex(index);
  };

  return (
    <div className="form-container">
      <div className="tabs">
        <button onClick={() => handleTabClick(0)}>Person Data</button>
        <button onClick={() => handleTabClick(1)}>Saved Persons</button>
      </div>

      {tabIndex === 0 && (
        <div className="form-content">
          <h2>{editingPersonId ? 'Edit Person' : 'Personal Details'}</h2>
          {error.general && <p className="error-message">{error.general}</p>}
          {loading && <p>Loading...</p>}
          <form onSubmit={handleSubmit}>
            {[
              { label: 'First Name', name: 'firstName', type: 'text' },
              { label: 'Last Name', name: 'lastName', type: 'text' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Phone', name: 'phone', type: 'text' },
              { label: 'Address', name: 'address', type: 'text' },
              { label: 'City', name: 'city', type: 'text' },
              { label: 'State', name: 'state', type: 'text' },
              { label: 'Postal Code', name: 'postalCode', type: 'text' },
            ].map(({ label, name, type }) => (
              <div className="input-group" key={name}>
                <label>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
                {error[name] && <p className="error-message">{error[name]}</p>} {/* Display field-specific error */}
              </div>
            ))}
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : editingPersonId ? 'Update Person' : 'Save Person'}
            </button>
          </form>
        </div>
      )}

      {tabIndex === 1 && (
        <div className="saved-content">
          <h2>Saved Persons</h2>
          {error.general && <p className="error-message">{error.general}</p>}
          {loading && <p>Loading...</p>}
          <ul>
            {savedPersons.length > 0 ? (
              savedPersons.map((person, index) => (
                <li key={person.id}>
                  {index + 1}. {person.firstName} {person.lastName} - {person.email} ({person.phone})
                  <span className="edit-delete-icons">
                    <button onClick={() => handleEdit(person)} className="edit-icon">✏️</button>
                    <button onClick={() => handleDelete(person.id)} className="delete-icon">🗑️</button>
                  </span>
                </li>
              ))
            ) : (
              <li>No saved persons available.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DetailsForm;
