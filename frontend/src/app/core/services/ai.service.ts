import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';
import { AiMessage, AiChatResponse } from '../models/erp.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = environment.apiUrl;


  // Reactive chat state
  messages = signal<AiMessage[]>([]);
  isLoading = signal<boolean>(false);
  isOpen = signal<boolean>(false);

  hasMessages = computed(() => this.messages().length > 0);

  // Role-aware quick prompts shown as chips in the chat panel
  quickPrompts = computed(() => {
    const role = this.authService.userRole();
    switch (role) {
      case 'STUDENT':
        return [
          'Summarize my attendance record',
          'What are some exam preparation tips?',
          'How do I apply for a Bonafide Certificate?',
          'What is the passing marks requirement?',
          'Explain my latest grade result',
        ];
      case 'TEACHER':
        return [
          'Generate a lesson plan for Grade 5 Math',
          'Suggest 5 creative homework ideas',
          'Draft a parent communication template',
          'How do I mark bulk attendance?',
          'Create a quiz for Fractions topic',
        ];
      case 'PRINCIPAL':
        return [
          'Summarize pending leave applications',
          'Draft a school circular template',
          'How to improve student attendance?',
          'Suggest staff performance review criteria',
          'Academic year planning checklist',
        ];
      case 'TRUSTEE':
        return [
          'Analyze fee collection summary',
          'Compare enrollment trends',
          'Suggest infrastructure improvements',
          'How to attract more admissions?',
          'Scholarship program guidelines',
        ];
      case 'CLERK':
        return [
          'Documents required for admission',
          'How to process a TC request?',
          'Draft a fee reminder message',
          'RTE admission eligibility criteria',
          'Follow-up script for visitor leads',
        ];
      default:
        return [
          'Tell me about admission process',
          'What are the school timings?',
          'What facilities does the school have?',
          'How much is the annual fee?',
          'How do I schedule a school visit?',
        ];
    }
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  /** Toggle the AI chat panel open/closed */
  toggleChat() {
    this.isOpen.update(v => !v);
    // Show greeting on first open
    if (this.isOpen() && !this.hasMessages()) {
      this.addWelcomeMessage();
    }
  }

  closeChat() {
    this.isOpen.set(false);
  }

  clearChat() {
    this.messages.set([]);
    this.addWelcomeMessage();
  }

  /** Send a message to the AI backend */
  sendMessage(userMessage: string): void {
    if (!userMessage.trim() || this.isLoading()) return;

    // Add user message to chat
    const userMsg: AiMessage = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isLoading.set(true);

    // Build history for multi-turn context (exclude the current message)
    const history = this.messages()
      .slice(0, -1)
      .slice(-10)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }));

    this.http.post<AiChatResponse>(`${this.apiUrl}/ai/chat/`, {
      message: userMessage.trim(),
      history
    }).pipe(
      catchError(() => of({
        reply: 'I apologize, I\'m having trouble connecting right now. Please try again in a moment or contact the school office at +91 2162 270123.',
        role_context: this.authService.userRole() || 'PUBLIC',
        fallback: true
      }))
    ).subscribe(response => {
      const assistantMsg: AiMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, assistantMsg]);
      this.isLoading.set(false);
    });
  }

  private addWelcomeMessage() {
    const role = this.authService.userRole();
    const userName = this.authService.currentUser()?.first_name;

    let greeting = '';
    if (role === 'STUDENT') {
      greeting = `Namaste${userName ? ` ${userName}` : ''}! 🎓 I'm JupiterAI, your personal school assistant. I can help you with your studies, attendance, results, and certificate requests. What would you like to know?`;
    } else if (role === 'TEACHER') {
      greeting = `Hello${userName ? ` ${userName}` : ''}! 📚 I'm JupiterAI, your teaching assistant. I can help you create lesson plans, draft assessments, and manage your classes. How can I assist you today?`;
    } else if (role === 'PRINCIPAL') {
      greeting = `Good day${userName ? `, ${userName}` : ''}! 🏫 I'm JupiterAI, your executive assistant. I can help you with school management, reports, and academic planning. What do you need?`;
    } else if (role === 'TRUSTEE') {
      greeting = `Namaste${userName ? ` ${userName}` : ''}! 🏛️ I'm JupiterAI, your strategic advisor. I can help analyze school performance, finances, and governance matters. How can I assist?`;
    } else if (role === 'CLERK') {
      greeting = `Hello${userName ? ` ${userName}` : ''}! 📋 I'm JupiterAI, your admin assistant. I can help with admission processing, document requests, and visitor follow-ups. What do you need help with?`;
    } else {
      greeting = `Namaste! 🙏 Welcome to Jupiter English Medium School, Shendre Satara. I'm JupiterAI and I'm here to answer all your questions about our school, admissions, and facilities!`;
    }

    this.messages.set([{
      role: 'assistant',
      content: greeting,
      timestamp: new Date()
    }]);
  }
}
