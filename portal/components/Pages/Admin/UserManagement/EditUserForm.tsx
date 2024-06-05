import React, { useState } from 'react';
import { updateUserDetails } from '../../../../api/firestoreAdminService';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    wallet: number;
    day: string;
    month: string;
    year: string;
    country: string;
    city: string;
    phoneCode: string;
    phoneNumber: string;
    address: string;
}

interface EditUserFormProps {
    user: User;
    onSave: (updatedUser: User) => void;
    onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState<User>({ ...user });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === 'wallet' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await updateUserDetails(user.id, formData);
            onSave(formData);
        } catch (error) {
            console.error("Error updating user details: ", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>

            <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                <div className="w-100">
                    <label className="mb-3">First Name</label>
                    <input
                        className="n11-bg rounded-8"
                        type="text"
                        name="firstName"
                        value={formData.firstName} onChange={handleChange}
                    />
                </div>
                <div className="w-100">
                    <label className="mb-3">Last Name</label>
                    <input
                        className="n11-bg rounded-8"
                        type="text"
                        name="lastName"
                        value={formData.lastName} onChange={handleChange}
                    />
                </div>
            </div>
            <div className="d-flex align-items-center gap-5 gap-md-6 mb-5 flex-wrap flex-md-nowrap">
                <div className="w-100">
                    <label className="mb-3">Date Of Birth</label>
                    <div className="d-flex align-items-center gap-6 w-100">
                        <div className="d-flex n11-bg rounded-8 w-50">
                            <input
                                type="text"
                                name="day"
                                value={formData.day} onChange={handleChange}
                            />
                        </div>
                        <div className="d-flex n11-bg rounded-8 w-50">
                            <input
                                type="text"
                                name="month"
                                value={formData.month} onChange={handleChange}
                            />
                        </div>
                        <div className="d-flex n11-bg rounded-8 w-50">
                            <input
                                type="text"
                                name="year"
                                value={formData.year} onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="w-100">
                    <label className="mb-3">Phone Number</label>
                    <div className="d-flex gap-2">
                        <input
                            className="w-25 n11-bg rounded-8"
                            type="text"
                            name="phoneCode"
                            value={formData.phoneCode} onChange={handleChange}
                        />
                        <input
                            className="n11-bg rounded-8"
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber} onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
            <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                <div className="w-100">
                    <label className="mb-3">Address</label>
                    <input
                        className="n11-bg rounded-8"
                        type="text"
                        name="address"
                        value={formData.address} onChange={handleChange}
                    />
                </div>
            </div>
            <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                <div className="w-100">
                    <label className="mb-3">City / Region</label>
                    <input
                        className="n11-bg rounded-8"
                        type="text"
                        name="city"
                        value={formData.city} onChange={handleChange}
                    />
                </div>
                <div className="w-100">
                    <label className="mb-3">Country</label>
                    <input
                        className="n11-bg rounded-8"
                        type="text"
                        name="country"
                        value={formData.country} onChange={handleChange}
                    />
                </div>

                <div className="w-100">
                    <label className="mb-3">Wallet</label>
                    <input
                        className="n11-bg rounded-8"
                        type="text"
                        name="wallet"
                        value={formData.wallet} onChange={handleChange}
                    />
                </div>
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" onClick={onCancel} className="btn btn-danger">Cancel</button>
        </form>
    );
};

export default EditUserForm;




