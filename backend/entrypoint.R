source("PlumberWebSocket.R")
source("db_functions.R")
source("send_email.R")

cat("DB_PATH: ", Sys.getenv("DB_PATH"), "\n", sep = " ")

# ensure the database is created
create_tables()

pr <- PlumberWebSocket$new("plumber.R")

pr
