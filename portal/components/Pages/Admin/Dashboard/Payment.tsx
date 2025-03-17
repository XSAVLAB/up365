import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { updateBankDetails, updateUpiID } from "@/api/firestoreAdminService";
import { storage } from "@/firebaseConfig";

export default function Payment() {
    const [message, setMessage] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [bankDetails, setBankDetails] = useState<any | null>(null);
    const deleteExistingQR = async () => {
        const qrCodesRef = ref(storage, 'qr-codes');
        const list = await listAll(qrCodesRef);
        if (list.items.length > 0) {
            const existingFileRef = list.items[0];
            await deleteObject(existingFileRef);
        }
    };

    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, 5000);
    };

    const onDrop = useCallback(async (acceptedFiles: any) => {
        const file = acceptedFiles[0];
        if (file) {
            try {
                await deleteExistingQR();

                const storageRef = ref(storage, `qr-codes/${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                    },
                    (error) => {
                        console.error("Upload failed", error);
                        showMessage("Failed to upload QR code.");
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log("File available at", downloadURL);
                        showMessage("QR code uploaded successfully!");
                        setUploadProgress(null);
                    }
                );
            } catch (error) {
                console.error("Error handling QR code upload", error);
                showMessage("Failed to upload QR code.");
            }
        }
    }, []);

    const handleUpiIDSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const upiID = event.currentTarget.upiID.value;
            await updateUpiID(upiID);
            showMessage("UPI ID updated successfully!");
        } catch (error) {
            console.error("Error updating UPI ID", error);
            showMessage("Failed to update UPI ID.");
        }
    };
    const handleAccDetailsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const formData = new FormData(event.currentTarget);
            const bankName = formData.get("bankName") as string;
            const accountNumber = formData.get("accountNumber") as string;
            const ifscCode = formData.get("ifscCode") as string;

            await updateBankDetails(bankName, accountNumber, ifscCode);
            showMessage("Bank details updated successfully!");
        } catch (error) {
            console.error("Error updating bank details", error);
            showMessage("Failed to update bank details.");
        }
    };


    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="pay_method__paymethod p-4 p-lg-6 p2-bg rounded-8">
            {message && (
                <div className="mt-3 alert alert-success">
                    {message}
                </div>
            )}
            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                <h5 className="n10-color">Update UPI ID</h5>
            </div>
            <div className="pay_method__formarea">
                <form onSubmit={handleUpiIDSubmit}>
                    <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                        <div className="w-100">
                            <input
                                className="n11-bg rounded-8"
                                type="text"
                                name="upiID"
                                placeholder="Enter New UPI ID"
                            />
                        </div>
                    </div>
                    <button className="cmn-btn py-3 px-10" type="submit">
                        Update
                    </button>
                </form>

            </div>
            <hr className="my-6" />
            <div className="pay_method__paymethod-title mb-5 mb-md-6">
                <h5 className="n10-color">Account No. Update</h5>
            </div>
            <div className="pay_method__formarea">
                <form onSubmit={handleAccDetailsSubmit}>
                    <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-5 gap-md-6 mb-5">
                        <div className="w-100">
                            <input
                                className="n11-bg rounded-8"
                                type="text"
                                name="bankName"
                                placeholder="Enter Bank Name"
                            />
                        </div>
                        <div className="w-100">
                            <input
                                className="n11-bg rounded-8"
                                type="text"
                                name="accountNumber"
                                placeholder="Enter Account Number"
                            />
                        </div>
                        <div className="w-100">
                            <input
                                className="n11-bg rounded-8"
                                type="text"
                                name="ifscCode"
                                placeholder="Enter IFSC Code"
                            />
                        </div>
                    </div>
                    <button className="cmn-btn py-3 px-10" type="submit">
                        Update
                    </button>
                </form>

            </div>
            <hr className="my-6" />
            <div className="pay_method__paymethod-title mb-6 mb-md-6">
                <h5 className="n10-color">Upload new QR code</h5>
            </div>
            <div className="pay_method__formarea">
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Drop the QR code here ...</p> :
                            <p>Drag 'n' drop a QR code here, or click to select one</p>
                    }
                </div>
                {uploadProgress !== null && (
                    <div className="mt-3">
                        Upload Progress: {Math.round(uploadProgress)}%
                    </div>
                )}
            </div>
        </div>
    );
}
