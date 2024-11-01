import Listing from '../models/listing.model.js';
export const createListing = async(req, res,next) => {
    try{
        const listing= await Listing.create(req.body);
        return res.status(201).json(listing);
    }
    catch(error){
        console.log("Error creating listing:", error);  // Log the error
        next(error);
    }
}
export const deleteListing = async(req, res,next) => {
    const listing=await Listing.findById(req.params.id);

    if(!listing)
        return next(errorHandler(404,'Listing not found'));
    if(req.user.id !== listing.userRef)
        return next(errorHandler(403,'You can delete only your own listings'));

    try{
        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json({message:'Listing has been deleted'});
    }
    catch(error){
        next(error);
    }

}