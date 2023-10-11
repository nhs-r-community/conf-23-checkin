source("PlumberWebSocket.R")
source("db_functions.R")
source("send_email.R")

# ensure the database is created
create_tables()

pr <- PlumberWebSocket$new("plumber.R")

pr
