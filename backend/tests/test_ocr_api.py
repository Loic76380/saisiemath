"""
Backend API tests for FormulaPad OCR service
Tests the /api/ocr endpoint with GPT-4 Vision integration
"""
import pytest
import requests
import os
import base64

# Get backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Test basic API health"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns Hello World"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Hello World"


class TestOCREndpoint:
    """Test OCR endpoint with GPT-4 Vision"""
    
    def test_ocr_endpoint_exists(self):
        """Test OCR endpoint is accessible"""
        # Send minimal request to check endpoint exists
        response = requests.post(
            f"{BASE_URL}/api/ocr",
            json={"image": ""},
            headers={"Content-Type": "application/json"}
        )
        # Should return 400 or 500 for empty image, not 404
        assert response.status_code != 404, "OCR endpoint not found"
    
    def test_ocr_with_empty_image(self):
        """Test OCR with empty image returns error"""
        response = requests.post(
            f"{BASE_URL}/api/ocr",
            json={"image": ""},
            headers={"Content-Type": "application/json"}
        )
        # Empty image should return 400 or 500
        assert response.status_code in [400, 500]
    
    def test_ocr_with_minimal_image(self):
        """Test OCR with a minimal valid base64 image"""
        # 1x1 pixel transparent PNG
        minimal_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/ocr",
            json={"image": minimal_png},
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 200 with response structure
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "latex" in data
        assert "confidence" in data
        assert "formats" in data
        assert isinstance(data["formats"], dict)
    
    def test_ocr_response_structure(self):
        """Test OCR response has correct structure"""
        # Simple test image
        minimal_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/ocr",
            json={"image": minimal_png},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check all expected fields
        assert "latex" in data
        assert "confidence" in data
        assert "formats" in data
        
        # Check formats sub-structure
        formats = data["formats"]
        assert "latex" in formats
        assert "mathml" in formats
        assert "asciimath" in formats
        assert "text" in formats
    
    def test_ocr_confidence_range(self):
        """Test OCR confidence is in valid range"""
        minimal_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(
            f"{BASE_URL}/api/ocr",
            json={"image": minimal_png},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Confidence should be between 0 and 1
        assert 0 <= data["confidence"] <= 1
    
    def test_ocr_missing_image_field(self):
        """Test OCR with missing image field"""
        response = requests.post(
            f"{BASE_URL}/api/ocr",
            json={},
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 (validation error) for missing required field
        assert response.status_code == 422


class TestStatusEndpoint:
    """Test status endpoint"""
    
    def test_get_status(self):
        """Test GET /api/status returns list"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_status(self):
        """Test POST /api/status creates entry"""
        response = requests.post(
            f"{BASE_URL}/api/status",
            json={"client_name": "TEST_FormulaPad_Test"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert "client_name" in data
        assert data["client_name"] == "TEST_FormulaPad_Test"
        assert "timestamp" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
