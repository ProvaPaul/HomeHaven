import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useState } from "react"
import { Swiper,SwiperSlide } from "swiper/react";
import SwiperCore from 'swiper';
import { Navigation } from "swiper/modules";
import 'swiper/css/bundle';

export default function Listing() {
    const params = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    SwiperCore.use([Navigation]);
    useEffect(() => {
        const fetchListing = async () => {
            try{
                setLoading(true);
                const res= await fetch(`http://localhost:4000/api/listing/get/${params.listingId}`);
                const data = await res.json();
                if(data.success === false){
                    setError(true);
                    setLoading(false);
                    return;
                }
                setListing(data);
                setLoading(false);
                setError(false);
            } catch (error){
                console.error("Error:", error);
                setError(true);
                setLoading(false);
            }
        }
        fetchListing();
    }, [params.listingId]);
  return (
    <main>
        {loading && <p className="text-center my-7">Loading...</p>}
        {error && (
            <p className="text-center my-7">Error fetching listing</p>
        ) }

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
    </div>
)}


    </main>
  )
}
