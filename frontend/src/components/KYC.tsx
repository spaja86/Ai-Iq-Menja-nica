import { useState } from 'react';
import { api } from '../services/api';

export const KYC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (idDocument) formDataToSend.append('idDocument', idDocument);
      if (proofOfAddress) formDataToSend.append('proofOfAddress', proofOfAddress);
      if (selfie) formDataToSend.append('selfie', selfie);

      await api.submitKYC(formDataToSend);
      setSuccess(true);
      alert('KYC submitted successfully! We will review your application shortly.');
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">KYC Submitted Successfully!</h2>
          <p className="text-gray-600">
            Your KYC application is under review. We'll notify you once it's processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">KYC Verification</h2>
      
      <p className="mb-6 text-gray-600">
        Complete your KYC verification to unlock full trading features and higher withdrawal limits.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First Name</label>
            <input
              type="text"
              name="firstName"
              className="input"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="input"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              className="input"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="label">Nationality</label>
            <input
              type="text"
              name="nationality"
              className="input"
              value={formData.nationality}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <input
            type="text"
            name="address"
            className="input"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">City</label>
            <input
              type="text"
              name="city"
              className="input"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="label">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              className="input"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="label">Country</label>
            <input
              type="text"
              name="country"
              className="input"
              value={formData.country}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
          
          <div className="space-y-4">
            <div>
              <label className="label">ID Document (Passport/Driver's License)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, setIdDocument)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Proof of Address (Utility Bill/Bank Statement)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, setProofOfAddress)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Selfie with ID</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setSelfie)}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Submitting...' : 'Submit KYC Application'}
        </button>
      </form>
    </div>
  );
};
