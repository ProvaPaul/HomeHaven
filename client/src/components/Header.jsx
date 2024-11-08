import {FaSearch} from 'react-icons/fa'
import { Link,useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
export default function Header() {
  const {currentUser} = useSelector((state) => state.user)
  console.log(currentUser);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(searchTerm);
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('search', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);

  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get('search');  // Use 'search' here as well
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [window.location.search]);
  
  return (
    <header className="bg-slate-300 shadow-md">
        <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to='/'>
        <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
        <span className="text-slate-500">Home</span>
        <span className="text-slate-500">Haven</span>
        </h1>
        </Link>
           
        <form onSubmit={handleSubmit} className="bg-slate-100 p-3 rounded-lg flex items-center">
            <input type="search" placeholder="Search" className="bg-transparent focus:outline-none w-24 sm:w-64"

            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
             />
          <button className=''> <FaSearch className="text-slate-500" />
          </button>
        </form> 
        <ul className='flex gap-4'>
        <Link to='/home'>
        <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
        </Link>
        <Link to='/about'>
        <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
        </Link>
        <Link to='/profile'>
        { currentUser ? (
          <img className='rounded-full h-7 w-7 object-cover' src={ currentUser.avatar } alt='profile' />
        ):(
          <li className='hidden sm:inline text-slate-700 hover:underline'>Profile</li>
        )}
        </Link>
        
        </ul> 
        </div>
       
    </header>
  )
}
