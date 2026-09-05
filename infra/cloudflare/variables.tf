variable "zone_id" {
  description = "Cloudflare zone ID for svqtriana.com."
  type        = string
}

variable "account_id" {
  description = "Cloudflare account ID that owns the zone."
  type        = string
}

variable "zone_name" {
  description = "The apex domain served from this repository."
  type        = string
  default     = "svqtriana.com"
}

variable "enable_hsts" {
  description = <<-EOT
    Turn on Strict-Transport-Security.

    On since 2026-09-05. It is the one setting here that is genuinely hard to
    walk back: once a browser has seen the header it refuses plain HTTP for the
    whole max-age, and clearing it early means serving max-age=0 and waiting for
    every visitor to return. Enabled deliberately, after confirming the apex and
    www both serve HTTPS. Preload stays off - that list lives in the browsers,
    and getting off it is slower still.
  EOT
  type        = bool
  default     = true
}
