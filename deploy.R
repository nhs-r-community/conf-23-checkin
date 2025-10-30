deploy_backend <- function() {
  rsconnect::deployAPI(
    "backend",
    appId = 225,
    appName = "pysoc-checkin-api",
    appTitle = "PYSOC 2025 Check In (API)"
  )
}

deploy_frontend <- function() {
  withr::with_dir("frontend", {
    system("npm run build")
  })
  rsconnect::deployDoc(
    "frontend/build/index.html",
    appId = 226,
    appName = "pysoc-checkin-frontend",
    appTitle = "PYSOC 2025 Check In"
  )
}

deploy <- function() {
  deploy_backend()
  deploy_frontend()
}

deploy()
