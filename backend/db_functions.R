db_con <- function(db_path = "attendees.db", env = parent.frame()) {
  con <- DBI::dbConnect(RSQLite::SQLite(), db_path)
  withr::defer(DBI::dbDisconnect(con), envir = env)
  con
}

create_table <- function() {
  con <- db_con()

  DBI::dbCreateTable(
    con,
    "attendees",
    list(
      id = "TEXT",
      name = "TEXT",
      email = "TEXT",
      type = "TEXT",
      day = "TEXT",
      checked_in = "INT"
    )
  )
}

add_attendee <- function(
    name, email,
    type = c("attendee", "speaker", "organiser", "wtv"),
    days = as.Date(c("2023-10-17", "2023-10-18"))) {
  type <- match.arg(type)

  id <- uuid::UUIDgenerate()

  df <- data.frame(
    id = id,
    name = name,
    email = email,
    type = type,
    day = days,
    checked_in = 0
  )

  DBI::dbAppendTable(db_con(), "attendees", df)

  qrcode::qr_code(id)
}

checkin <- function(id, day, time = as.integer(Sys.time())) {
  attendee <- check_attendee(id, day)

  stopifnot(
    "attendee not found" = nrow(attendee) != 0,
    "already checked in" = is.na(attendee$checked_in) || time == 0
  )

  con <- db_con()
  res <- con |>
    DBI::dbSendQuery(
      "UPDATE attendees SET checked_in = ? WHERE id = ? and day = ?"
    ) |>
    DBI::dbBind(list(time, id, day))
  withr::defer(DBI::dbClearResult(res))

  rn <- DBI::dbGetRowsAffected(res)

  stopifnot("error updating rows" = rn == 1)

  as.list(attendee[c("name", "email", "type")])
}

check_attendee <- function(id, day) {
  con <- db_con()
  res <- DBI::dbSendQuery(
    con,
    "SELECT * FROM attendees WHERE id = ? AND day = ?"
  )
  withr::defer(DBI::dbClearResult(res))

  DBI::dbBind(res, list(id, day))
  r <- DBI::dbFetch(res)

  r$checked_in[r$checked_in == 0] <- NA
  r$checked_in <- as.POSIXct(r$checked_in)

  r
}

get_attendees <- function(day) {
  con <- db_con()
  res <- DBI::dbSendQuery(
    con,
    "SELECT id, name, email, type, checked_in FROM attendees WHERE day = ?"
  )
  withr::defer(DBI::dbClearResult(res))

  DBI::dbBind(res, list(day))
  DBI::dbFetch(res)
}
