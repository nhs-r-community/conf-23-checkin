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

#* @apiTitle NHS-R Conference 2023 Check-I


#* Check's an attendee into the conference
#* @param id:string The guid of the attendee
#* @param time:int Unix timestamp of when to check the attendee in (0 is checked-out)
#* @serializer unboxedJSON
#* @post /checkin/<id>
#* @response 200 The details of the checked-in attendee.
#* @response 400 The attendee has already been checked in
#* @response 404 The attendee does not exist
#* @response 500 Server side error occurred
function(res, req, id, time = as.integer(Sys.time())) {
  # TODO: the day should be calculated
  tryCatch(
    {
      checkin(id, "T", time = as.integer(time))
    },
    error = \(e) {
      res$status <- switch(e$message,
        "attendee not found" = 404,
        "already checked in" = 400,
        500
      )

      list(
        error = e$message
      )
    }
  )
}


#* Get the list of attendees
#* @param day:string The day, either T or W
#* @serializer unboxedJSON
#* @get /attendees/<day>
function(res, req, day) {
  tryCatch(
    {
      get_attendees(day)
    },
    error = \(e) {
      res$status <- switch(e$message,
        "'arg' should be one of “T”, “W”" = 400,
        500
      )

      list(
        error = e$message
      )
    }
  )
}

#* Add a new attendee
#* @param name:string The attendees name
#* @param email:string The attendees email address
#* @param type:string The type of this attendee, must be one of attendee, speaker, organiser, or wtv
#* @param days:string Whether they are attending on Tuesday (T), Wednesday (W), or both days (TW)
#* @post /attendee
#* @serializer png
function(name, email, type = "attendee", days = "TW") {
  tryCatch(
    {
      plot(add_attendee(name, email, type, strsplit(days, "")[[1]]))
    },
    error = \(e) {
      res$status <- switch(substring(e$message, 1, 22),
        "'arg' should be one of" = 400,
        500
      )

      list(
        error = e$message
      )
    }
  )
}
