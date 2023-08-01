import { auth, googleProvider } from '../config/firebase-config.js';
import { createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

export const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.log(error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setPhotoUrl(user.photoURL);
            } else {
                setPhotoUrl('');
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <div>
                <h1>Sign Up</h1>
                <input
                    type="text"
                    placeholder="Email..."
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password..."
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={signIn}>Sign In</button>

                <button onClick={signInWithGoogle}>Sign In With Google</button>
                <button onClick={logout}>Log Out</button>
            </div>
            
        </>
    );
};