"""
Tests for OpenAI Service - AI-powered flashcard generation.

Tests cover:
- Successful generation with mocked OpenAI responses
- Malformed JSON handling
- API timeout/error handling
- Validation
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.openai_service import OpenAIService, openai_service


class TestOpenAIServiceSuccess:
    """Test successful flashcard generation."""

    @pytest.mark.asyncio
    async def test_generate_flashcards_success(self):
        """Test successful generation with valid response."""
        # Mock OpenAI client
        mock_client = AsyncMock()
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()

        # Mock valid JSON response
        mock_message.content = '''
        [
            {
                "question": "What is Python?",
                "answer": "A high-level programming language",
                "explanation": "Python is known for its simplicity",
                "difficulty": 2,
                "tags": ["programming", "python"]
            },
            {
                "question": "What is a variable?",
                "answer": "A named storage location",
                "difficulty": 1,
                "tags": ["programming", "basics"]
            }
        ]
        '''

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        # Create service with mock
        service = OpenAIService()
        service.client = mock_client

        # Generate flashcards
        cards = await service.generate_flashcards(
            text="This is a test text about Python programming" * 10,
            count=2
        )

        # Assertions
        assert len(cards) == 2
        assert cards[0]["question"] == "What is Python?"
        assert cards[0]["answer"] == "A high-level programming language"
        assert cards[0]["difficulty"] == 2
        assert "programming" in cards[0]["tags"]

        assert cards[1]["question"] == "What is a variable?"
        assert cards[1]["difficulty"] == 1

    @pytest.mark.asyncio
    async def test_generate_flashcards_with_params(self):
        """Test generation with custom parameters."""
        mock_client = AsyncMock()
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()

        mock_message.content = '''
        [
            {
                "question": "Test question?",
                "answer": "Test answer",
                "difficulty": 4,
                "tags": ["biology"],
                "ai_confidence": 0.9
            }
        ]
        '''

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        service = OpenAIService()
        service.client = mock_client

        # Generate with custom params
        cards = await service.generate_flashcards(
            text="Biology text content" * 20,
            count=1,
            difficulty="hard",
            subject="Biology",
            ai_confidence=0.9
        )

        assert len(cards) == 1
        assert cards[0]["difficulty"] == 4
        assert cards[0]["ai_confidence"] == 0.9


class TestOpenAIServiceMalformedJSON:
    """Test handling of malformed JSON responses."""

    @pytest.mark.asyncio
    async def test_generate_flashcards_malformed_json(self):
        """Test that malformed JSON raises appropriate error."""
        mock_client = AsyncMock()
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()

        # Invalid JSON
        mock_message.content = '''
        This is not valid JSON at all
        '''

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        service = OpenAIService()
        service.client = mock_client

        # Should raise exception
        with pytest.raises(Exception) as exc_info:
            await service.generate_flashcards(
                text="Test text" * 10,
                count=1
            )

        assert "Invalid JSON" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_generate_flashcards_wrapped_json(self):
        """Test that JSON wrapped in markdown code blocks is parsed correctly."""
        mock_client = AsyncMock()
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()

        # JSON wrapped in markdown
        mock_message.content = '''```json
        [
            {
                "question": "Wrapped question?",
                "answer": "Wrapped answer",
                "difficulty": 3,
                "tags": []
            }
        ]
        ```'''

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        service = OpenAIService()
        service.client = mock_client

        # Should still parse successfully
        cards = await service.generate_flashcards(
            text="Test text" * 10,
            count=1
        )

        assert len(cards) == 1
        assert cards[0]["question"] == "Wrapped question?"

    @pytest.mark.asyncio
    async def test_generate_flashcards_missing_required_fields(self):
        """Test that cards missing required fields are skipped."""
        mock_client = AsyncMock()
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()

        # One valid card, one missing answer
        mock_message.content = '''
        [
            {
                "question": "Valid question?",
                "answer": "Valid answer",
                "difficulty": 2,
                "tags": []
            },
            {
                "question": "Invalid question?",
                "difficulty": 2,
                "tags": []
            }
        ]
        '''

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        service = OpenAIService()
        service.client = mock_client

        cards = await service.generate_flashcards(
            text="Test text" * 10,
            count=2
        )

        # Should only return valid card
        assert len(cards) == 1
        assert cards[0]["question"] == "Valid question?"


class TestOpenAIServiceErrors:
    """Test error handling."""

    @pytest.mark.asyncio
    async def test_generate_flashcards_api_timeout(self):
        """Test handling of API timeout."""
        mock_client = AsyncMock()
        mock_client.chat.completions.create.side_effect = TimeoutError("API timeout")

        service = OpenAIService()
        service.client = mock_client

        with pytest.raises(Exception):
            await service.generate_flashcards(
                text="Test text" * 10,
                count=1
            )

    @pytest.mark.asyncio
    async def test_generate_flashcards_empty_response(self):
        """Test handling of empty response."""
        mock_client = AsyncMock()
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()

        mock_message.content = None

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        service = OpenAIService()
        service.client = mock_client

        with pytest.raises(Exception) as exc_info:
            await service.generate_flashcards(
                text="Test text" * 10,
                count=1
            )

        assert "Empty response" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_generate_flashcards_no_api_key(self):
        """Test that missing API key raises error."""
        service = OpenAIService()
        service.client = None

        with pytest.raises(ValueError) as exc_info:
            await service.generate_flashcards(
                text="Test text" * 10,
                count=1
            )

        assert "API key not configured" in str(exc_info.value)


class TestOpenAIServiceValidation:
    """Test input validation."""

    @pytest.mark.asyncio
    async def test_generate_flashcards_text_too_short(self):
        """Test that text too short raises error."""
        service = OpenAIService()
        service.client = AsyncMock()  # Mock to avoid actual API call

        with pytest.raises(ValueError) as exc_info:
            await service.generate_flashcards(
                text="Short",  # Too short
                count=1
            )

        assert "at least 50 characters" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_generate_flashcards_count_invalid(self):
        """Test that invalid count raises error."""
        service = OpenAIService()
        service.client = AsyncMock()

        # Count too low
        with pytest.raises(ValueError):
            await service.generate_flashcards(
                text="Test text" * 10,
                count=0
            )

        # Count too high
        with pytest.raises(ValueError):
            await service.generate_flashcards(
                text="Test text" * 10,
                count=101
            )

    @pytest.mark.asyncio
    async def test_normalize_card_difficulty_clamping(self):
        """Test that difficulty is clamped to valid range."""
        mock_client = AsyncMock()
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()

        # Difficulty out of range
        mock_message.content = '''
        [
            {
                "question": "Test?",
                "answer": "Test",
                "difficulty": 10,
                "tags": []
            },
            {
                "question": "Test2?",
                "answer": "Test2",
                "difficulty": -1,
                "tags": []
            }
        ]
        '''

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        service = OpenAIService()
        service.client = mock_client

        cards = await service.generate_flashcards(
            text="Test text" * 10,
            count=2
        )

        # Difficulties should be clamped to 1-5
        assert 1 <= cards[0]["difficulty"] <= 5
        assert 1 <= cards[1]["difficulty"] <= 5


class TestOpenAIServicePromptBuilding:
    """Test prompt building logic."""

    def test_build_prompt_basic(self):
        """Test basic prompt building."""
        service = OpenAIService()

        prompt = service._build_prompt(
            text="Test text content" * 20,
            count=10
        )

        assert "10 flashcards" in prompt
        assert "Test text content" in prompt
        assert "SOURCE TEXT:" in prompt

    def test_build_prompt_with_difficulty(self):
        """Test prompt building with difficulty."""
        service = OpenAIService()

        prompt = service._build_prompt(
            text="Test text" * 20,
            count=5,
            difficulty="hard"
        )

        assert "analysis" in prompt.lower() or "complex" in prompt.lower()

    def test_build_prompt_with_subject(self):
        """Test prompt building with subject."""
        service = OpenAIService()

        prompt = service._build_prompt(
            text="Test text" * 20,
            count=5,
            subject="Biology"
        )

        assert "Biology" in prompt
