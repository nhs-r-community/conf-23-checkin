deploy_backend <- function() {
  readRenviron(".Renviron.production")

  rsconnect::deployAPI(
    "backend",
    appId = 225,
    appName = "rpysoc-checkin-api",
    appTitle = "RPYSOC 2025 Check In (API)",
    envVars = c("DB_PATH")
  )
}

deploy_frontend <- function() {
  withr::with_dir("frontend", {
    system("npm run build")
  })
  rsconnect::deployDoc(
    "frontend/build/index.html",
    appId = 226,
    appName = "rpysoc-checkin-frontend",
    appTitle = "RPYSOC 2025 Check In"
  )
}

deploy <- function() {
  deploy_backend()
  deploy_frontend()
}

deploy()
