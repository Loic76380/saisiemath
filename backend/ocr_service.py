import os
import uuid
import base64
import re
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

SYSTEM_PROMPT = """You are an OCR transcription system. Your ONLY task is to transcribe handwritten text to LaTeX.

ABSOLUTE RULES - FOLLOW EXACTLY:
1. Output ONLY what you literally see drawn in the image
2. DO NOT complete, interpret, or guess equations
3. DO NOT output famous mathematical formulas
4. If you see a partial equation like "f(x)=" with nothing after, output: f(x) =
5. If you see squiggly lines, output what they look like: maybe "f" or "x" or "="
6. NEVER output derivatives, integrals, or sums unless they are CLEARLY drawn
7. A vertical line with a hook is "f", not a derivative symbol
8. Two horizontal lines is "=", not anything else

Examples:
- Handwritten "f(x)=2" → output: f(x) = 2
- Handwritten "x+y" → output: x + y
- Handwritten squiggle that looks like "a" → output: a
- Unclear marks → output: UNCLEAR

You are a TRANSCRIPTION tool. Just read the pixels and output text. Do not think mathematically."""

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
    
    # Initialize chat with GPT-5.2 (latest, most accurate)
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=SYSTEM_PROMPT
    ).with_model("openai", "gpt-4.1")
    
    # Create image content
    image_content = ImageContent(image_base64=image_base64)
    
    # Create message with image - very explicit instruction
    user_message = UserMessage(
        text="""Look at this handwritten image. 
DO NOT recognize it as a known formula.
DO NOT output derivatives, integrals, or famous equations.
Just transcribe the EXACT shapes you see as letters and symbols.
If you see "f(x)=√" then output "f(x) = \\sqrt{}"
Output ONLY the literal transcription, nothing else.""",
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
