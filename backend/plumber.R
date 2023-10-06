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


#* Find's an attendees id by email adddress
#* @param email:string The email of the attendee
#* @get /find_id_by_email/<email>
#* @serializer text
#* @response 200 The id of the attendee
#* @response 404 The email does not exist
#* @response 500 Multiple matches for this email found
function(res, req, email) {
  id <- email |>
    URLdecode() |>
    tolower() |>
    trimws() |>
    search_attendee_by_email()

  if (length(id) == 0) {
    res$status <- 404
    "email not found"
  } else if (length(id) > 1) {
    res$status <- 500
    "multiple matches found"
  } else {
    id
  }
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
