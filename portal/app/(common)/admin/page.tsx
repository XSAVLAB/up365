'use client'
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/Pages/Admin/Dashboard/Dashboard';
import HeaderMain from '@/components/Pages/Admin/Dashboard/HeaderMain';

export default function page() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        const checkUserStatus = async (currentUser: User) => {
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                const userData = userDoc.data();
                if (userData?.isBlocked) {
                    await signOut(auth);
                    setUser(null);
                    router.push('/login');
                } else {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error('Error checking user status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                checkUserStatus(currentUser);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);
    return (
        // <>
        //     <HeaderMain />
        //     <AdminDashboard />
        // </>

        <>
            {isLoading ? (
                <div className="loading-body">
                    <div className="ring">Loading<span className="loading-span"></span></div>
                </div>
            ) : user && (
                <>
                    <HeaderMain />
                    <AdminDashboard />
                </>
            )}
        </>
    )
}