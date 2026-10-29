"""
AI Chat endpoint powered by Google Gemini.
Provides role-aware school assistant for students, teachers, staff, and public users.
"""
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.throttling import UserRateThrottle
from django.conf import settings

from .models import RoleChoices


class AIChatThrottle(UserRateThrottle):
    rate = '20/min'
    scope = 'ai_chat'


# Role-specific system prompts for the Gemini AI assistant
ROLE_SYSTEM_PROMPTS = {
    RoleChoices.STUDENT: """You are JupiterAI, a friendly and helpful school assistant for students at 
Jupiter English Medium School, Shendre, Satara, Maharashtra. 
You help students with:
- Homework questions and study tips
- Understanding exam results and grades
- Explaining attendance records
- Answering questions about school events, timetable, and fee receipts
- Providing study strategies and motivational support
- Answering general knowledge questions related to their curriculum (Mini KG to Grade 10)

Keep answers concise, encouraging, and age-appropriate. 
Use simple language. If a student asks about personal data (fees, marks), 
remind them to check their portal tabs.
School contact: +91 2162 270123 | info@jupiterschoolsatara.org""",

    RoleChoices.TEACHER: """You are JupiterAI, an intelligent teaching assistant for faculty at 
Jupiter English Medium School, Shendre, Satara.
You help teachers with:
- Generating lesson plans and activity ideas
- Creating quiz questions and assessment rubrics
- Explaining student performance patterns
- Suggesting differentiated teaching strategies
- Drafting parent communication templates
- Providing curriculum alignment advice (CBSE / State Board)
- Homework ideas for different grade levels

Be professional, precise, and pedagogically sound.""",

    RoleChoices.PRINCIPAL: """You are JupiterAI, an executive assistant for the Principal of 
Jupiter English Medium School, Shendre, Satara.
You help the Principal with:
- Summarising school performance data and trends
- Drafting official circulars, notices, and memos
- Providing insights on leave management and attendance patterns
- Academic year planning and event scheduling suggestions
- Staff performance review templates
- Compliance and regulatory guidance for Maharashtra schools
- Communication with parents, trustees, and government bodies

Be professional, data-driven, and strategic in your responses.""",

    RoleChoices.TRUSTEE: """You are JupiterAI, a strategic advisor for the Trustees of Jupiter Education Trust, 
operating Jupiter English Medium School, Shendre, Satara.
You assist with:
- Financial analysis and fee collection insights
- Enrollment trend analysis and projections
- Infrastructure investment recommendations
- Benchmarking against other schools in Satara district
- Governance and compliance matters
- Strategic planning for school growth
- Grant and scholarship program guidance

Provide executive-level, concise, and actionable insights.""",

    RoleChoices.CLERK: """You are JupiterAI, an administrative assistant for Clerk staff at 
Jupiter English Medium School, Shendre, Satara.
You help clerks with:
- Processing admission applications and required documents checklist
- Fee collection procedures and receipt generation guidance
- Document request processing (Bonafide, TC, LC certificates)
- Visitor lead follow-up scripts and communication templates
- RTE admission compliance guidance
- Record-keeping best practices
- Contact message response drafts

Be practical, procedural, and detail-oriented.""",

    'PUBLIC': """You are JupiterAI, a public-facing assistant for Jupiter English Medium School, 
Shendre, Satara, Maharashtra (NH-4 Highway, Satara 415001).
You help prospective parents and visitors with:
- Admission procedures and eligibility for 2026-27
- Fee structure information (₹45,000 per year for most grades)
- School facilities: Smart classrooms, STEM labs, library, sports complex
- Academic curriculum: Mini KG to Grade 10 (English Medium)
- School timings, holidays, and calendar
- Contact information: +91 2162 270123 | info@jupiterschoolsatara.org
- How to schedule a school visit

Be warm, welcoming, and informative. Encourage school visits."""
}


