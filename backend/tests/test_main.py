"""
Tests for main FastAPI application endpoints.
"""

import pytest
from fastapi import status


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    def test_health_check_returns_200(self, client):
        """Test that health check returns 200 OK."""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK

    def test_health_check_returns_correct_structure(self, client):
        """Test that health check returns expected JSON structure."""
        response = client.get("/health")
        data = response.json()

        assert "status" in data
        assert "app_name" in data
        assert "version" in data
        assert "environment" in data
        assert "timestamp" in data
        assert "checks" in data

        assert data["status"] == "healthy"
        assert isinstance(data["checks"], dict)

    def test_health_check_includes_api_check(self, client):
        """Test that health check includes API status."""
        response = client.get("/health")
        data = response.json()

        assert "api" in data["checks"]
        assert data["checks"]["api"] is True


class TestRootEndpoint:
    """Tests for root endpoint."""

    def test_root_returns_200(self, client):
        """Test that root endpoint returns 200 OK."""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK

    def test_root_returns_welcome_message(self, client):
        """Test that root endpoint returns welcome message."""
        response = client.get("/")
        data = response.json()

        assert "message" in data
        assert "version" in data
        assert "docs" in data
        assert "health" in data

    def test_root_includes_docs_links(self, client):
        """Test that root endpoint includes documentation links."""
        response = client.get("/")
        data = response.json()

        assert data["docs"] == "/docs"
        assert data["health"] == "/health"


class TestCORS:
    """Tests for CORS middleware."""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present in response."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:8081",
                "Access-Control-Request-Method": "GET",
            }
        )

        # CORS headers should be present
        assert "access-control-allow-origin" in response.headers

    def test_cors_allows_configured_origins(self, client):
        """Test that CORS allows configured origins."""
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:8081"}
        )

        assert response.status_code == status.HTTP_200_OK


class TestAPIDocumentation:
    """Tests for API documentation endpoints."""

    def test_swagger_docs_accessible(self, client):
        """Test that Swagger UI is accessible."""
        response = client.get("/docs")
        assert response.status_code == status.HTTP_200_OK

    def test_redoc_accessible(self, client):
        """Test that ReDoc is accessible."""
        response = client.get("/redoc")
        assert response.status_code == status.HTTP_200_OK

    def test_openapi_json_accessible(self, client):
        """Test that OpenAPI JSON is accessible."""
        response = client.get("/openapi.json")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data
