"""Simple language detection service (fallback)."""
import re
from typing import Dict


class LanguageDetector:
    """Simple rule-based language detection as fallback."""
    
    # Common words in different languages
    LANGUAGE_PATTERNS = {
        "en": [
            r"\b(the|and|or|but|in|on|at|to|for|of|with|by)\b",
            r"\b(is|are|was|were|have|has|had|will|would|could|should)\b"
        ],
        "es": [
            r"\b(el|la|los|las|de|del|en|con|por|para|que|es|son)\b",
            r"\b(está|están|tiene|tienen|hace|hacer|ser|estar)\b"
        ],
        "fr": [
            r"\b(le|la|les|de|du|des|en|dans|avec|pour|que|est|sont)\b",
            r"\b(être|avoir|faire|aller|pouvoir|vouloir|savoir)\b"
        ],
        "de": [
            r"\b(der|die|das|den|dem|des|ein|eine|einen|einem|einer)\b",
            r"\b(ist|sind|war|waren|haben|hat|hatte|wird|werden)\b"
        ],
        "it": [
            r"\b(il|la|lo|gli|le|di|del|della|in|con|per|che|è|sono)\b",
            r"\b(essere|avere|fare|andare|potere|volere|sapere)\b"
        ],
        "pt": [
            r"\b(o|a|os|as|de|do|da|dos|das|em|com|por|para|que|é|são)\b",
            r"\b(ser|estar|ter|haver|fazer|ir|poder|querer|saber)\b"
        ]
    }
    
    def detect_language(self, text: str) -> str:
        """
        Detect language using simple pattern matching.
        
        Args:
            text: Text to analyze
            
        Returns:
            Language code (e.g., "en", "es") or "auto" if unknown
        """
        if not text or len(text.strip()) < 10:
            return "auto"
        
        text = text.lower()
        scores: Dict[str, int] = {}
        
        for lang, patterns in self.LANGUAGE_PATTERNS.items():
            score = 0
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                score += len(matches)
            scores[lang] = score
        
        if not scores or max(scores.values()) == 0:
            return "auto"
        
        # Return language with highest score
        detected_lang = max(scores, key=scores.get)
        
        # Only return detection if confidence is reasonable
        if scores[detected_lang] >= 2:
            return detected_lang
        
        return "auto"


# Global detector instance
detector = LanguageDetector()