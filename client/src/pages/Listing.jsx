import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from 'swiper';
import { Navigation } from "swiper/modules";
import 'swiper/css/bundle';
import { FaBath, FaMapMarkedAlt, FaParking, FaShare,FaChair } from "react-icons/fa";
import { FaBed } from "react-icons/fa";
export default function Listing() {
    const params = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    SwiperCore.use([Navigation]);
    const [copied, setCopied] = useState(false); // Add copied state

    
    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:4000/api/listing/get/${params.listingId}`);
                const data = await res.json();
                if (data.success === false) {
                    setError(true);
                    setLoading(false);
                    return;
                }
                setListing(data);
                setLoading(false);
                setError(false);
            } catch (error) {
                console.error("Error:", error);
                setError(true);
                setLoading(false);
            }
        };
        fetchListing();
    }, [params.listingId]);

    return (
        <main>
            {loading && <p className="text-center my-7">Loading...</p>}
            {error && <p className="text-center my-7">Error fetching listing</p>}

            {listing && !loading && !error && (
                <div>
                    <Swiper navigation>
                        {listing.imageUrls.map((url) => (
                            <SwiperSlide key={url}>
                                <div
                                    className="h-[550px] w-full bg-cover bg-center"
                                    style={{ background: `url(${url}) center no-repeat`, backgroundSize: 'cover' }}
                                ></div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-200 cursor-pointer">
                        <FaShare className="text-slate-800" onClick={()=>{
                            navigator.clipboard.writeText(window.location.href);
                            setCopied(true);
                            setTimeout(() => {
                                setCopied(false);
                            }, 2000);
                        }} />
                    </div>
                    {
                        copied && (
                            <p className="fixed top-[13%] right-[3%] z-20 bg-slate-200 text-slate-800 p-2 rounded-md">Link Copied!</p>
                        ) 
                    }
                 <div className="flex flex-col max-w-4xl mx-auto p-3 my-4 gap-4">
                    <p className="text-2xl font-semibold">{listing.name} - ${+listing.regularPrice} </p>
                    <p className="flex items-center mt-4 gap-2 text-slate-600 my-2 text-sm">
                        <FaMapMarkedAlt className="text-green-700"/>
                        {listing.address}
                    </p>
                    <div className="flex gap-4">
                        <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">{listing.type === 'rent' ? 'For Rent' : 'For Sale'}</p>
                        {listing.offer && (
                            <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                                ${+listing.regularPrice - +listing.discountPrice}
                            </p>
                        )}
                    </div>
                    <p className="text-slate-800">
                        <span className="font-semibold text-black ">
                        Description - 
                        </span>
                        {listing.description}</p>
                        <ul className="text-green-900 font-semibold text-sm flex items-center gap-4 sm:gap-4 flex-wrap">
                            <li className="flex items-center gap-1 whitespace-nowrap">
                                <FaBed className="text-lg" />
                            {
                                Listing.bedrooms >1 ? `${listing.bedrooms} Bedrooms` : `${listing.bedrooms} Bedroom`
                            }
                            </li>
                            <li className="flex items-center gap-1 whitespace-nowrap">
                                <FaBath className="text-lg" />
                            {
                                Listing.bathrooms >1 ? `${listing.bathrooms} Bathrooms` : `${listing.bathrooms} Bathroom`
                            }
                            </li>
                            <li className="flex items-center gap-1 whitespace-nowrap">
                                <FaParking
                                className="text-lg" />
                            {
                                listing.parking ? 'Parking Available' : 'No Parking'
                            }
                            </li>
                        
                            <li className="flex items-center gap-1 whitespace-nowrap">
                                <FaChair
                                className="text-lg" />
                            {
                                listing.furnished ? 'Furnished' : 'Not Furnished'
                            }
                            </li>
                        </ul>
                </div>
                </div>
            )}
        </main>
    );
}
