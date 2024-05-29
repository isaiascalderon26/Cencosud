consul {
  retry {
    enabled     = true
    attempts    = 3
    backoff     = "50ms"
    max_backoff = "10s"
  }
}

log_level = "info"

template {
  source      = "./consul/templates/.env.tmpl"
  destination = "./.env"
  perms       = 0644
  backup      = false
}