class AIChatView(APIView):
    """
    POST /api/ai/chat/
    Body: { "message": "...", "history": [...] }
    Returns: { "reply": "...", "role_context": "..." }
    """
    throttle_classes = [AIChatThrottle]

    def get_permissions(self):
        # Both authenticated and anonymous users can use the AI chat
        return [permissions.AllowAny()]

    def post(self, request):
        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])  # List of {role, parts} dicts

        if not message:
            return Response(
                {'error': 'Message is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(message) > 2000:
            return Response(
                {'error': 'Message too long. Maximum 2000 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine role context
        if request.user and request.user.is_authenticated:
            user_role = request.user.role
            role_context = user_role
        else:
            user_role = 'PUBLIC'
            role_context = 'PUBLIC'

        system_prompt = ROLE_SYSTEM_PROMPTS.get(user_role, ROLE_SYSTEM_PROMPTS['PUBLIC'])

        # Check Gemini API key
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            # Graceful fallback if no API key configured
            return self._fallback_response(message, role_context)

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)

            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=system_prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'max_output_tokens': 1024,
                }
            )

            # Build conversation history for multi-turn chat
            chat_history = []
            for entry in history[-10:]:  # Keep last 10 turns for context
                role = entry.get('role', 'user')
                content = entry.get('content', '')
                if role in ('user', 'model') and content:
                    chat_history.append({'role': role, 'parts': [content]})

            chat = model.start_chat(history=chat_history)
            response = chat.send_message(message)
            reply_text = response.text

        except ImportError:
            return self._fallback_response(message, role_context)
        except Exception as e:
            # Log error but return graceful fallback
            error_msg = str(e)
            if 'API_KEY_INVALID' in error_msg or 'PERMISSION_DENIED' in error_msg:
                return Response(
                    {'error': 'AI service is currently unavailable. Please check the API key configuration.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            return self._fallback_response(message, role_context)

        return Response({
            'reply': reply_text,
            'role_context': role_context,
        })

    def _fallback_response(self, message: str, role_context: str) -> Response:
        """
        Graceful fallback when Gemini API is unavailable.
        Provides helpful static responses for common queries.
        """
        message_lower = message.lower()

        # Common FAQ responses
        if any(w in message_lower for w in ['admission', 'apply', 'enroll', 'join']):
            reply = ("For admissions at Jupiter English Medium School, please fill the online form "
                     "at /admissions or call +91 2162 270123. "
                     "We admit students from Mini KG to Grade 10.")
        elif any(w in message_lower for w in ['fee', 'fees', 'payment', 'cost']):
            reply = ("Our annual fees are approximately ₹45,000 for most grade levels. "
                     "Fee details vary by class. Please contact our office at +91 2162 270123 "
                     "or visit the Fee Receipts tab in your portal.")
        elif any(w in message_lower for w in ['contact', 'phone', 'email', 'address']):
            reply = ("📞 Phone: +91 2162 270123 / +91 98220 12345\n"
                     "📧 Email: info@jupiterschoolsatara.org\n"
                     "📍 NH-4 Highway, Shendre, Satara, Maharashtra 415001")
        elif any(w in message_lower for w in ['hello', 'hi', 'hey', 'namaste']):
            reply = (f"Namaste! 🙏 I am JupiterAI, your school assistant at Jupiter English Medium School, Shendre Satara. "
                     f"How can I help you today?")
        elif any(w in message_lower for w in ['attendance', 'absent', 'present']):
            reply = ("You can view your full attendance record in the Attendance tab of your student portal. "
                     "For any attendance discrepancies, please contact your class teacher.")
        elif any(w in message_lower for w in ['certificate', 'bonafide', 'tc', 'leaving']):
            reply = ("To apply for certificates (Bonafide, Transfer Certificate, etc.), "
                     "go to the Certificates tab in your student portal and submit a request. "
                     "Approved certificates can be downloaded as PDF.")
        else:
            reply = ("I'm JupiterAI, your school assistant! 🏫 I can help you with:\n"
                     "• Admission queries\n"
                     "• Fee information\n"
                     "• School timings & events\n"
                     "• Certificate requests\n"
                     "• Contact information\n\n"
                     "For detailed assistance, please configure the Gemini API key or "
                     "contact us at +91 2162 270123.")

        return Response({
            'reply': reply,
            'role_context': role_context,
            'fallback': True,
        })
