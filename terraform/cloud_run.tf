# Artifact Registry Repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "aicalling-repo"
  description   = "Docker repository for AI Calling Platform"
  format        = "DOCKER"
}

# Backend Cloud Run Service
resource "google_cloud_run_v2_service" "backend" {
  name     = "aicalling-backend"
  location = var.region

  template {
    containers {
      # Use a placeholder image initially or expect it to be built before apply
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      env {
        name  = "DATABASE_URL"
        value = "postgresql+asyncpg://postgres:${var.db_password}@${google_sql_database_instance.postgres.private_ip_address}:5432/aicalling"
      }
      env {
        name  = "LIVEKIT_API_KEY"
        value = var.livekit_api_key
      }
      env {
        name  = "LIVEKIT_API_SECRET"
        value = var.livekit_api_secret
      }
      env {
        name  = "LIVEKIT_URL"
        value = var.livekit_url
      }
      env {
        name  = "GEMINI_API_KEY"
        value = var.gemini_api_key
      }
      env {
        name  = "ELEVEN_API_KEY"
        value = var.eleven_api_key
      }
      env {
        name  = "TWILIO_ACCOUNT_SID"
        value = var.twilio_account_sid
      }
      env {
        name  = "TWILIO_AUTH_TOKEN"
        value = var.twilio_auth_token
      }
      env {
        name  = "TWILIO_PHONE_NUMBER"
        value = var.twilio_phone_number
      }
      env {
        name  = "REDIS_URL"
        value = "redis://${google_redis_instance.redis.host}:${google_redis_instance.redis.port}"
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }
}

# Frontend Cloud Run Service
resource "google_cloud_run_v2_service" "frontend" {
  name     = "aicalling-frontend"
  location = var.region

  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
      env {
        name  = "NEXT_PUBLIC_LIVEKIT_URL"
        value = var.livekit_url
      }
    }
  }
}

# AI Agent Worker Cloud Run Service
resource "google_cloud_run_v2_service" "ai_agent" {
  name     = "aicalling-agent"
  location = var.region

  template {
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
        cpu_idle = false # Always allocated CPU for background tasks/websockets
      }

      env {
        name  = "BACKEND_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
      env {
        name  = "REDIS_URL"
        value = "redis://${google_redis_instance.redis.host}:${google_redis_instance.redis.port}"
      }
      env {
        name  = "LIVEKIT_API_KEY"
        value = var.livekit_api_key
      }
      env {
        name  = "LIVEKIT_API_SECRET"
        value = var.livekit_api_secret
      }
      env {
        name  = "LIVEKIT_URL"
        value = var.livekit_url
      }
      env {
        name  = "GEMINI_API_KEY"
        value = var.gemini_api_key
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }
}

# Allow unauthenticated invocations for public services
resource "google_cloud_run_service_iam_member" "frontend_public" {
  location = google_cloud_run_v2_service.frontend.location
  project  = google_cloud_run_v2_service.frontend.project
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "backend_public" {
  location = google_cloud_run_v2_service.backend.location
  project  = google_cloud_run_v2_service.backend.project
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
