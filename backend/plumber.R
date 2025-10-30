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

#* @apiTitle RPYSOC 2025 Check In API

# web socket client list
clients <- list()


#* Get the list of attendees
#* @param date:string the date to get the list of attendees for
#* @serializer unboxedJSON
#* @get /attendees/<date>
function(res, req, date = as.character(Sys.Date())) {
  get_attendees(date)
}


plumber::register_parser(
  "nhsr_excel_attendees_file",
  function(...) {
    plumber::parser_read_file(\(filename) {
      purrr::map(
        c("2023-10-17" = 1, "2023-10-18" = 2),
        ~ readxl::read_xlsx(filename, sheet = .x, skip = 1)
      ) |>
        dplyr::bind_rows(.id = "days") |>
        janitor::clean_names() |>
        dplyr::mutate(
          dplyr::across(
            "email",
            purrr::compose(
              stringr::str_to_lower,
              stringr::str_trim
            )
          )
        ) |>
        dplyr::rename(type = "event_role")
    })
  },
  fixed = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)

#* Upload a file
#* @param file:file Excel file containing attendes
#* @param send_emails:bool Whether to send emails or not
#* @post /attendees/upload
#* @parser multi
#* @parser nhsr_excel_attendees_file
#* @serializer text
function(file, send_emails) {
  add_attendees_from_excel(file[[1]], send_emails)
}


#* Add a new attendee
#* @param firstname:string The attendees firstname
#* @param surname:string The attendees surname
#* @param email:string The attendees email address
#* @param type:string The type of this attendee, must be one of Attendee, Presenter, or Event Team
#* @param days:[string] The dates that this person will be attending (yyyy-mm-dd)
#* @send_email bool Whether to send the attendee an email with their QR code or not
#* @put /attendee
#* @serializer text
function(
  res,
  req,
  firstname,
  surname,
  email,
  type = "Attendee",
  days = as.character(Sys.Date()),
  send_email = FALSE
) {
  tryCatch(
    {
      id <- add_attendee(firstname, surname, email, type, days)

      if (send_email) {
        send_conf_email(id, firstname, email)
      }

      id
    },
    error = \(e) {
      res$status <- switch(
        substring(e$message, 1, 22),
        "'arg' should be one of" = 400,
        500
      )

      list(
        error = e$message
      )
    }
  )
}

#* Check's an attendee into the conference
#* @param id:string The guid of the attendee
#* @param date:string The date
#* @param time:int Unix timestamp of when to check the attendee in at
#* @serializer unboxedJSON
#* @post /attendee/<id>/<date>
#* @response 200 The details of the checked-in attendee.
#* @response 400 The attendee has already been checked in
#* @response 404 The attendee does not exist
#* @response 500 Server side error occurred
function(res, req, id, date, time = as.integer(Sys.time())) {
  # TODO: the day should be calculated
  tryCatch(
    {
      results <- checkin(id, date, time)

      lapply(
        clients,
        \(client) {
          client$send(
            jsonlite::toJSON(results, auto_unbox = TRUE, pretty = TRUE)
          )
        }
      )
      results
    },
    error = \(e) {
      res$status <- switch(e$message, "attendee not found" = 404, 500)

      list(
        error = e$message
      )
    }
  )
}


#' @plumber
function(pr) {
  pr$websocket(
    function(ws) {
      id <- ws$request$uuid <- uuid::UUIDgenerate()
      clients[[id]] <<- ws

      ws$onMessage(\(binary, message) {
        # no need to handle messages here
      })

      ws$onClose(\() {
        clients[[id]] <<- NULL
      })
    }
  )
}
