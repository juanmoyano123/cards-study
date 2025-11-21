"""
OpenAI Service for AI-powered flashcard generation.

Uses GPT-4o-mini for cost-efficient flashcard generation from study materials.
"""

import os
import json
from typing import List, Dict, Optional
from openai import AsyncOpenAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class OpenAIService:
    """
    Service for generating flashcards using OpenAI's GPT models.

    Features:
    - Cost-efficient generation using gpt-4o-mini
    - Few-shot prompting for high-quality cards
    - Structured JSON output format
    - Error handling and retry logic
    """

    def __init__(self):
        """Initialize the OpenAI client."""
        api_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", None)

        if not api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = AsyncOpenAI(api_key=api_key)

        # Model configuration
        self.model = "gpt-4o-mini"
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

        prompt = f"""You are an expert educational content creator specializing in creating high-quality flashcards for spaced repetition learning.

Your task is to analyze the provided text and generate {count} flashcards that will help students master the material.

{subject_guidance}{difficulty_guidance}

GUIDELINES:
1. Each flashcard should focus on ONE specific concept, fact, or relationship
2. Questions should be clear, specific, and unambiguous
3. Answers should be concise but complete (2-4 sentences ideal)
4. Use active recall principles - make students retrieve information
5. Include context clues in questions when needed
6. Vary question types: definitions, explanations, applications, comparisons
7. Assign difficulty: 1 (very easy) to 5 (very hard)
8. Suggest relevant tags for categorization

FEW-SHOT EXAMPLES:

Example 1 (Definition):
{{
  "question": "What is photosynthesis?",
  "answer": "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of glucose.",
  "explanation": "This is a fundamental biological process that occurs in chloroplasts.",
  "difficulty": 2,
  "tags": ["biology", "plants", "energy"]
}}

Example 2 (Application):
{{
  "question": "How does the SOLID principle of Single Responsibility apply to class design in software engineering?",
  "answer": "The Single Responsibility Principle states that a class should have only one reason to change, meaning it should have only one job or responsibility. This makes code more maintainable and easier to test.",
  "explanation": "This principle helps reduce coupling and increase cohesion in codebases.",
  "difficulty": 4,
  "tags": ["software engineering", "SOLID", "design patterns"]
}}

Example 3 (Comparison):
{{
  "question": "What is the key difference between mitosis and meiosis?",
  "answer": "Mitosis produces two identical diploid cells for growth and repair, while meiosis produces four non-identical haploid cells (gametes) for sexual reproduction.",
  "explanation": "Both are types of cell division but serve different purposes in organisms.",
  "difficulty": 3,
  "tags": ["biology", "cell division", "genetics"]
}}

SOURCE TEXT:
{text}

Generate exactly {count} flashcards following the format above. Return ONLY a valid JSON array with no additional text:
[
  {{
    "question": "...",
    "answer": "...",
    "explanation": "..." (optional),
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
        Generate flashcards from text using OpenAI.

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
                "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
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

            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert educational content creator. You generate high-quality flashcards in JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"} if self.model != "gpt-4o-mini" else None
            )

            # Extract content
            content = response.choices[0].message.content

            if not content:
                raise Exception("Empty response from OpenAI API")

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
                    'explanation': str(card.get('explanation', '')).strip() or None,
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
