import React, { useState } from 'react';
import { submitComplaint } from '../../../api/firestoreService';

interface ComplaintFormProps {
    userId: string;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ userId }) => {
    const [game, setGame] = useState('');
    const [complaintType, setComplaintType] = useState('');
    const [description, setDescription] = useState('');
    const [otherComplaintDetails, setOtherComplaintDetails] = useState('');
    const [status, setStatus] = useState('Pending');
    const [submissionStatus, setSubmissionStatus] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const complaintData = complaintType === 'Other'
                ? { userId, game, complaintType, description: `${description} - Details: ${otherComplaintDetails}` }
                : { userId, game, complaintType, description };

            const complaintId = await submitComplaint(
                complaintData.userId,
                complaintData.game,
                complaintData.complaintType,
                complaintData.description
            );
            console.log('Complaint submitted with ID:', complaintId);
            setSubmissionStatus('Complaint submitted successfully!');
        } catch (error) {
            console.error('Error submitting complaint:', error);
            setSubmissionStatus('Failed to submit complaint.');
        }
    };

    return (
        <div className="complaint-form-container">
            <h2>Register Complaint</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="game">Facing Problem in</label>
                    <select
                        id="game"
                        value={game}
                        onChange={(e) => setGame(e.target.value)}
                        required
                    >
                        <option value="">---Select a Problem---</option>
                        <option value="Single Digit Lottery">Single Digit Lottery</option>
                        <option value="Double Digit Lottery">Double Digit Lottery</option>
                        <option value="Triple Digit Lottery">Triple Digit Lottery</option>
                        <option value="Color Ball Game">Color Ball Game</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="complaintType">Complaint Type</label>
                    <select
                        id="complaintType"
                        value={complaintType}
                        onChange={(e) => setComplaintType(e.target.value)}
                        required
                    >
                        <option value="">---Select a complaint type---</option>
                        <option value="Payment">Payment Issue</option>
                        <option value="Technical">Technical Issue</option>
                        <option value="Technical">Game Issue</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {complaintType === 'Other' && (
                    <div className="form-group">
                        <label htmlFor="otherDetails">Other Details</label>
                        <textarea
                            id="otherDetails"
                            value={otherComplaintDetails}
                            maxLength={50}
                            onChange={(e) => setOtherComplaintDetails(e.target.value)}
                            placeholder="Complaint regarding..."
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        maxLength={150}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Submit</button>
                {submissionStatus && <p>{submissionStatus}</p>}
            </form>
        </div>
    );
};

export default ComplaintForm;
