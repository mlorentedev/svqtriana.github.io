terraform {
  required_version = ">= 1.9"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# The token is read from CLOUDFLARE_API_TOKEN. Never put it in a .tfvars file
# and never pass it on the command line - inject it into this process only:
#
#   dotf secrets run --only CLOUDFLARE_API_TOKEN -- terraform plan
provider "cloudflare" {}
