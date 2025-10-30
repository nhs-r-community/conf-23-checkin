library(blastula)
library(qrcode)

send_conf_email <- function(id, name, to) {
  qr_path <- withr::local_file("qr_code.png")

  # generate the qr code as a file on disk
  png(qr_path)
  plot(qrcode::qr_code(id))
  dev.off()

  img_string <- blastula::add_image(file = qr_path) # nolint
  date_time <- blastula::add_readable_time()

  body <- readr::read_file("email_body.md") |>
    glue::glue()

  email <- blastula::compose_email(
    body = blastula::md(body),
    footer = blastula::md(
      glue::glue(
        .sep = "<br /><br />",
        "Email sent on {date_time}.",
        "Please send any questions to [nhs.rcommunity@nhs.net](mailto:nhs.rcommunity@nhs.net)"
      )
    )
  )

  cred <- blastula::creds_file(".email")

  email |>
    blastula::smtp_send(
      to = to,
      from = cred$user,
      subject = "NHS-R/pycom Conference 2023",
      credentials = cred
    )

  id
}
