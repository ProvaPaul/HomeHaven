import { useSelector } from "react-redux";
import { useRef,useEffect } from "react";
import { useState } from "react";
import { getStorage, uploadBytesResumable,ref, getDownloadURL } from "firebase/storage";
import {app} from '../firebase';
import { updateUserStart,updateUserFailure,updateUserSuccess,deleteUserFailure,deleteUserStart,deleteUserSuccess,signOutUserFailure,signOutUserStart,signOutUserSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux"; 
export default function Profile() {
  const { currentUser,loading,error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file,setFile] = useState(undefined);
  const [filePerc,setFilePerc] = useState(0);
  const [uploadError,setUploadError] = useState(false);
  const [formData,setFormData] = useState({});
  const [updateSuccess,setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  console.log(formData)
  console.log(file);
  console.log(filePerc);
  console.log(uploadError);

  // firebase storage rules
  // allow read;
  //     allow write: if 
  //     request.resource.size < 2*1024*1024 &&
  //     request.resource.contentType.matches('image/.*')
  useEffect(()=>{
    if(file){
      handleFileUpload(file);
    }
  },[file]);
  const handleFileUpload=(file)=>{
      const storage=getStorage(app);
      const fileName= new Date().getTime()+file.name;
      const storageRef= ref (storage,fileName);
      const uploadTask=uploadBytesResumable(storageRef,file);
      uploadTask.on('state_changed',(snapshot)=>{
        const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
        setFilePerc(Math.round(progress));
      },
      (error)=>{
        setUploadError(true);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>
          setFormData({...formData,avatar:downloadURL})
        );
      }
      );
  
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        dispatch(updateUserStart());
        const res = await fetch(`http://localhost:4000/api/users/update/${currentUser._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
            credentials: 'include', // Ensure cookies are sent with the request
        });
        const data = await res.json();
        if (data.success === false) {
            dispatch(updateUserFailure(data.message));
            return;
        }
        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true);
    } catch (error) {
        dispatch(updateUserFailure(error.message));
    }
};

const handleDeleteUser = async () => {
  try {
    dispatch(deleteUserStart());
    const res = await fetch(`http://localhost:4000/api/users/delete/${currentUser._id}`, { // Use backend port here
      method: 'DELETE',
      credentials: 'include', // Include credentials if cookies are needed
    });
    const data = await res.json();
    if (data.success === false) {
      dispatch(deleteUserFailure(data.message));
      return;
    }
    dispatch(deleteUserSuccess(data));
  } catch (error) {
    dispatch(deleteUserFailure(error.message));
  }
};

const handleSignOut = async () => {
  try {
    dispatch(signOutUserStart());
    const res = await fetch('http://localhost:4000/api/auth/signout', {
      method: 'GET', // Ensure this matches
      credentials: 'include', // Send cookies with the request
    });
        const data = await res.json();
    if (data.success === false) {
      dispatch(deleteUserFailure(data.message));
      return;
    }
    dispatch(deleteUserSuccess(data));
  } catch (error) {
    dispatch(deleteUserFailure(error.message));
  }
}
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile Page</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input onChange={(e)=>setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept="image/*"  />
        <img onClick={()=>fileRef.current.click()} src={formData.avatar||currentUser.avatar} alt="profile" className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2" />
        <p className="text-sm self-center">
    {
    uploadError ? (
      <span className="text-red-700">Upload Error(image must be less than 2 mb)</span>
    ) : filePerc > 0 && filePerc < 100 ? (
      <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
    ) : filePerc === 100 ? (
      <span className="text-green-700">Successfully Uploaded!</span>
    ) : (
      ''
    )
     }
    </p>

        <input type="text" placeholder="username" id="username" onChange={handleChange} defaultValue={currentUser.username} className="border p-3 rounded-lg" />
       <input type="email" placeholder="email" id="email" onChange={handleChange} defaultValue={currentUser.email} className="border p-3 rounded-lg" />
       <input type="password" placeholder="password" onChange={handleChange} defaultValue={currentUser.password} className="border p-3 rounded-lg" />

       <button disabled={loading}  className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-90">
        {
          loading ? 'Loading...' : 'Update'
        }
       </button>
      </form>
      <div className="flex justify-between mt-5">
      <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">Delete Account</span>
      <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign Out</span>
      <p className="text-red-700 mt-5">{error ? error : '' }</p>
      <p className="text-green-700 mt-5">{updateSuccess ? 'user is updated successfully!' : '' }</p>
      </div>
    </div>
  )
}
