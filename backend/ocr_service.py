import os
import uuid
import base64
import re
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

SYSTEM_PROMPT = """You are a mathematical equation OCR system. Your ONLY job is to transcribe EXACTLY what you see in the image.

CRITICAL RULES:
1. ONLY transcribe what is ACTUALLY VISIBLE in the image
2. DO NOT guess, assume, or complete equations
3. DO NOT add mathematical formulas that are not written
4. If you see "f(x)=2", return EXACTLY: f(x) = 2
5. If you see "x+1", return EXACTLY: x + 1
6. Return ONLY the LaTeX code, no explanations
7. Do not include $ symbols or delimiters
8. If unclear, transcribe your best interpretation of the VISIBLE marks
9. NEVER invent or hallucinate content that is not in the image

You are a transcription tool, NOT a math solver. Just read and transcribe."""

async def recognize_equation(image_base64: str) -> dict:
    """
    Recognize mathematical equation from base64 encoded image using Gemini Vision.
    
    Args:
        image_base64: Base64 encoded image string (may include data URI prefix)
    
    Returns:
        dict with latex, confidence, and formats
    """
    if not EMERGENT_LLM_KEY:
        raise ValueError("EMERGENT_LLM_KEY not configured")
    
    # Remove data URI prefix if present
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    # Create unique session for this recognition
    session_id = f"ocr-{uuid.uuid4()}"
    
    # Initialize chat with GPT-4 Vision (more accurate for OCR)
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=SYSTEM_PROMPT
    ).with_model("openai", "gpt-4o")
    
    # Create image content
    image_content = ImageContent(image_base64=image_base64)
    
    # Create message with image
    user_message = UserMessage(
        text="Transcribe EXACTLY what is written in this image. Do not interpret, solve, or add anything. Just read the handwritten text/equation and convert to LaTeX. If you see 'f(x)=2' write 'f(x) = 2'. Only output what you literally see.",
        file_contents=[image_content]
    )
    
    try:
        # Send to Gemini Vision
        response = await chat.send_message(user_message)
        
        latex = response.strip()
        
        # Check if unrecognized
        if latex == "UNRECOGNIZED" or not latex:
            return {
                "latex": "",
                "confidence": 0.0,
                "formats": {
                    "latex": "",
                    "mathml": "",
                    "asciimath": "",
                    "text": "Could not recognize equation"
                },
                "error": "Could not recognize mathematical content in the image"
            }
        
        # Clean up LaTeX (remove any accidental delimiters)
        latex = latex.replace('$', '').replace('\\[', '').replace('\\]', '').strip()
        
        # Generate different formats
        formats = generate_formats(latex)
        
        return {
            "latex": latex,
            "confidence": 0.95,  # Gemini doesn't provide confidence, use high default
            "formats": formats
        }
        
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        return {
            "latex": "",
            "confidence": 0.0,
            "formats": {
                "latex": "",
                "mathml": "",
                "asciimath": "",
                "text": f"Error: {str(e)}"
            },
            "error": str(e)
        }


def generate_formats(latex: str) -> dict:
    """Generate different output formats from LaTeX."""
    
    # Simple AsciiMath conversion (basic)
    asciimath = latex
    asciimath = asciimath.replace('\\frac{', '(').replace('}{', ')/(').replace('}', ')')
    asciimath = asciimath.replace('\\sqrt{', 'sqrt(').replace('\\pm', '+-')
    asciimath = asciimath.replace('\\int', 'int').replace('\\sum', 'sum')
    asciimath = asciimath.replace('\\infty', 'oo').replace('\\pi', 'pi')
    asciimath = asciimath.replace('\\alpha', 'alpha').replace('\\beta', 'beta')
    asciimath = asciimath.replace('\\theta', 'theta').replace('\\lambda', 'lambda')
    asciimath = re.sub(r'\\([a-zA-Z]+)', r'\1', asciimath)
    
    # Basic MathML wrapper
    mathml = f'<math xmlns="http://www.w3.org/1998/Math/MathML"><annotation encoding="LaTeX">{latex}</annotation></math>'
    
    # Text description (simple)
    text = latex
    text = text.replace('\\frac', ' fraction ').replace('{', '(').replace('}', ')')
    text = text.replace('\\sqrt', 'square root of ')
    text = text.replace('^', ' to the power of ')
    text = text.replace('_', ' subscript ')
    text = text.replace('\\int', 'integral ').replace('\\sum', 'sum ')
    text = text.replace('\\infty', 'infinity').replace('\\pi', 'pi')
    text = text.replace('\\pm', 'plus or minus')
    text = re.sub(r'\\([a-zA-Z]+)', r'\1', text)
    text = ' '.join(text.split())  # Clean up whitespace
    
    return {
        "latex": latex,
        "mathml": mathml,
        "asciimath": asciimath,
        "text": text
    }
