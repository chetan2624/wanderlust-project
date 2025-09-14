const express = require("express");
const router =  express.Router({mergeParams: true}); 
const wrapAsync = require("../utils/wrapAsync.js"); 
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");



const validateReview = (req,res,next)=>{
    let{error} =  reviewSchema.validate(req.body);

    if(error){
        let errmsg = error.details.map((el) => el.message ).join(",")
      throw new ExpressError(400, errmsg);
    } else{
        next();
    }

}

//Reviews Post Route
router.post("/",validateReview, wrapAsync( async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("reviews");
        const newReview = new Review(req.body.review);
        await newReview.save();
        
        listing.reviews.push(newReview); // Push the review ID into the reviews array
        await listing.save();
        
        console.log("New review saved.");
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving the review.");
    }
}));

// Review delete route  
router.delete("/:reviewId", 
wrapAsync(async (req,res) =>{
let {id, reviewId} = req.params; 
await Listing.findByIdAndUpdate(id, {$pull: { reviews : reviewId}});
await Review.findByIdAndDelete(reviewId);

res.redirect(`/listings/${id}`)
})
);

module.exports = router;
