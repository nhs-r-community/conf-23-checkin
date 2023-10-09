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
source("send_email.R")

#* @filter cors
cors <- function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  plumber::forward()
}

#* @apiTitle NHS-R Conference 2023 Check-In


#* Check's an attendee into the conference
#* @param id:string The guid of the attendee
#* @param date:string The date
#* @serializer unboxedJSON
#* @post /attendee/<id>/<date>
#* @response 200 The details of the checked-in attendee.
#* @response 400 The attendee has already been checked in
#* @response 404 The attendee does not exist
#* @response 500 Server side error occurred
function(res, req, id, date) {
  # TODO: the day should be calculated
  tryCatch(
    {
      checkin(id, date, time = as.integer(Sys.time()))
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
#* @param date:string the date to get the list of attendees for
#* @serializer unboxedJSON
#* @get /attendees/<date>
function(res, req, date = as.character(Sys.Date())) {
  tryCatch(
    {
      get_attendees(date)
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
#* @param dates:[string] The dates that this person will be attending
#* @send_email bool Whether to send the attendee an email with their QR code or not
#* @put /attendee
#* @serializer text
function(res, req, name, email, type = "attendee", dates, send_email = TRUE) {
  tryCatch(
    {
      id <- add_attendee(name, email, type, dates)

      if (send_email) {
        send_conf_email(id, name, email)
      }

      id
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
