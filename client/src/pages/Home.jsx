import { useEffect,useState } from "react";
import { Link } from "react-router-dom"
import {Swiper,SwiperSlide} from "swiper/react";
import 'swiper/css/bundle';
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';
import ListingItem from "../components/ListingItem";

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);
  console.log(rentListings);
  useEffect(() => {
    const fetchOfferListings = async () => {
      try{
        const res = await fetch('http://localhost:4000/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
      }
      catch(error){
        console.log(error);
      }
    }
    const fetchSaleListings = async () => {
      try{
        const res = await fetch('http://localhost:4000/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
      }
      catch(error){
        console.log(error);
      }
    }
    const fetchRentListings = async () => {
      try{
        const res = await fetch('http://localhost:4000/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      }
      catch(error){
        console.log(error);
      }
    }
    fetchOfferListings();
    fetchRentListings();
    fetchSaleListings
  }, []);
  return (
    <div>
      {
        // top
        <div className="flex flex-col gap-6 p-28 px-3 mx-auto">
          <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">Discover Your Perfect Space <br/> with <span className="text-slate-500">HomeHaven</span>  </h1>
          <div className="text-gray-500 text-x5 sm:text-sm">
          HomeHaven makes renting and selling effortless—find the perfect rental to match your lifestyle <br/>
           or list your property to connect with serious buyers and close deals faster, all in one convenient platform.
          </div>
          <Link to="/search" className="text-x5 sm:text-sm text-blue-800 font-bold hover:underline">
          Lets Start now!
          </Link>
        </div>
      }
      {
  /* Swiper Section */
  offerListings && offerListings.length > 0 && (
    <Swiper navigation spaceBetween={50} slidesPerView={1}>
      {offerListings.map((listing) => (
        <SwiperSlide key={listing._id}>
          <div
            style={{
              background: `url(${listing.imageUrls[0]}) center / cover no-repeat`,
              height: "500px",
            }}
            className="rounded-lg shadow-lg"
          >
            <h2 className="text-white font-bold text-lg p-4 bg-black bg-opacity-50">
              {listing.title}
            </h2>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
      {
      // listing show
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {
          offerListings && offerListings.length > 0 && (
            <div className="">
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-700">Recent Offers</h2>
                <Link to={'/search?offer=true'} className="text-blue-800 hover:underline ">View All Offers</Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {
                  offerListings.map((listing)=>(
                    <ListingItem listing={listing} key={listing._id} />

                  ))
                }
              </div>

            </div>
          )
        }
        {
          rentListings && rentListings.length > 0 && (
            <div className="">
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-700">Recent Places to rent</h2>
                <Link to={'/search?type=rent'} className="text-blue-800 hover:underline ">View All Offers</Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {
                  rentListings.map((listing)=>(
                    <ListingItem listing={listing} key={listing._id} />

                  ))
                }
              </div>

            </div>
          )
        }
       {
          saleListings && saleListings.length > 0 && (
            <div className="">
              <div className="my-3">
                <h2 className="text-2xl font-semibold text-slate-700">Recent Places to sale</h2>
                <Link to={'/search?type=sale'} className="text-blue-800 hover:underline ">View All Offers</Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {
                  saleListings.map((listing)=>(
                    <ListingItem listing={listing} key={listing._id} />

                  ))
                }
              </div>

            </div>
          )
        }

        
      </div>
    
    
      }

    
    </div>
  )
}

