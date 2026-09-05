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

    Off by default because it is the one setting here that is genuinely hard to
    walk back: once a browser has seen the header it refuses plain HTTP for the
    whole max-age, and clearing that early means serving a max-age=0 header and
    waiting for every visitor to come back. Turn it on once you are content that
    the apex and www both serve HTTPS - they do today - and leave preload off.
  EOT
  type        = bool
  default     = false
}
