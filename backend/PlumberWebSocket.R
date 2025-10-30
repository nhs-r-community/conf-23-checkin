PlumberWebSocket <- R6::R6Class(
  # nolint
  "PlumberWebSocket",
  inherit = plumber::Plumber,
  public = list(
    onWSOpen = function(ws) {
      if (is.function(private$ws_open)) {
        private$ws_open(ws)
      }
      invisible(self)
    },
    websocket = function(open = NULL) {
      if (!is.null(open)) {
        stopifnot(is.function(open))
        private$ws_open <- open
      }
    }
  ),
  private = list(
    ws_open = NULL
  )
)
