import {GoogleAuthProvider,getAuth,signInWithPopup} from 'firebase/auth';
import {app} from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
export default function OAuth() {
    const dispatch = useDispatch();
    const handleGoogleClick = async () => {
        try {
        const provider = new GoogleAuthProvider();
        const auth=getAuth(app);
        const navigate= useNavigate();

        const result= await signInWithPopup(auth,provider);
        const res=await fetch('http://localhost:4000/api/auth/google',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({ name: result.user.displayName, email: result.user.email,photo: result.user.photoURL }),
        });
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        const data=await res.json();
        dispatch(signInSuccess(data));
        navigate('/')
        } catch (err) {
        console.log('could not sign in with google',err);
        }
    };
  return (
    <button onClick={handleGoogleClick} type="submit" className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95>
    ">Continue with GOOGLE</button>
  )
}
