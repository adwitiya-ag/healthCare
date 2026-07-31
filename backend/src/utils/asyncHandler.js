// by promise
const asyncHandler = (requestHandler) => { 
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))// exceuting requestHandler func if promise is resolved
        .catch((err) => next(err))// catch error if any error occured It catches the error Passes it to next(err)
    }
} 

export {asyncHandler} // exporting asyncHandler function

