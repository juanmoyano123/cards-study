"""
PDF Processing Service for extracting text from PDF documents.

Handles PDF text extraction with support for:
- Single and multi-page PDFs
- Text chunking for large documents
- Error handling for corrupted PDFs
"""

from typing import List, Optional
import io
import logging
from PyPDF2 import PdfReader
from PyPDF2.errors import PdfReadError

logger = logging.getLogger(__name__)


class PDFService:
    """
    Service for processing PDF files and extracting text.

    Features:
    - Extract text from PDF bytes
    - Automatic chunking for large documents
    - Page-by-page processing
    - Error handling for corrupted/protected PDFs
    """

    def __init__(self):
        """Initialize the PDF service."""
        self.max_file_size_bytes = 10 * 1024 * 1024  # 10 MB
        self.chunk_size_words = 10000  # Split if more than 10k words

    def extract_text_from_pdf(
        self,
        file_bytes: bytes,
        max_pages: Optional[int] = None
    ) -> str:
        """
        Extract text from a PDF file.

        Args:
            file_bytes: Raw bytes of the PDF file
            max_pages: Optional limit on number of pages to process

        Returns:
            Extracted text as a single string

        Raises:
            ValueError: If file is invalid or too large
            Exception: For PDF processing errors
        """
        # Validate file size
        file_size = len(file_bytes)
        if file_size > self.max_file_size_bytes:
            max_mb = self.max_file_size_bytes / (1024 * 1024)
            raise ValueError(
                f"PDF file is too large ({file_size / (1024*1024):.1f} MB). "
                f"Maximum size is {max_mb:.0f} MB."
            )

        if file_size < 100:
            raise ValueError("File is too small to be a valid PDF")

        try:
            # Create PDF reader from bytes
            pdf_stream = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_stream)

            # Check if PDF is encrypted
            if reader.is_encrypted:
                raise ValueError("PDF is password protected and cannot be processed")

            # Get number of pages
            num_pages = len(reader.pages)
            if num_pages == 0:
                raise ValueError("PDF has no pages")

            logger.info(f"Processing PDF with {num_pages} pages")

            # Limit pages if specified
            pages_to_process = min(num_pages, max_pages) if max_pages else num_pages

            # Extract text from each page
            extracted_text = []
            pages_with_text = 0

            for page_num in range(pages_to_process):
                try:
                    page = reader.pages[page_num]
                    text = page.extract_text()

                    if text and text.strip():
                        extracted_text.append(text)
                        pages_with_text += 1
                    else:
                        logger.warning(f"Page {page_num + 1} contains no extractable text")

                except Exception as e:
                    logger.warning(f"Error extracting text from page {page_num + 1}: {e}")
                    continue

            # Combine all text
            full_text = "\n\n".join(extracted_text)

            if not full_text.strip():
                raise ValueError(
                    "No text could be extracted from the PDF. "
                    "It may be scanned images or use unsupported encoding."
                )

            # Clean up text
            full_text = self._clean_text(full_text)

            logger.info(
                f"Successfully extracted text from {pages_with_text}/{pages_to_process} pages "
                f"({len(full_text)} characters, ~{len(full_text.split())} words)"
            )

            return full_text

        except PdfReadError as e:
            logger.error(f"PDF read error: {e}")
            raise ValueError(f"Invalid or corrupted PDF file: {str(e)}")

        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
            raise

    def _clean_text(self, text: str) -> str:
        """
        Clean extracted text to remove common PDF artifacts.

        Args:
            text: Raw extracted text

        Returns:
            Cleaned text
        """
        if not text:
            return ""

        # Remove null bytes
        text = text.replace('\x00', '')

        # Normalize whitespace
        lines = []
        for line in text.split('\n'):
            line = line.strip()
            if line:
                lines.append(line)

        # Join lines with proper spacing
        text = '\n'.join(lines)

        # Remove excessive newlines (more than 2)
        while '\n\n\n' in text:
            text = text.replace('\n\n\n', '\n\n')

        return text.strip()

    def chunk_text(
        self,
        text: str,
        chunk_size_words: Optional[int] = None
    ) -> List[str]:
        """
        Split text into chunks if it's too long.

        Useful for processing very large documents that exceed token limits.

        Args:
            text: Text to chunk
            chunk_size_words: Words per chunk (default: 10000)

        Returns:
            List of text chunks
        """
        chunk_size = chunk_size_words or self.chunk_size_words

        words = text.split()
        total_words = len(words)

        if total_words <= chunk_size:
            return [text]

        # Split into chunks
        chunks = []
        for i in range(0, total_words, chunk_size):
            chunk_words = words[i:i + chunk_size]
            chunk_text = ' '.join(chunk_words)
            chunks.append(chunk_text)

        logger.info(f"Split text into {len(chunks)} chunks of ~{chunk_size} words each")
        return chunks

    def get_text_stats(self, text: str) -> dict:
        """
        Get statistics about extracted text.

        Args:
            text: Extracted text

        Returns:
            Dictionary with stats: word_count, char_count, estimated_reading_time_minutes
        """
        words = text.split()
        word_count = len(words)
        char_count = len(text)

        # Estimate reading time (average 200-250 words per minute)
        reading_time = max(1, word_count // 225)

        return {
            'word_count': word_count,
            'char_count': char_count,
            'estimated_reading_time_minutes': reading_time
        }


# Singleton instance
pdf_service = PDFService()
