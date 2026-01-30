import os
import uuid
import base64
import re
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

SYSTEM_PROMPT = """You are a mathematical equation recognition expert. Your task is to analyze images containing handwritten or printed mathematical equations and convert them to LaTeX format.

IMPORTANT RULES:
1. Return ONLY the LaTeX code for the equation, nothing else
2. Do not include $ symbols or \\[ \\] delimiters
3. If you see multiple equations, return them separated by newlines
4. If the image is unclear or doesn't contain math, return "UNRECOGNIZED"
5. Be precise with fractions (\\frac{}{}), exponents (^), subscripts (_), Greek letters, integrals (\\int), sums (\\sum), etc.

Examples of correct output:
- For quadratic formula: x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
- For Euler's identity: e^{i\\pi} + 1 = 0
- For integral: \\int_a^b f(x) dx = F(b) - F(a)
"""

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
    
    # Initialize chat with Gemini Vision
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=SYSTEM_PROMPT
    ).with_model("gemini", "gemini-2.0-flash")
    
    # Create image content
    image_content = ImageContent(image_base64=image_base64)
    
    # Create message with image
    user_message = UserMessage(
        text="Analyze this image and extract the mathematical equation. Return only the LaTeX code.",
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
