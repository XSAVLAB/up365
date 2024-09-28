import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { storage } from "@/firebaseConfig";

export default function UploadScrollerImages() {
    const [message, setMessage] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [imageURLs, setImageURLs] = useState<{ name: string, url: string }[]>([]);

    // Function to display messages temporarily
    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, 5000);
    };

    // Function to handle file uploads
    const onDrop = useCallback(async (acceptedFiles: any) => {
        const uploadTasks = acceptedFiles.map((file: File) => {
            const storageRef = ref(storage, `scroller-images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise<void>((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress((prevProgress) => ({
                            ...prevProgress,
                            [file.name]: progress,
                        }));
                    },
                    (error) => {
                        console.error("Upload failed for", file.name, error);
                        showMessage(`Failed to upload ${file.name}.`);
                        reject(error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log(`File available at ${downloadURL}`);
                        setImageURLs((prevURLs) => [...prevURLs, { name: file.name, url: downloadURL }]); // Ensure file.name is stored correctly
                        setUploadProgress((prevProgress) => {
                            const updatedProgress = { ...prevProgress };
                            delete updatedProgress[file.name];
                            return updatedProgress;
                        });
                        showMessage(`${file.name} uploaded successfully!`);
                        resolve();
                    }
                );
            });
        });

        try {
            await Promise.all(uploadTasks);
        } catch (error) {
            console.error("Error during image uploads", error);
        }
    }, []);

    // Function to delete an image from Firebase storage
    const deleteImage = async (imageName: string) => {
        try {
            const imageRef = ref(storage, `scroller-images/${imageName}`);
            await deleteObject(imageRef);
            setImageURLs((prevURLs) => prevURLs.filter((img) => img.name !== imageName));
            showMessage(`${imageName} deleted successfully!`);
        } catch (error) {
            console.error(`Error deleting image ${imageName}`, error);
            showMessage(`Failed to delete ${imageName}.`);
        }
    };

    // Function to fetch existing images from Firebase storage on component mount
    const fetchImages = async () => {
        const imagesRef = ref(storage, "scroller-images/");
        const imagesList = await listAll(imagesRef);
        const fetchedImageURLs = await Promise.all(
            imagesList.items.map(async (imageRef) => {
                const url = await getDownloadURL(imageRef);
                return { name: imageRef.name, url };
            })
        );
        setImageURLs(fetchedImageURLs);
    };

    // Fetch the images when the component is mounted
    useEffect(() => {
        fetchImages();
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true });

    return (
        <div className="upload-scroller-images p-4 p-lg-6 p2-bg rounded-8">
            {message && (
                <div className="mt-3 alert alert-success">
                    {message}
                </div>
            )}
            <div className="upload-scroller-images__title mb-5 mb-md-6">
                <h5 className="n10-color">Upload Scroller Images</h5>
            </div>
            <div className="upload-scroller-images__formarea">
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Drop the images here ...</p> :
                            <p>Drag 'n' drop multiple images here, or click to select</p>
                    }
                </div>
                {Object.keys(uploadProgress).length > 0 && (
                    <div className="mt-3">
                        {Object.keys(uploadProgress).map((fileName) => (
                            <div key={fileName}>
                                {fileName}: {Math.round(uploadProgress[fileName])}%
                            </div>
                        ))}
                    </div>
                )}
                {imageURLs.length > 0 && (
                    <div className="mt-4">
                        <h5 className="uploaded-images-title">Uploaded Images</h5>
                        <ul className="uploaded-images-list">
                            {imageURLs.map((image, index) => (
                                <li key={index} className="uploaded-image-item">
                                    <div className="uploaded-image-thumbnail">
                                        <img
                                            src={image.url}
                                            alt={`Uploaded ${index + 1}`}
                                            className="thumbnail-image"
                                        />
                                    </div>
                                    <div className="uploaded-image-info">
                                        <a href={image.url} target="_blank" rel="noopener noreferrer" className="uploaded-image-name">
                                            {image.name}
                                        </a>
                                        <button
                                            className="btn btn-sm delete-btn"
                                            onClick={() => deleteImage(image.name)}
                                        >
                                            <i className="fa fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div >
        </div >
    );
}
