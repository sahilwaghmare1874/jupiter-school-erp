import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../core/services/ai.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- AI CHAT BUBBLE (Floating Button) -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="ai-bubble-wrapper">
      <!-- Unread indicator -->
      @if (!aiService.isOpen() && aiService.hasMessages()) {
        <span class="ai-unread-dot"></span>
      }

      <!-- Floating trigger button -->
      <button
        class="ai-bubble-btn"
        (click)="aiService.toggleChat()"
        [attr.aria-label]="aiService.isOpen() ? 'Close AI Assistant' : 'Open AI Assistant'"
        title="JupiterAI — School Assistant"
      >
        @if (aiService.isOpen()) {
          <i class="fa-solid fa-xmark fs-5"></i>
        } @else {
          <i class="fa-solid fa-robot fs-4"></i>
        }
      </button>

      <!-- Tooltip on first render -->
      @if (!aiService.isOpen() && !aiService.hasMessages()) {
        <div class="ai-tooltip">
          <span>Ask JupiterAI ✨</span>
        </div>
      }
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- AI CHAT PANEL -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    @if (aiService.isOpen()) {
      <div class="ai-chat-panel">
        <!-- Panel Header -->
        <div class="ai-panel-header">
          <div class="d-flex align-items-center gap-2">
            <div class="ai-avatar">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div>
              <div class="fw-bold text-white" style="font-size:0.9rem">JupiterAI</div>
              <div class="text-white-50" style="font-size:0.7rem">
                <i class="fa-solid fa-circle text-success me-1" style="font-size:0.45rem"></i>
                Powered by Google Gemini
              </div>
            </div>
          </div>
          <div class="d-flex gap-1">
            <button class="ai-header-btn" (click)="aiService.clearChat()" title="Clear chat">
              <i class="fa-solid fa-rotate-right fa-sm"></i>
            </button>
            <button class="ai-header-btn" (click)="aiService.closeChat()" title="Close">
              <i class="fa-solid fa-xmark fa-sm"></i>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="ai-messages-area" #messagesContainer>
          @for (msg of aiService.messages(); track msg.timestamp) {
            <div class="ai-message-row" [class.user-row]="msg.role === 'user'">
              <!-- Assistant avatar -->
              @if (msg.role === 'assistant') {
                <div class="ai-msg-avatar">
                  <i class="fa-solid fa-robot"></i>
                </div>
              }

              <!-- Message bubble -->
              <div class="ai-bubble" [class.ai-bubble-user]="msg.role === 'user'" [class.ai-bubble-assistant]="msg.role === 'assistant'">
                <p class="mb-0" style="white-space: pre-wrap; font-size: 0.85rem">{{ msg.content }}</p>
                <div class="ai-time">{{ formatTime(msg.timestamp) }}</div>
              </div>
            </div>
          }

          <!-- Typing indicator -->
          @if (aiService.isLoading()) {
            <div class="ai-message-row">
              <div class="ai-msg-avatar">
                <i class="fa-solid fa-robot"></i>
              </div>
              <div class="ai-bubble ai-bubble-assistant">
                <div class="ai-typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Quick Prompt Chips -->
        @if (aiService.messages().length <= 1 && !aiService.isLoading()) {
          <div class="ai-quick-prompts">
            <div class="ai-quick-label">
              <i class="fa-solid fa-bolt-lightning text-warning me-1"></i>
              Quick questions
            </div>
            <div class="d-flex flex-wrap gap-1">
              @for (prompt of aiService.quickPrompts(); track prompt) {
                <button class="ai-chip" (click)="sendQuickPrompt(prompt)">
                  {{ prompt }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Input Area -->
        <div class="ai-input-area">
          <div class="ai-input-row">
            <textarea
              class="ai-textarea"
              [(ngModel)]="userInput"
              placeholder="Ask anything about Jupiter School..."
              rows="1"
              (keydown.enter)="$event.preventDefault(); onSend()"
              (input)="autoResize($event)"
              [disabled]="aiService.isLoading()"
            ></textarea>
            <button
              class="ai-send-btn"
              (click)="onSend()"
              [disabled]="!userInput.trim() || aiService.isLoading()"
              title="Send message"
            >
              @if (aiService.isLoading()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i>
              } @else {
                <i class="fa-solid fa-paper-plane"></i>
              }
            </button>
          </div>
          <div class="ai-footer-note">
            JupiterAI · Jupiter English Medium School, Shendre Satara
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Floating Bubble ─────────────────────────────────────────────────── */
    .ai-bubble-wrapper {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 1050;
    }

    .ai-bubble-btn {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0d233a 0%, #1a4a7a 100%);
      border: 2px solid rgba(212, 175, 55, 0.6);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(13, 35, 58, 0.45);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .ai-bubble-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(13, 35, 58, 0.6);
    }

    .ai-unread-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid #fff;
      animation: pulse-dot 1.5s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }

    .ai-tooltip {
      position: absolute;
      bottom: 70px;
      right: 0;
      background: #0d233a;
      color: #fff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      white-space: nowrap;
      box-shadow: 0 3px 12px rgba(0,0,0,0.2);
      border: 1px solid rgba(212,175,55,0.4);
      animation: slide-up 0.3s ease;
    }

    .ai-tooltip::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 22px;
      width: 12px;
      height: 12px;
      background: #0d233a;
      transform: rotate(45deg);
      border-right: 1px solid rgba(212,175,55,0.4);
      border-bottom: 1px solid rgba(212,175,55,0.4);
    }

    /* ── Chat Panel ──────────────────────────────────────────────────────── */
    .ai-chat-panel {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 370px;
      max-height: 560px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 12px 50px rgba(13, 35, 58, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 1049;
      animation: slide-up 0.25s ease;
      border: 1px solid #e2e8f0;
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 480px) {
      .ai-chat-panel {
        width: calc(100vw - 24px);
        right: 12px;
        bottom: 90px;
      }
    }

    /* ── Panel Header ─────────────────────────────────────────────────────  */
    .ai-panel-header {
      background: linear-gradient(135deg, #0d233a 0%, #1a4a7a 100%);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ai-avatar {
      width: 36px;
      height: 36px;
      background: rgba(212, 175, 55, 0.2);
      border: 1.5px solid rgba(212, 175, 55, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #D4AF37;
      font-size: 1rem;
    }

    .ai-header-btn {
      background: rgba(255,255,255,0.1);
      border: none;
      color: rgba(255,255,255,0.8);
      width: 28px;
      height: 28px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .ai-header-btn:hover {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }

    /* ── Messages Area ────────────────────────────────────────────────────  */
    .ai-messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 200px;
      max-height: 280px;
      background: #f8fafc;
    }

    .ai-message-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .user-row {
      flex-direction: row-reverse;
    }

    .ai-msg-avatar {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #0d233a, #1a4a7a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #D4AF37;
      font-size: 0.7rem;
      flex-shrink: 0;
    }

    .ai-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      line-height: 1.4;
    }

    .ai-bubble-assistant {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
      color: #1e293b;
    }

    .ai-bubble-user {
      background: linear-gradient(135deg, #0d233a, #1a4a7a);
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .ai-time {
      font-size: 0.65rem;
      opacity: 0.5;
      margin-top: 4px;
    }

    /* ── Typing Indicator ─────────────────────────────────────────────────  */
    .ai-typing-dots {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 4px 0;
    }

    .ai-typing-dots span {
      width: 7px;
      height: 7px;
      background: #94a3b8;
      border-radius: 50%;
      animation: bounce 1.2s infinite ease-in-out;
    }

    .ai-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-6px); }
    }

    /* ── Quick Prompts ────────────────────────────────────────────────────  */
    .ai-quick-prompts {
      padding: 10px 14px;
      border-top: 1px solid #f1f5f9;
      background: #fff;
    }

    .ai-quick-label {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }

    .ai-chip {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 0.72rem;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .ai-chip:hover {
      background: #0d233a;
      color: #fff;
      border-color: #0d233a;
    }

    /* ── Input Area ───────────────────────────────────────────────────────  */
    .ai-input-area {
      padding: 12px 14px 10px;
      border-top: 1px solid #e2e8f0;
      background: #fff;
    }

    .ai-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .ai-textarea {
      flex: 1;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 9px 13px;
      font-size: 0.85rem;
      resize: none;
      outline: none;
      line-height: 1.4;
      max-height: 90px;
      overflow-y: auto;
      color: #1e293b;
      transition: border-color 0.2s;
    }

    .ai-textarea:focus {
      border-color: #0d233a;
    }

    .ai-textarea:disabled {
      background: #f8fafc;
      opacity: 0.7;
    }

    .ai-send-btn {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0d233a, #1a4a7a);
      border: none;
      border-radius: 10px;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.1s;
    }

    .ai-send-btn:hover:not(:disabled) { transform: scale(1.05); }
    .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .ai-footer-note {
      font-size: 0.62rem;
      color: #94a3b8;
      text-align: center;
      margin-top: 6px;
    }
  `]
})
export class AiAssistantComponent implements AfterViewChecked {
  aiService = inject(AiService);
  userInput = '';

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  onSend() {
    if (!this.userInput.trim() || this.aiService.isLoading()) return;
    const msg = this.userInput;
    this.userInput = '';
    this.aiService.sendMessage(msg);
  }

  sendQuickPrompt(prompt: string) {
    this.aiService.sendMessage(prompt);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 90) + 'px';
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch {}
  }
}
