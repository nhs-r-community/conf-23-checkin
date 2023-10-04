#
# This is a Plumber API. In RStudio 1.2 or newer you can run the API by
# clicking the 'Run API' button above.
#
# In RStudio 1.1 or older, see the Plumber documentation for details
# on running the API.
#
# Find out more about building APIs with Plumber here:
#
#    https://www.rplumber.io/
#

library(plumber)
source("db_functions.R")

#* @filter cors
cors <- function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  plumber::forward()
}

#* @apiTitle Plumber Example API

#* Echo back the input
#* @param id The guid of the user
#* @serializer unboxedJSON
#* @post /checkin/<id>
function(res, req, id, time = as.integer(Sys.time())) {
  # TODO: the day should be calculated
  tryCatch(
    {
      checkin(id, "T", time = as.integer(time))
    },
    error = \(e) {
      res$status <- 400
      list(
        error = e$message
      )
    }
  )
}
