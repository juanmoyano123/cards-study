"""
Anthropic Claude Service for AI-powered flashcard generation.

Uses Claude Sonnet for high-quality flashcard generation from study materials.
"""

import os
import json
from typing import List, Dict, Optional
from anthropic import AsyncAnthropic
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class OpenAIService:
    """
    Service for generating flashcards using Anthropic's Claude models.

    Note: Class name kept as OpenAIService for backward compatibility.

    Features:
    - High-quality generation using Claude Sonnet
    - Few-shot prompting for excellent cards
    - Structured JSON output format
    - Error handling and retry logic
    """

    def __init__(self):
        """Initialize the Anthropic client."""
        api_key = os.getenv("ANTHROPIC_API_KEY") or getattr(settings, "ANTHROPIC_API_KEY", None)

        if not api_key:
            logger.warning("ANTHROPIC_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = AsyncAnthropic(api_key=api_key)

        # Model configuration
        self.model = "claude-sonnet-4-20250514"
        self.max_tokens = 4000
        self.temperature = 0.7

    def _build_prompt(
        self,
        text: str,
        count: int,
        difficulty: Optional[str] = None,
        subject: Optional[str] = None
    ) -> str:
        """
        Build the prompt for flashcard generation with few-shot examples.

        Args:
            text: The source text to generate flashcards from
            count: Number of flashcards to generate
            difficulty: Optional difficulty level (easy, medium, hard)
            subject: Optional subject category

        Returns:
            Complete prompt string
        """
        difficulty_guidance = ""
        if difficulty:
            difficulty_map = {
                "easy": "Focus on basic concepts and definitions. Use simple language.",
                "medium": "Focus on understanding and application of concepts.",
                "hard": "Focus on analysis, synthesis, and complex relationships."
            }
            difficulty_guidance = difficulty_map.get(difficulty.lower(), "")

        subject_guidance = f"Subject: {subject}\n" if subject else ""

        prompt = f"""Eres un creador de flashcards educativas simples y efectivas para estudio con repetición espaciada.

Tu tarea: crear {count} flashcards SIMPLES del siguiente texto.

{subject_guidance}{difficulty_guidance}

REGLAS IMPORTANTES:
1. Preguntas CORTAS y DIRECTAS (máximo 15 palabras)
2. Respuestas BREVES (1-2 oraciones, máximo 30 palabras)
3. Enfócate en un solo concepto por tarjeta
4. Usa lenguaje simple y claro
5. Dificultad: 1 (muy fácil) a 5 (muy difícil)

EJEMPLOS:

{{
  "question": "¿Qué es la fotosíntesis?",
  "answer": "Proceso donde las plantas usan luz solar para crear energía y oxígeno.",
  "difficulty": 2,
  "tags": ["biología", "plantas"]
}}

{{
  "question": "¿Cuál es la diferencia entre mitosis y meiosis?",
  "answer": "Mitosis crea 2 células idénticas, meiosis crea 4 células diferentes.",
  "difficulty": 3,
  "tags": ["biología", "células"]
}}

TEXTO:
{text}

Genera EXACTAMENTE {count} flashcards. Retorna SOLO el array JSON:
[
  {{
    "question": "...",
    "answer": "...",
    "difficulty": 1-5,
    "tags": ["tag1", "tag2"]
  }}
]
"""
        return prompt

    async def generate_flashcards(
        self,
        text: str,
        count: int = 20,
        difficulty: Optional[str] = None,
        subject: Optional[str] = None,
        ai_confidence: Optional[float] = None
    ) -> List[Dict]:
        """
        Generate flashcards from text using Anthropic Claude.

        Args:
            text: Source text to generate flashcards from
            count: Number of flashcards to generate (default: 20)
            difficulty: Optional difficulty filter (easy, medium, hard)
            subject: Optional subject category for context
            ai_confidence: Optional confidence score to assign (0.0-1.0)

        Returns:
            List of flashcard dictionaries with keys:
                - question: str
                - answer: str
                - explanation: Optional[str]
                - difficulty: int (1-5)
                - tags: List[str]
                - ai_confidence: Optional[float]

        Raises:
            ValueError: If API key is not configured
            Exception: For API errors or malformed responses
        """
        if not self.client:
            raise ValueError(
                "Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable."
            )

        # Validate inputs
        if not text or len(text.strip()) < 50:
            raise ValueError("Text must be at least 50 characters long")

        if count < 1 or count > 100:
            raise ValueError("Count must be between 1 and 100")

        # Build prompt
        prompt = self._build_prompt(text, count, difficulty, subject)

        try:
            logger.info(f"Generating {count} flashcards using {self.model}")

            # Call Anthropic API
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            # Extract content
            content = response.content[0].text

            if not content:
                raise Exception("Empty response from Anthropic API")

            # Parse JSON
            # Try to find JSON array in the response
            content = content.strip()

            # Handle wrapped responses
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            # Parse JSON
            try:
                # Try direct parse first
                flashcards = json.loads(content)
            except json.JSONDecodeError:
                # Try to extract array from object
                data = json.loads(content)
                if isinstance(data, dict):
                    # Look for array in common keys
                    for key in ['flashcards', 'cards', 'items', 'data']:
                        if key in data and isinstance(data[key], list):
                            flashcards = data[key]
                            break
                    else:
                        raise Exception("Could not find flashcards array in response")
                else:
                    flashcards = data

            # Validate response format
            if not isinstance(flashcards, list):
                raise Exception(f"Expected list, got {type(flashcards)}")

            if len(flashcards) == 0:
                raise Exception("No flashcards generated")

            # Validate and normalize each flashcard
            validated_cards = []
            for i, card in enumerate(flashcards):
                if not isinstance(card, dict):
                    logger.warning(f"Skipping invalid card at index {i}: not a dict")
                    continue

                # Required fields
                if 'question' not in card or 'answer' not in card:
                    logger.warning(f"Skipping invalid card at index {i}: missing question or answer")
                    continue

                # Normalize card
                normalized_card = {
                    'question': str(card['question']).strip(),
                    'answer': str(card['answer']).strip(),
                    'explanation': str(card.get('explanation', '')).strip() if card.get('explanation') else None,
                    'difficulty': min(5, max(1, int(card.get('difficulty', 3)))),
                    'tags': card.get('tags', []) if isinstance(card.get('tags'), list) else [],
                }

                # Add AI confidence if provided
                if ai_confidence is not None:
                    normalized_card['ai_confidence'] = float(ai_confidence)
                elif 'ai_confidence' in card:
                    normalized_card['ai_confidence'] = float(card['ai_confidence'])

                validated_cards.append(normalized_card)

            if len(validated_cards) == 0:
                raise Exception("No valid flashcards after validation")

            logger.info(f"Successfully generated {len(validated_cards)} flashcards")
            return validated_cards

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response content: {content}")
            raise Exception(f"Invalid JSON response from AI: {str(e)}")

        except Exception as e:
            logger.error(f"Error generating flashcards: {e}")
            raise


# Singleton instance
openai_service = OpenAIService()
