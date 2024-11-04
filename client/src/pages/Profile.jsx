import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";
import { useState } from "react";
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { app } from '../firebase';
import { updateUserStart, updateUserFailure, updateUserSuccess, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserFailure, signOutUserStart, signOutUserSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [uploadError, setUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFilePerc(Math.round(progress));
    },
      (error) => {
        setUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

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
        credentials: 'include',
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
      const res = await fetch(`http://localhost:4000/api/users/delete/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
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
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowListing = async () => {
    try {
      console.log(`Fetching listings for user: ${currentUser._id}`);
      const res = await fetch(`http://localhost:4000/api/users/listings/${currentUser._id}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        console.error("Error:", data.message);
        setShowListingsError(true);
        return;
      }
      console.log("Listings data:", data);
      setShowListingsError(false);
      setUserListings(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setShowListingsError(true);
    }
  };
  
const handleListingDelete = async (id) => {
  try{
    const res=await fetch(`/api/listing/delete/${id}`,{
      method:'DELETE',
      credentials:'include'
    });
    const data=await res.json();
    if(data.success===false){
      console.log("Error deleting listing:", data.message);
      return;
    }
    setUserListings((prev)=> prev.filter((listing)=> listing._id !== id));
  }catch(error){
    console.log("Error deleting listing:", error);
  }
}
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile Page</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept="image/*" />
        <img onClick={() => fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt="profile" className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2" />
        <p className="text-sm self-center">
          {uploadError ? (
            <span className="text-red-700">Upload Error (image must be less than 2 MB)</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Successfully Uploaded!</span>
          ) : (
            ''
          )}
        </p>

        <input type="text" placeholder="username" id="username" onChange={handleChange} defaultValue={currentUser.username} className="border p-3 rounded-lg" />
        <input type="email" placeholder="email" id="email" onChange={handleChange} defaultValue={currentUser.email} className="border p-3 rounded-lg" />
        <input type="password" placeholder="password" onChange={handleChange} defaultValue={currentUser.password} className="border p-3 rounded-lg" />

        <button disabled={loading} className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-90">
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95" to={"/create-listing"}>Create Listing</Link>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">Delete Account</span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign Out</span>
      </div>

      <p className="text-red-700 mt-5">{error ? error : ''}</p>
      <p className="text-green-700 mt-5">{updateSuccess ? 'User is updated successfully!' : ''}</p>
      <button onClick={handleShowListing} className="text-green-800 w-full">Show Listings</button>
      <p className="text-red-700 mt-5">{showListingsError ? 'You can view only your own listings' : ''}</p>

      {
        userListings && userListings.length > 0 &&
        <div className="flex flex-col gap-4">
          <h2 className="text-center mt-7 text-2xl font-semibold">Your Listings</h2>
           {userListings.map((listing) =>
          <div key={listing._id} className="border rounded-lg p-3 flex justify-betwee items-center gap-4">
            <Link to={`/listing/${listing._id}`}>
            <img src={listing.imageUrls[0]} alt="listing" className="object-contain h-16 w-16" />
            </Link>
            <Link className="text-slate-800 font-semibold flex-1 hover:underline truncate" to={`/listing/${listing._id}`}>
            <p >{listing.name}</p></Link>

            <div className="flex flex-col items-center">
  <button onClick={() => handleListingDelete(listing._id)} className="text-red-700 uppercase">Delete</button>
  
  <Link to={`/update-listing/${listing._id}`}>
    <button className="text-green-700 uppercase">Edit</button>
  </Link>
</div>

          </div>
      )}
        </div>       
      }
    </div>
  );
}
