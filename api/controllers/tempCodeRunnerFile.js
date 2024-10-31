export const deleteUser = async(req, res,next) => {
    if(req.user.id !== req.params.id)
        return next(errorHandler(403,'You can delete only your own account'));
    
    try{
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({message:'User has been deleted'});
    } catch (error){
        next(error);
    }
}