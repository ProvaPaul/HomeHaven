import { Link,useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  // after clicking signup button
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const Navigate=useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try{
    setLoading(true);

    console.log(formData);
    const res=await fetch('/api/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    );
    const data=await res.json();
    if(data.success===false){
      setError(data.message);
      setLoading(false);
      setError(data.message);
      return;
    }
    setLoading(false);
    setError(null);
    Navigate('/signin');

    console.log(data);
    }catch(err){
      setLoading(false);
      console.log(err);
    }
  };
  console.log(formData);
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="username" className="border p-3 rounded-lg" id="username" onClick={handleChange}/>

        <input type="email" placeholder="email" className="border p-3 rounded-lg" id="email" onClick={handleChange}/>

        <input type="password" placeholder="password" className="border p-3 rounded-lg" id="password" onClick={handleChange}/>
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:oacity-80">
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>

        <div className='flex gap-2 mt-5'>
          <p>Already have an Account?</p>
          <Link to={"signin"}> 
          <span className="text-blue-800">Sign In</span>
          </Link>
        </div>
        {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}