.data <- rlang::.data
.env <- rlang::.env

# make sure this package get's installed
library(dbplyr)

db_con <- function(env = parent.frame()) {
  db_path <- file.path(Sys.getenv("DB_PATH", "."), "attendees.db")

  con <- DBI::dbConnect(RSQLite::SQLite(), db_path)
  withr::defer(DBI::dbDisconnect(con), envir = env)
  con
}

create_tables <- function() {
  con <- db_con()

  cat("Creating tables:\n")
  if (!DBI::dbExistsTable(con, "attendees")) {
    cat("* Creating attendees\n")

    DBI::dbCreateTable(
      con,
      "attendees",
      list(
        id = "TEXT",
        firstname = "TEXT",
        surname = "TEXT",
        email = "TEXT",
        type = "TEXT",
        day = "TEXT",
        checked_in = "INT"
      )
    )
  } else {
    cat("* attendees already exists\n")
  }

  if (!DBI::dbExistsTable(con, "emails_sent")) {
    cat("* Creating emails_sent\n")
    DBI::dbCreateTable(
      con,
      "emails_sent",
      list(
        id = "TEXT"
      )
    )
  } else {
    cat("* emails_sent already exists\n")
  }
}

add_attendee <- function(
  firstname,
  surname,
  email,
  type,
  days = c("2025-11-13", "2025-11-14")
) {
  con <- db_con()

  attendee <- dplyr::tbl(con, "attendees") |>
    dplyr::filter(.data[["email"]] == .env[["email"]]) |>
    dplyr::collect()

  if (nrow(attendee) > 0) {
    id <- attendee$id[[1]]
    days <- setdiff(days, attendee$day)

    # if already been added for all the provided days
    if (length(days) == 0) {
      return(id)
    }
  } else {
    # hasn't been added at all yet
    id <- uuid::UUIDgenerate()
  }

  df <- data.frame(
    id = id,
    firstname = firstname,
    surname = surname,
    email = email,
    type = type,
    day = days,
    checked_in = 0
  )

  DBI::dbAppendTable(db_con(), "attendees", df)

  id
}

checkin <- function(id, day, time = as.integer(Sys.time())) {
  attendee <- check_attendee(id, day) |>
    dplyr::mutate(
      .before = "firstname",
      name = paste(.data[["firstname"]], .data[["surname"]])
    ) |>
    dplyr::select(-"firstname", -"surname")

  stopifnot(
    "attendee not found" = nrow(attendee) != 0
  )

  if (is.na(attendee$checked_in) || attendee$checked_in == 0 || time == 0) {
    con <- db_con()
    res <- con |>
      DBI::dbSendQuery(
        "UPDATE attendees SET checked_in = ? WHERE id = ? and day = ?"
      ) |>
      DBI::dbBind(list(time, id, day))
    withr::defer(DBI::dbClearResult(res))

    rn <- DBI::dbGetRowsAffected(res)

    stopifnot("error updating rows" = rn == 1)

    attendee$checked_in <- time
  }

  as.list(attendee)
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
  dplyr::tbl(
    db_con(),
    "attendees"
  ) |>
    dplyr::filter(.data[["day"]] == .env[["day"]]) |>
    dplyr::collect() |>
    dplyr::transmute(
      .data[["id"]],
      name = paste(.data[["firstname"]], .data[["surname"]]),
      .data[["email"]],
      .data[["type"]],
      .data[["checked_in"]]
    )
}

add_attendees_from_excel <- function(attendees, send_emails = TRUE) {
  added_attendees_ids <- attendees |>
    purrr::pmap_chr(add_attendee, .progress = TRUE)

  if (send_emails) {
    con <- db_con()
    dplyr::tbl(con, "attendees") |>
      dplyr::anti_join(
        dplyr::tbl(con, "emails_sent"),
        by = dplyr::join_by("id")
      ) |>
      dplyr::distinct(
        .data[["id"]],
        name = .data[["firstname"]],
        to = .data[["email"]]
      ) |>
      dplyr::collect() |>
      dplyr::filter(.data[["id"]] %in% added_attendees_ids) |>
      purrr::pmap(send_conf_email, .progress = TRUE) |>
      purrr::flatten_chr() |>
      tibble::tibble(id = _) |>
      DBI::dbAppendTable(con, "emails_sent", value = _)
  }

  return(length(added_attendees_ids))
}
